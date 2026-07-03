import prisma from "../../../lib/prisma";
import DeviceSignInClient from "./DeviceSignInClient";

export const dynamic = "force-dynamic";

export default async function DeviceSignInPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string; role?: string; client?: string }>;
}) {
  const { code, role, client } = await searchParams;

  let valid = false;
  if (code) {
    const record = await prisma.deviceAuthRequest.findUnique({ where: { userCode: code } });
    valid = !!record && record.status === "pending" && record.expiresAt > new Date();
  }

  return (
    <DeviceSignInClient
      userCode={code ?? null}
      valid={valid}
      intendedRole={role === "advertiser" || role === "earner" ? role : null}
      clientKind={client === "extension" || client === "ide" ? client : null}
    />
  );
}
