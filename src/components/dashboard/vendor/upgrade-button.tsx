"use client";

import { useState } from "react";
import { Loader2, Sparkles } from "lucide-react";
import toast from "react-hot-toast";

export function UpgradeButton({ disabled }: { disabled?: boolean }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleUpgrade = async () => {
    if (loading || disabled) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/subscription/checkout", {
        method: "POST",
      });

      const data = (await response.json().catch(() => ({}))) as {
        url?: string;
        error?: string;
      };

      if (!response.ok || !data.url) {
        const message =
          data.error ||
          "Checkout is not available right now. Please try again later.";
        setError(message);
        toast.error(message);
        return;
      }

      toast.success("Redirecting to secure checkout...");
      window.location.href = data.url;
    } catch {
      const message = "Something went wrong. Please try again.";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={handleUpgrade}
        disabled={loading || disabled}
        className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-brand px-6 text-sm font-semibold text-white transition-colors hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? (
          <Loader2 className="size-4 animate-spin" aria-hidden="true" />
        ) : (
          <Sparkles className="size-4" aria-hidden="true" />
        )}
        {loading ? "Redirecting to Stripe..." : "Upgrade to Premium"}
      </button>
      {error ? <p className="text-xs text-danger">{error}</p> : null}
    </div>
  );
}
