import * as vscode from "vscode";
import { backendBaseUrl } from "./config";

export interface MenuDeps {
  isSignedIn: () => boolean;
  signInWithBrowser: () => Promise<void>;
  signOut: () => Promise<void>;
  showSidebar: () => Promise<void>;
  version: string;
}

interface MenuItem extends vscode.QuickPickItem {
  id: string;
}

/** The status bar's click target — a single quick-pick menu surfacing every
 *  LatentPay action in one place (sign-in state and the earnings sidebar),
 *  rather than requiring the Command Palette for each one individually. */
export async function openMenu(deps: MenuDeps): Promise<void> {
  const signedIn = deps.isSignedIn();

  const items: MenuItem[] = [
    {
      id: "dashboard",
      label: "$(link-external) Open LatentPay Dashboard",
      description: `${backendBaseUrl()}/dashboard`,
    },
    signedIn
      ? { id: "signout", label: "$(sign-out) Sign out of LatentPay" }
      : { id: "signin", label: "$(sign-in) Sign in with Browser" },
    { id: "sidebar", label: "$(eye) Show Earnings sidebar" },
    { id: "__sep", label: "", kind: vscode.QuickPickItemKind.Separator },
    { id: "version", label: `$(rocket) LatentPay v${deps.version}` },
  ];

  const pick = await vscode.window.showQuickPick(items, { placeHolder: "LatentPay" });
  if (!pick) return;

  switch (pick.id) {
    case "dashboard":
      await vscode.env.openExternal(vscode.Uri.parse(`${backendBaseUrl()}/dashboard`));
      break;
    case "signin":
      await deps.signInWithBrowser();
      break;
    case "signout":
      await deps.signOut();
      break;
    case "sidebar":
      await deps.showSidebar();
      break;
    default:
      break;
  }
}
