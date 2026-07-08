import { EventEmitter } from "node:events";
import { closeSync, existsSync, openSync, readSync, statSync } from "node:fs";
import { locateSessionTranscript } from "./sessionLocator";

const TAIL_BYTES = 128 * 1024;
const IDLE_RERESOLVE_MS = 90_000;
const POLL_MS = 500;

export interface ParsedTurn {
  tool: string;
  /** True once the latest assistant turn has ended (stop_reason set and not
   *  "tool_use"); false while a turn or tool call is still in flight. */
  done: boolean;
}

/** Parse the tail of a Claude Code JSONL transcript into the latest turn's
 *  state. Pure and synchronous so it's unit-testable without touching the
 *  filesystem. Walks newest-to-oldest: the first assistant line decides
 *  `done`, the first tool_use block is the current/most-recent tool. Mirrors
 *  the transcript format Claude Code itself writes
 *  (`message.stop_reason`, `message.content[].type === "tool_use"`). */
export function parseTranscriptTail(text: string, isPartialRead: boolean): ParsedTurn | null {
  const lines = text.split("\n");
  // A partial (mid-file) read may slice the first line — drop it. A full
  // read has no partial line: keep everything.
  if (isPartialRead) lines.shift();

  let tool = "";
  let done: boolean | null = null;
  let pendingUserAfterAssistant = false;

  for (let i = lines.length - 1; i >= 0; i--) {
    const line = lines[i];
    if (!line) continue;
    let record: Record<string, unknown>;
    try {
      record = JSON.parse(line);
    } catch {
      continue;
    }
    const message = record.message as Record<string, unknown> | undefined;

    if (done === null && record.type === "user") {
      pendingUserAfterAssistant = true;
      continue;
    }
    if (record.type === "assistant" && message) {
      if (done === null) {
        if (pendingUserAfterAssistant) {
          // A fresh user prompt after the latest assistant line means the
          // next response hasn't landed yet — treat it as active.
          done = false;
        } else {
          const stopReason = message.stop_reason as string | null | undefined;
          done = !!stopReason && stopReason !== "tool_use";
        }
      }
      if (!tool && Array.isArray(message.content)) {
        for (const block of message.content as Array<Record<string, unknown>>) {
          if (block && block.type === "tool_use" && typeof block.name === "string") {
            tool = block.name;
            break;
          }
        }
      }
    }
    if (tool && done !== null) break;
  }

  if (done === null && pendingUserAfterAssistant) done = false;
  if (!tool && done === null) return null;
  return { tool, done: done === true };
}

/** Read-only tail read of a transcript file (last ~128KB). Never writes,
 *  never throws — a missing/unreadable file yields null. */
export function readTranscriptTail(
  path: string,
): { text: string; partial: boolean } | null {
  try {
    if (!existsSync(path)) return null;
    const size = statSync(path).size;
    const want = Math.min(size, TAIL_BYTES);
    if (want === 0) return null;
    const fd = openSync(path, "r");
    let text: string;
    try {
      const buf = Buffer.alloc(want);
      readSync(fd, buf, 0, want, size - want);
      text = buf.toString("utf8");
    } finally {
      closeSync(fd);
    }
    return { text, partial: want < size };
  } catch {
    return null;
  }
}

export interface TranscriptWatcherEvents {
  start: () => void;
  stop: (elapsedMs: number) => void;
}

/** Polls the newest Claude Code transcript and emits `start`/`stop` when a
 *  turn begins/ends generating — the safe, read-only "AI is thinking right
 *  now" signal (never touches any installed extension's files, only a log
 *  Claude Code already writes for itself). */
export class TranscriptWatcher extends EventEmitter {
  private timer: ReturnType<typeof setInterval> | null = null;
  private path: string | null = null;
  private generating = false;
  private startedAt = 0;

  constructor(private readonly getWorkspacePath: () => string | undefined) {
    super();
  }

  override on<E extends keyof TranscriptWatcherEvents>(
    event: E,
    listener: TranscriptWatcherEvents[E],
  ): this {
    return super.on(event, listener as (...args: unknown[]) => void);
  }

  start(): void {
    if (this.timer) return;
    this.timer = setInterval(() => this.tick(), POLL_MS);
  }

  stop(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  private resolvePath(): string | null {
    if (this.path) {
      try {
        const age = Date.now() - statSync(this.path).mtimeMs;
        if (age <= IDLE_RERESOLVE_MS) return this.path;
      } catch {
        // fall through to re-resolve
      }
    }
    this.path = locateSessionTranscript(this.getWorkspacePath());
    return this.path;
  }

  private tick(): void {
    const path = this.resolvePath();
    if (!path) return;
    const tail = readTranscriptTail(path);
    if (!tail) return;
    const parsed = parseTranscriptTail(tail.text, tail.partial);
    if (!parsed) return;

    const nowGenerating = !parsed.done;
    if (nowGenerating && !this.generating) {
      this.generating = true;
      this.startedAt = Date.now();
      this.emit("start");
    } else if (!nowGenerating && this.generating) {
      this.generating = false;
      this.emit("stop", Date.now() - this.startedAt);
    }
  }
}
