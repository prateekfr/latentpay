import * as vscode from "vscode";

const DEFAULT_BACKEND_BASE_URL = "http://localhost:3000";

/** The auction surface this extension serves — matches the "Terminal"
 *  option advertisers pick in the advertiser portal's campaign form
 *  (`apps/web/app/advertiser/_components/CampaignForm.tsx`), kept distinct
 *  from the Chrome extension's "extension" surface so each runs its own
 *  independent bid auction (`apps/web/lib/auction.ts`). */
export const AD_SURFACE = "terminal";

export function backendBaseUrl(): string {
  const configured = vscode.workspace
    .getConfiguration("latentpay")
    .get<string>("backendBaseUrl");
  const trimmed = configured?.trim().replace(/\/+$/, "");
  return trimmed || DEFAULT_BACKEND_BASE_URL;
}

export function viewThresholdSeconds(): number {
  const value = vscode.workspace
    .getConfiguration("latentpay")
    .get<number>("viewThresholdSeconds");
  return typeof value === "number" && value > 0 ? value : 5;
}
