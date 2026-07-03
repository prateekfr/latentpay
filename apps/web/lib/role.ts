import { clerkClient } from "@clerk/nextjs/server";
import type { User } from "@clerk/backend";

export type UserRole = "advertiser" | "earner";

export function readRole(user: Pick<User, "publicMetadata"> | null | undefined): UserRole | null {
  const role = user?.publicMetadata?.role;
  return role === "advertiser" || role === "earner" ? role : null;
}

export async function assignRole(userId: string, role: UserRole): Promise<void> {
  const client = await clerkClient();
  await client.users.updateUserMetadata(userId, { publicMetadata: { role } });
}
