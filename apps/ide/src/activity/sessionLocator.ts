import { homedir } from "node:os";
import { join } from "node:path";
import { existsSync, readdirSync, statSync } from "node:fs";

function projectsRoot(): string {
  return join(homedir(), ".claude", "projects");
}

/** Claude Code's own (undocumented, version-fragile) transcript directory
 *  naming: the drive letter is lowercased (Windows only) and every path
 *  separator / colon becomes "-". Used only as a first guess —
 *  `locateSessionTranscript` always falls back to a global newest-file scan
 *  when the guess doesn't pan out, so a naming-scheme change never breaks
 *  detection outright. */
function sanitizeCwd(cwd: string): string {
  const driveLowered = cwd.replace(/^([A-Za-z]):/, (_, d: string) => `${d.toLowerCase()}:`);
  return driveLowered.replace(/[:\\/]/g, "-");
}

function newestJsonlIn(dir: string): string | null {
  try {
    if (!existsSync(dir)) return null;
    let best: { path: string; mtime: number } | null = null;
    for (const name of readdirSync(dir)) {
      if (!name.endsWith(".jsonl")) continue;
      const path = join(dir, name);
      const mtime = statSync(path).mtimeMs;
      if (!best || mtime > best.mtime) best = { path, mtime };
    }
    return best?.path ?? null;
  } catch {
    return null;
  }
}

/** Best-effort, read-only locate of the newest Claude Code session transcript
 *  for the given workspace path. Tries the sanitized-directory guess first,
 *  then falls back to the newest transcript across every project (renamed
 *  workspace, different Claude Code version, no active guess, etc). Never
 *  writes anything; never throws. */
export function locateSessionTranscript(workspacePath: string | undefined): string | null {
  const root = projectsRoot();

  if (workspacePath) {
    const guess = newestJsonlIn(join(root, sanitizeCwd(workspacePath)));
    if (guess) return guess;
  }

  try {
    if (!existsSync(root)) return null;
    let best: { path: string; mtime: number } | null = null;
    for (const dir of readdirSync(root)) {
      const candidate = newestJsonlIn(join(root, dir));
      if (!candidate) continue;
      const mtime = statSync(candidate).mtimeMs;
      if (!best || mtime > best.mtime) best = { path: candidate, mtime };
    }
    return best?.path ?? null;
  } catch {
    return null;
  }
}
