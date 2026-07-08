import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import prisma from "../../../../../../lib/prisma";
import { assignRole, readRole } from "../../../../../../lib/role";

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Not signed in" }, { status: 401 });
    }

    const body = await request.json();
    const { userCode, role } = body;
    if (!userCode || typeof userCode !== "string") {
      return NextResponse.json({ error: "Missing userCode" }, { status: 400 });
    }
    if (role !== undefined && role !== "earner" && role !== "advertiser") {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    const record = await prisma.deviceAuthRequest.findUnique({ where: { userCode } });
    if (!record || record.expiresAt < new Date() || record.consumedAt) {
      return NextResponse.json({ error: "Code expired or invalid" }, { status: 404 });
    }

    // Role is assigned once, on first sign-in — never overwritten by a later
    // device approval, so an existing account keeps whichever side it started on.
    const clerkUser = await currentUser();
    let resolvedRole = readRole(clerkUser);
    if (!resolvedRole && role) {
      await assignRole(userId, role);
      resolvedRole = role;
    }

    await prisma.deviceAuthRequest.update({
      where: { userCode },
      data: { status: "approved", userId },
    });

    return NextResponse.json({ success: true, role: resolvedRole });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: "Internal Server Error", details: message }, { status: 500 });
  }
}
