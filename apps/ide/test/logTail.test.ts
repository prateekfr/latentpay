import { describe, expect, it } from "vitest";
import { parseTranscriptTail } from "../src/activity/logTail";

function line(obj: unknown): string {
  return JSON.stringify(obj);
}

describe("parseTranscriptTail", () => {
  it("reports done=false while the assistant is mid tool_use", () => {
    const text = [
      line({ type: "user", message: { content: "hi" } }),
      line({
        type: "assistant",
        message: { stop_reason: "tool_use", content: [{ type: "tool_use", name: "Bash" }] },
      }),
    ].join("\n");
    expect(parseTranscriptTail(text, false)).toEqual({ tool: "Bash", done: false });
  });

  it("reports done=true once the assistant turn ends", () => {
    const text = line({
      type: "assistant",
      message: { stop_reason: "end_turn", content: [{ type: "text", text: "done" }] },
    });
    expect(parseTranscriptTail(text, false)).toEqual({ tool: "", done: true });
  });

  it("treats a fresh user prompt after the last assistant turn as active", () => {
    const text = [
      line({ type: "assistant", message: { stop_reason: "end_turn", content: [] } }),
      line({ type: "user", message: { content: "next question" } }),
    ].join("\n");
    expect(parseTranscriptTail(text, false)?.done).toBe(false);
  });

  it("drops a truncated first line on a partial read", () => {
    const text = [
      '{"broken json fragment from mid-line read',
      line({ type: "assistant", message: { stop_reason: "end_turn", content: [] } }),
    ].join("\n");
    expect(parseTranscriptTail(text, true)).toEqual({ tool: "", done: true });
  });

  it("skips malformed JSON lines without throwing", () => {
    const text = [
      "not json at all",
      line({
        type: "assistant",
        message: { stop_reason: "tool_use", content: [{ type: "tool_use", name: "Read" }] },
      }),
    ].join("\n");
    expect(parseTranscriptTail(text, false)).toEqual({ tool: "Read", done: false });
  });

  it("returns null when nothing usable is in the tail", () => {
    expect(parseTranscriptTail("", false)).toBeNull();
    expect(parseTranscriptTail("garbage\nmore garbage", false)).toBeNull();
  });
});
