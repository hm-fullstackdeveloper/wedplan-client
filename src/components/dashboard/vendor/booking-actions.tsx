"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2, X } from "lucide-react";
import toast from "react-hot-toast";

export function BookingActions({ bookingId }: { bookingId: string }) {
  const router = useRouter();
  const [pendingAction, setPendingAction] = useState<"accept" | "reject" | null>(
    null,
  );
  const [error, setError] = useState("");

  const run = async (action: "accept" | "reject") => {
    if (pendingAction) {
      return;
    }

    if (
      action === "reject" &&
      !window.confirm("Reject this booking request? This cannot be undone.")
    ) {
      return;
    }

    setPendingAction(action);
    setError("");

    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action }),
      });

      const data = (await response.json().catch(() => ({}))) as {
        error?: string;
      };

      if (!response.ok) {
        const message = data.error || "Could not update this booking.";
        setError(message);
        toast.error(message);
        return;
      }

      toast.success(
        action === "accept"
          ? "Booking accepted."
          : "Booking rejected.",
      );
      router.refresh();
    } catch {
      const message = "Something went wrong. Please try again.";
      setError(message);
      toast.error(message);
    } finally {
      setPendingAction(null);
    }
  };

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => run("accept")}
          disabled={pendingAction !== null}
          className="inline-flex h-9 items-center gap-1.5 rounded-full bg-success px-4 text-xs font-semibold text-white transition-colors hover:bg-success/90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pendingAction === "accept" ? (
            <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
          ) : (
            <Check className="size-3.5" aria-hidden="true" />
          )}
          Accept
        </button>
        <button
          type="button"
          onClick={() => run("reject")}
          disabled={pendingAction !== null}
          className="inline-flex h-9 items-center gap-1.5 rounded-full border border-danger/30 bg-danger-light px-4 text-xs font-semibold text-danger transition-colors hover:bg-danger/15 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pendingAction === "reject" ? (
            <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
          ) : (
            <X className="size-3.5" aria-hidden="true" />
          )}
          Reject
        </button>
      </div>
      {error ? <p className="text-xs text-danger">{error}</p> : null}
    </div>
  );
}
