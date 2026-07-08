import * as vscode from "vscode";

/** `$X today · $Y lifetime`, mirroring kickbacks.ai's statusbar shape but
 *  against LatentPay's simpler single-wallet model — no kill-switch/offline
 *  states needed since there's no third-party surface to lose sync with.
 *  "Today" is tracked client-side from impression responses received this
 *  session; the server only returns the lifetime `walletBalance`. */
export class StatusBar {
  private readonly item = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Right,
    100,
  );
  private earnedToday = 0;

  constructor() {
    this.item.command = "latentpay.openMenu";
    this.showSignedOut();
    this.item.show();
  }

  recordPayout(payoutAmount: number, walletBalance: number): void {
    this.earnedToday += payoutAmount;
    this.item.text = `$(zap) LatentPay ($${this.earnedToday.toFixed(2)} today · $${walletBalance.toFixed(2)})`;
    this.item.tooltip = "LatentPay — click for options";
  }

  showSignedOut(): void {
    this.item.text = "$(circle-slash) LatentPay";
    this.item.tooltip = "LatentPay — click for options";
  }

  dispose(): void {
    this.item.dispose();
  }
}
