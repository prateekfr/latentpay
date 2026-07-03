"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { SignInButton, useUser } from "@clerk/nextjs";
import { LatentPayLogo } from "../../../components/ui/LatentPayLogo";
import { ROLE_OPTIONS, RoleOptionCard, type Role } from "../../../components/RoleOptionCard";

interface Props {
  userCode: string | null;
  valid: boolean;
  intendedRole: Role | null;
  clientKind: "extension" | "ide" | null;
}

type FlowState = "idle" | "approving" | "approved" | "error";

const ROLE_LABEL: Record<Role, string> = {
  earner: "a User",
  advertiser: "an Advertiser",
};

const CLIENT_LABEL: Record<"extension" | "ide", string> = {
  extension: "The Chrome Extension",
  ide: "VS Code",
};

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#07070d] flex items-center justify-center px-4 py-24">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-2xl rounded-3xl border border-white/10 bg-[#0d0d16] p-8 sm:p-10 shadow-[0_20px_80px_rgba(0,0,0,0.6)]"
      >
        {children}
      </motion.div>
    </div>
  );
}

function CodeBadge({ userCode }: { userCode: string }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5 font-mono text-sm text-violet-400">
      {userCode}
    </span>
  );
}

export default function DeviceSignInClient({ userCode, valid, intendedRole, clientKind }: Props) {
  const { isSignedIn, isLoaded, user } = useUser();
  const [state, setState] = useState<FlowState>("idle");

  const currentRole = (user?.publicMetadata?.role as Role | undefined) ?? null;
  const clientLabel = clientKind ? CLIENT_LABEL[clientKind] : "Your LatentPay app";

  async function approve(role?: Role) {
    if (!userCode) return;
    setState("approving");
    try {
      const res = await fetch("/api/v1/auth/device/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userCode, role }),
      });
      if (!res.ok) throw new Error("approve failed");
      setState("approved");
    } catch {
      setState("error");
    }
  }

  // Signed in via a role card during this exact flow (fresh account, no role
  // assigned yet) — finish automatically, no extra click required.
  useEffect(() => {
    if (isLoaded && isSignedIn && !currentRole && intendedRole && state === "idle") {
      approve(intendedRole);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, isSignedIn, currentRole, intendedRole]);

  if (!valid) {
    return (
      <Shell>
        <div className="flex items-start gap-4">
          <div className="w-11 h-11 rounded-xl bg-red-500/15 border border-red-500/25 flex items-center justify-center text-xl flex-shrink-0">
            ⚠️
          </div>
          <div>
            <h2 className="font-display font-bold text-xl text-white mb-1">Sign-in link expired</h2>
            <p className="text-sm text-white/40 leading-relaxed">
              This sign-in code is no longer valid. Go back to {clientLabel.toLowerCase()} and try &quot;Sign in
              with Browser&quot; again.
            </p>
          </div>
        </div>
      </Shell>
    );
  }

  if (!isLoaded) {
    return (
      <Shell>
        <div className="h-24 flex items-center justify-center text-white/30 text-sm">Loading…</div>
      </Shell>
    );
  }

  if (state === "approved") {
    return (
      <Shell>
        <div className="flex items-start gap-4">
          <div className="w-11 h-11 rounded-xl bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center text-xl flex-shrink-0">
            ✅
          </div>
          <div>
            <h2 className="font-display font-bold text-xl text-white mb-1">Signed in</h2>
            <p className="text-sm text-white/40 leading-relaxed">
              Return to {clientLabel.toLowerCase()} — it should sign in automatically.
            </p>
          </div>
        </div>
      </Shell>
    );
  }

  // Not signed in yet: the "cool screen" — choose how to sign in, then
  // continue straight back into this same flow after auth completes.
  if (!isSignedIn) {
    return (
      <Shell>
        <div className="flex flex-col items-center text-center mb-8">
          <LatentPayLogo markHeight={32} wordmarkSize="16px" />
          <h2 className="font-display font-bold text-2xl sm:text-3xl text-white mt-5">
            Sign in to finish connecting {clientLabel}
          </h2>
          <p className="text-white/40 text-sm mt-2 max-w-md">
            Choose how you want to use LatentPay — this decides which account {clientLabel.toLowerCase()} signs
            in as.
          </p>
          {userCode && <div className="mt-4">{<CodeBadge userCode={userCode} />}</div>}
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          {ROLE_OPTIONS.map((opt) => (
            <SignInButton
              key={opt.role}
              mode="modal"
              forceRedirectUrl={`/sign-in/device?code=${userCode}&role=${opt.role}`}
            >
              <RoleOptionCard option={opt} />
            </SignInButton>
          ))}
        </div>
      </Shell>
    );
  }

  // Signed in, no role yet, and didn't arrive via a role card (e.g. opened
  // this link directly while already authenticated) — offer the same choice.
  if (!currentRole && !intendedRole) {
    return (
      <Shell>
        <div className="flex flex-col items-center text-center mb-8">
          <LatentPayLogo markHeight={32} wordmarkSize="16px" />
          <h2 className="font-display font-bold text-2xl sm:text-3xl text-white mt-5">
            How do you want to use LatentPay?
          </h2>
          <p className="text-white/40 text-sm mt-2">
            This decides which account {clientLabel.toLowerCase()} signs in as.
          </p>
          {userCode && <div className="mt-4">{<CodeBadge userCode={userCode} />}</div>}
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          {ROLE_OPTIONS.map((opt) => (
            <RoleOptionCard
              key={opt.role}
              option={opt}
              disabled={state === "approving"}
              onClick={() => approve(opt.role)}
            />
          ))}
        </div>
      </Shell>
    );
  }

  // Signed in with a role resolved (either an existing account, or the
  // auto-approve effect above is mid-flight) — show the confirmation.
  const resolvedRoleLabel = ROLE_LABEL[currentRole ?? intendedRole ?? "earner"];

  return (
    <Shell>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="w-11 h-11 rounded-xl bg-violet-500/15 border border-violet-500/25 flex items-center justify-center text-xl flex-shrink-0">
            💻
          </div>
          <div>
            <h2 className="font-display font-bold text-xl text-white mb-1">{clientLabel} wants to sign in as you</h2>
            <p className="text-sm text-white/40 leading-relaxed max-w-md">
              Signing in as {resolvedRoleLabel}
              {userCode && (
                <>
                  {" "}
                  · code <span className="font-mono text-violet-400">{userCode}</span>
                </>
              )}{" "}
              — only approve this if you just ran &quot;Sign in with Browser&quot; in {clientLabel.toLowerCase()}.
            </p>
            {state === "error" && <p className="text-xs text-red-400 mt-1">Something went wrong — try again.</p>}
          </div>
        </div>
        <button
          onClick={() => approve()}
          disabled={state === "approving"}
          className="btn-gradient self-start sm:self-auto px-5 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-50"
        >
          {state === "approving" ? "Approving…" : "Approve"}
        </button>
      </div>
    </Shell>
  );
}
