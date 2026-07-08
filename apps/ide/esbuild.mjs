import { build, context } from "esbuild";
import { cpSync, mkdirSync } from "node:fs";

const watch = process.argv.includes("--watch");

const options = {
  entryPoints: ["src/extension.ts"],
  bundle: true,
  platform: "node",
  format: "cjs",
  external: ["vscode"],
  outfile: "dist/extension.js",
  target: "node18",
  sourcemap: true,
};

function copyAssets() {
  mkdirSync("dist/webview", { recursive: true });
  cpSync("src/view/webview/banner.css", "dist/webview/banner.css");
  cpSync("src/view/webview/banner.js", "dist/webview/banner.js");
}

if (watch) {
  copyAssets();
  const ctx = await context(options);
  await ctx.watch();
  console.log("watching for changes...");
} else {
  await build(options);
  copyAssets();
  console.log("built dist/extension.js + dist/webview/*");
}
