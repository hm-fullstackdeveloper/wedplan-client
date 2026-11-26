"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Lock, Unlock } from "lucide-react";

export function UserBlockButton({
  userId,
  isBlocked,
  isSelf,
}: {
  userId: string;
  isBlocked: boolean;
  isSelf: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleToggle = async () => {
    if (loading || isSelf) {
      return;
    }

    const confirmed = window.confirm(
      isBlocked
        ? "Unblock this user and restore access?"
        : "Block this user? They will lose access to protected features.",
    );

    if (!confirmed) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ isBlocked: !isBlocked }),
      });

      const data = (await response.json().catch(() => ({}))) as {
        error?: string;
      };

      if (!response.ok) {
        setError(data.error || "Could not update this user.");
        return;
      }

      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={handleToggle}
        disabled={loading || isSelf}
        title={isSelf ? "You cannot block your own account" : undefined}
        className={
          isBlocked
            ? "inline-flex h-9 items-center gap-1.5 rounded-full bg-success px-3 text-xs font-semibold text-white transition-colors hover:bg-success/90 disabled:cursor-not-allowed disabled:opacity-50"
            : "inline-flex h-9 items-center gap-1.5 rounded-full border border-danger/30 bg-danger-light px-3 text-xs font-semibold text-danger transition-colors hover:bg-danger/15 disabled:cursor-not-allowed disabled:opacity-50"
        }
      >
        {loading ? (
          <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
        ) : isBlocked ? (
          <Unlock className="size-3.5" aria-hidden="true" />
        ) : (
          <Lock className="size-3.5" aria-hidden="true" />
        )}
        {isBlocked ? "Unblock" : "Block"}
      </button>
      {error ? <p className="text-xs text-danger">{error}</p> : null}
    </div>
  );
}
