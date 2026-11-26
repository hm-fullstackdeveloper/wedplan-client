"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { LogOut, ShieldAlert } from "lucide-react";

import { authClient } from "@/lib/auth-client";

export default function BlockedPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSignOut = async () => {
    setLoading(true);

    try {
      await authClient.signOut();
      router.push("/");
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-[70vh] items-center justify-center bg-page px-4 py-12">
      <div className="w-full max-w-md rounded-3xl border border-border-custom bg-surface p-8 text-center shadow-sm">
        <span className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-danger-light text-danger">
          <ShieldAlert className="size-8" aria-hidden="true" />
        </span>

        <h1 className="mt-5 text-2xl font-bold text-brand-dark">
          Account Blocked
        </h1>

        <p className="mt-2 text-sm text-text-secondary">
          Your WedPlan account has been blocked by an administrator. You cannot
          access protected dashboard features right now.
        </p>

        <p className="mt-2 text-sm text-text-secondary">
          If you believe this is a mistake, please contact WedPlan support.
        </p>

        <div className="mt-6 flex flex-col gap-3">
          <button
            type="button"
            onClick={handleSignOut}
            disabled={loading}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-brand px-6 text-sm font-semibold text-white transition-colors hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-60"
          >
            <LogOut className="size-4" aria-hidden="true" />
            {loading ? "Signing out..." : "Sign Out"}
          </button>

          <Link
            href="/"
            className="text-sm font-medium text-text-secondary hover:text-brand"
          >
            Back to home
          </Link>
        </div>
      </div>
    </main>
  );
}
