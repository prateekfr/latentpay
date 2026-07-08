import { NextResponse } from "next/server";
import { verifyBearerToken, revokeToken } from "../../../../../../lib/auth/token";

// Authenticated by the bearer token itself, not a Clerk session — this is
// how "Sign Out" works from a popup/webview context that has no Clerk
// cookies. Possession of the token is exactly what's being revoked.
export async function POST(request: Request) {
  const verified = await verifyBearerToken(request);
  if (!verified) {
    return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
  }

  await revokeToken(verified.tokenId);
  return NextResponse.json({ success: true });
}
