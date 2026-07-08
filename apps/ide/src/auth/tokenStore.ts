import * as vscode from "vscode";

const SECRET_KEY = "latentpay.authToken";

/** Bearer token issued by the device-auth flow, stored in VS Code's
 *  SecretStorage (OS keychain-backed) — never a raw pasted userId. There is
 *  no manual-entry fallback: a bare "trust me, this is my id" string is
 *  exactly the vulnerability this replaces (anyone holding it could spend
 *  against or credit that account with zero verification). */
export class TokenStore {
  constructor(private readonly ctx: vscode.ExtensionContext) {}

  async get(): Promise<string | undefined> {
    return this.ctx.secrets.get(SECRET_KEY);
  }

  async set(token: string): Promise<void> {
    await this.ctx.secrets.store(SECRET_KEY, token);
  }

  async clear(): Promise<void> {
    await this.ctx.secrets.delete(SECRET_KEY);
  }
}
