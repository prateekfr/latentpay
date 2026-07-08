"use client";

import { AnimatePresence, motion } from "framer-motion";
import { SignInButton } from "@clerk/nextjs";
import { LatentPayLogo } from "./ui/LatentPayLogo";
import { ROLE_OPTIONS, RoleOptionCard } from "./RoleOptionCard";

interface Props {
  open: boolean;
  onClose: () => void;
}

const REDIRECT_TO: Record<string, string> = {
  earner: "/dashboard",
  advertiser: "/advertiser",
};

export default function SignInChoiceModal({ open, onClose }: Props) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm px-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.97 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-2xl rounded-3xl border border-white/10 bg-[#0d0d16] p-8 sm:p-10 shadow-[0_20px_80px_rgba(0,0,0,0.6)]"
          >
            <button
              onClick={onClose}
              aria-label="Close"
              className="absolute right-5 top-5 flex h-8 w-8 items-center justify-center rounded-full text-white/40 hover:text-white hover:bg-white/[0.08] transition-colors"
            >
              ✕
            </button>

            <div className="flex flex-col items-center text-center mb-8">
              <LatentPayLogo markHeight={32} wordmarkSize="16px" />
              <h2 className="font-display font-bold text-2xl sm:text-3xl text-white mt-5">
                How do you want to use LatentPay?
              </h2>
              <p className="text-white/40 text-sm mt-2">Pick one — you can always create a second account later.</p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              {ROLE_OPTIONS.map((opt) => (
                <SignInButton key={opt.role} mode="modal" forceRedirectUrl={REDIRECT_TO[opt.role]}>
                  <RoleOptionCard option={opt} onClick={onClose} />
                </SignInButton>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
