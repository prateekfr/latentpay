import * as vscode from "vscode";
import { readFileSync } from "node:fs";

export interface AdContent {
  companyName: string | null;
  adLine: string;
  brandIconUrl: string | null;
  targetUrl: string;
}

export type BannerState =
  | { kind: "idle" }
  | { kind: "generating"; thresholdMs: number; ad: AdContent }
  | { kind: "credited"; payoutAmount: number; ad: AdContent };

/** Renders LatentPay's own sponsor card in its own sidebar webview — never
 *  injected into another extension's UI. Visuals port the design already
 *  proven in `apps/extension/content.js`'s Shadow-DOM banner. */
export class LatentPaySidebarProvider implements vscode.WebviewViewProvider {
  static readonly viewId = "latentpay.sidebar";

  private view: vscode.WebviewView | null = null;
  private pendingState: BannerState = { kind: "idle" };

  constructor(private readonly ctx: vscode.ExtensionContext) {}

  resolveWebviewView(webviewView: vscode.WebviewView): void {
    this.view = webviewView;
    webviewView.webview.options = { enableScripts: true };
    webviewView.webview.html = this.renderHtml();
    this.post(this.pendingState);

    webviewView.webview.onDidReceiveMessage((message: { type?: string; url?: string }) => {
      if (message?.type !== "openLink" || !message.url) return;
      // Only ever opens a URL the backend itself returned as this campaign's
      // targetUrl (see banner.js) — never arbitrary webview-supplied input
      // beyond that.
      try {
        const uri = vscode.Uri.parse(message.url);
        if (uri.scheme === "http" || uri.scheme === "https") {
          void vscode.env.openExternal(uri);
        }
      } catch {
        // malformed URL — ignore
      }
    });
  }

  post(state: BannerState): void {
    this.pendingState = state;
    void this.view?.webview.postMessage({ type: "state", state });
  }

  private renderHtml(): string {
    const dir = vscode.Uri.joinPath(this.ctx.extensionUri, "dist", "webview");
    const css = readFileSync(vscode.Uri.joinPath(dir, "banner.css").fsPath, "utf8");
    const script = readFileSync(vscode.Uri.joinPath(dir, "banner.js").fsPath, "utf8");
    const nonce = String(Date.now()) + Math.random().toString(36).slice(2);

    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'nonce-${nonce}';" />
<style>${css}</style>
</head>
<body>
  <div class="banner-card">
    <div class="banner-left">
      <div class="logo-icon" id="logo">
        <svg viewBox="0 0 24 24" width="18" height="18">
          <polygon fill="currentColor" points="5.55,1.85 12.05,1.85 20.3,12.92 12.05,24 5.55,24 13.8,12.92" />
        </svg>
      </div>
      <div class="info-text">
        <div class="sponsor-title" id="title">LatentPay</div>
        <div class="sponsor-msg" id="msg">Waiting for your AI to start thinking…</div>
      </div>
    </div>
    <div class="status-container">
      <div class="status-pill pending" id="pill">
        <div class="pulse-dot"></div>
        <span class="status-label">Idle</span>
      </div>
    </div>
    <div class="progress-bar-container">
      <div class="progress-bar-fill" id="fill"></div>
    </div>
  </div>
<script nonce="${nonce}">${script}</script>
</body>
</html>`;
  }
}
