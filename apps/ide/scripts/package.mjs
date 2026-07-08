import { spawnSync } from "node:child_process";
import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

// scripts/package.mjs -> apps/ide/
const extDir = join(fileURLToPath(import.meta.url), "..", "..");
const stageDir = join(extDir, ".vsce-stage");

function stagePackage(pkg) {
  rmSync(stageDir, { recursive: true, force: true });
  mkdirSync(stageDir, { recursive: true });
  writeFileSync(join(stageDir, "package.json"), JSON.stringify(pkg, null, 2) + "\n");
  cpSync(join(extDir, "dist"), join(stageDir, "dist"), { recursive: true });
  cpSync(join(extDir, "media"), join(stageDir, "media"), { recursive: true });
  writeFileSync(
    join(stageDir, ".vscodeignore"),
    [
      "node_modules/**",
      "src/**",
      "test/**",
      "scripts/**",
      "*.vsix",
      "package-lock.json",
      "tsconfig.json",
      "vitest.config.ts",
      "esbuild.mjs",
      ".vsce-stage/**",
      "",
    ].join("\n"),
  );
}

function run() {
  const pkg = JSON.parse(readFileSync(join(extDir, "package.json"), "utf8"));
  stagePackage(pkg);
  const outFile = join(extDir, `latentpay-${pkg.version}.vsix`);
  const result = spawnSync(
    "npx",
    ["--yes", "@vscode/vsce", "package", "--no-dependencies", "--out", outFile],
    { cwd: stageDir, stdio: "inherit", shell: process.platform === "win32" },
  );
  if (result.status !== 0) process.exit(result.status ?? 1);
  console.log(`packaged ${outFile}`);
}

run();
