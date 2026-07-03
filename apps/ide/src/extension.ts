import * as vscode from "vscode";
import { randomUUID } from "node:crypto";
import { AD_SURFACE, backendBaseUrl, viewThresholdSeconds } from "./config";
import { TokenStore } from "./auth/tokenStore";
import { TranscriptWatcher } from "./activity/logTail";
import { submitImpression } from "./metrics/client";
import { AuctionCampaign, fetchCurrentAd } from "./portfolio/client";
import { LatentPaySidebarProvider } from "./view/sidebarProvider";
import { StatusBar } from "./statusbar";
import { openMenu } from "./menu";
import { pollDeviceFlow, startDeviceFlow } from "./auth/deviceFlow";

const AD_REFRESH_MS = 30_000;

export async function activate(ctx: vscode.ExtensionContext): Promise<void> {
  const tokenStore = new TokenStore(ctx);
  const sidebar = new LatentPaySidebarProvider(ctx);
  const statusBar = new StatusBar();
  ctx.subscriptions.push(statusBar);

  ctx.subscriptions.push(
    vscode.window.registerWebviewViewProvider(LatentPaySidebarProvider.viewId, sidebar),
  );

  const thresholdMs = viewThresholdSeconds() * 1000;
  const getWorkspacePath = () => vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
  const watcher = new TranscriptWatcher(getWorkspacePath);

  let token = await tokenStore.get();
  if (token) {
    // Repaint once we know the real wallet state is unknown-but-signed-in;
    // the next credited impression fills in real numbers.
    statusBar.recordPayout(0, 0);
  } else {
    statusBar.showSignedOut();
  }

  // The real, currently-winning campaign for this surface — null when no
  // advertiser is live. Refreshed in the background so it's ready the
  // instant a generation starts, and snapshotted per-turn so a mid-turn
  // auction change never mismatches what was shown vs. what gets billed.
  let currentAd: AuctionCampaign | null = null;
  let activeAdForImpression: AuctionCampaign | null = null;
  const refreshCurrentAd = async (): Promise<void> => {
    currentAd = await fetchCurrentAd(backendBaseUrl(), AD_SURFACE);
  };
  void refreshCurrentAd();
  const adRefreshTimer = setInterval(() => void refreshCurrentAd(), AD_REFRESH_MS);
  ctx.subscriptions.push({ dispose: () => clearInterval(adRefreshTimer) });

  const toAdContent = (campaign: AuctionCampaign) => ({
    companyName: campaign.companyName,
    adLine: campaign.adLine,
    brandIconUrl: campaign.brandIconUrl,
    targetUrl: campaign.targetUrl,
  });

  watcher.on("start", () => {
    if (!currentAd) return; // no live campaign on this surface — show nothing
    activeAdForImpression = currentAd;
    sidebar.post({ kind: "generating", thresholdMs, ad: toAdContent(activeAdForImpression) });
  });

  watcher.on("stop", (elapsedMs) => {
    const ad = activeAdForImpression;
    activeAdForImpression = null;
    if (elapsedMs < thresholdMs || !token || !ad) {
      sidebar.post({ kind: "idle" });
      return;
    }
    const currentToken = token;
    void (async () => {
      const result = await submitImpression(
        backendBaseUrl(),
        currentToken,
        ad.id,
        elapsedMs / 1000,
        randomUUID(),
      );
      if (result) {
        sidebar.post({ kind: "credited", payoutAmount: result.payoutAmount, ad: toAdContent(ad) });
        statusBar.recordPayout(result.payoutAmount, result.walletBalance);
      } else {
        sidebar.post({ kind: "idle" });
      }
    })();
  });

  watcher.start();
  ctx.subscriptions.push({ dispose: () => watcher.stop() });

  const doSignInWithBrowser = async (): Promise<void> => {
    const start = await startDeviceFlow(backendBaseUrl());
    if (!start) {
      void vscode.window.showErrorMessage("LatentPay: couldn't reach the sign-in server. Is it running?");
      return;
    }

    await vscode.env.openExternal(vscode.Uri.parse(start.verificationUrl));

    const approvedToken = await vscode.window.withProgress<string | null>(
      {
        location: vscode.ProgressLocation.Notification,
        title: `LatentPay: waiting for browser approval — code ${start.userCode}`,
        cancellable: true,
      },
      async (_progress, cancelToken) => {
        const deadline = Date.now() + start.expiresInSeconds * 1000;
        while (Date.now() < deadline) {
          if (cancelToken.isCancellationRequested) return null;
          const result = await pollDeviceFlow(backendBaseUrl(), start.deviceCode);
          if (result.status === "approved") return result.token;
          if (result.status === "expired") return null;
          await new Promise((resolve) => setTimeout(resolve, start.pollIntervalMs));
        }
        return null;
      },
    );

    if (!approvedToken) {
      void vscode.window.showWarningMessage("LatentPay: sign-in cancelled or the code expired.");
      return;
    }

    token = approvedToken;
    await tokenStore.set(approvedToken);
    statusBar.recordPayout(0, 0);
    void vscode.window.showInformationMessage("LatentPay: signed in.");
  };

  const doSignOut = async (): Promise<void> => {
    const previousToken = token;
    await tokenStore.clear();
    token = undefined;
    statusBar.showSignedOut();
    void vscode.window.showInformationMessage("LatentPay: Signed out.");
    if (previousToken) {
      // Best-effort — local sign-out already happened regardless of whether
      // this reaches the server.
      void fetch(`${backendBaseUrl()}/api/v1/auth/tokens/revoke`, {
        method: "POST",
        headers: { Authorization: `Bearer ${previousToken}` },
      }).catch(() => {});
    }
  };

  const doShowSidebar = async (): Promise<void> => {
    await vscode.commands.executeCommand("workbench.view.extension.latentpay");
  };

  const doOpenMenu = async (): Promise<void> => {
    await openMenu({
      isSignedIn: () => !!token,
      signInWithBrowser: doSignInWithBrowser,
      signOut: doSignOut,
      showSidebar: doShowSidebar,
      version: String(ctx.extension.packageJSON.version ?? "0.0.0"),
    });
  };

  ctx.subscriptions.push(
    vscode.commands.registerCommand("latentpay.signInWithBrowser", doSignInWithBrowser),
    vscode.commands.registerCommand("latentpay.signOut", doSignOut),
    vscode.commands.registerCommand("latentpay.showStatus", doShowSidebar),
    vscode.commands.registerCommand("latentpay.openMenu", doOpenMenu),
  );

  if (!token) {
    void vscode.window
      .showInformationMessage("LatentPay: sign in to start earning.", "Sign in with Browser")
      .then((choice) => {
        if (choice === "Sign in with Browser") void vscode.commands.executeCommand("latentpay.signInWithBrowser");
      });
  }
}

export function deactivate(): void {}
