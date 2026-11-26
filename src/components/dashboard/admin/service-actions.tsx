"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2, RotateCcw, Trash2, X } from "lucide-react";

export function AdminServiceActions({
  serviceId,
  status,
}: {
  serviceId: string;
  status: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState("");

  const run = async (
    key: string,
    request: () => Promise<Response>,
    confirmMessage?: string,
  ) => {
    if (loading) {
      return;
    }

    if (confirmMessage && !window.confirm(confirmMessage)) {
      return;
    }

    setLoading(key);
    setError("");

    try {
      const response = await request();
      const data = (await response.json().catch(() => ({}))) as {
        error?: string;
      };

      if (!response.ok) {
        setError(data.error || "Could not update this service.");
        return;
      }

      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(null);
    }
  };

  const setStatus = (nextStatus: "approved" | "rejected" | "pending") =>
    run(
      nextStatus,
      () =>
        fetch(`/api/services/${serviceId}`, {
          method: "PATCH",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ status: nextStatus }),
        }),
      nextStatus === "rejected"
        ? "Reject this service? It will be hidden from the public site."
        : undefined,
    );

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex flex-wrap justify-end gap-2">
        {status !== "approved" ? (
          <button
            type="button"
            onClick={() => setStatus("approved")}
            disabled={loading !== null}
            className="inline-flex h-8 items-center gap-1 rounded-full bg-success px-3 text-xs font-semibold text-white transition-colors hover:bg-success/90 disabled:opacity-60"
          >
            {loading === "approved" ? (
              <Loader2 className="size-3 animate-spin" aria-hidden="true" />
            ) : (
              <Check className="size-3" aria-hidden="true" />
            )}
            Approve
          </button>
        ) : null}

        {status !== "rejected" ? (
          <button
            type="button"
            onClick={() => setStatus("rejected")}
            disabled={loading !== null}
            className="inline-flex h-8 items-center gap-1 rounded-full border border-danger/30 bg-danger-light px-3 text-xs font-semibold text-danger transition-colors hover:bg-danger/15 disabled:opacity-60"
          >
            {loading === "rejected" ? (
              <Loader2 className="size-3 animate-spin" aria-hidden="true" />
            ) : (
              <X className="size-3" aria-hidden="true" />
            )}
            Reject
          </button>
        ) : null}

        {status !== "pending" ? (
          <button
            type="button"
            onClick={() => setStatus("pending")}
            disabled={loading !== null}
            className="inline-flex h-8 items-center gap-1 rounded-full border border-border-custom bg-surface px-3 text-xs font-semibold text-text-secondary transition-colors hover:bg-brand-light disabled:opacity-60"
          >
            {loading === "pending" ? (
              <Loader2 className="size-3 animate-spin" aria-hidden="true" />
            ) : (
              <RotateCcw className="size-3" aria-hidden="true" />
            )}
            Pending
          </button>
        ) : null}

        <button
          type="button"
          onClick={() =>
            run(
              "delete",
              () =>
                fetch(`/api/services/${serviceId}`, { method: "DELETE" }),
              "Delete this service permanently? This cannot be undone.",
            )
          }
          disabled={loading !== null}
          className="inline-flex h-8 items-center gap-1 rounded-full border border-border-custom bg-surface px-3 text-xs font-semibold text-danger transition-colors hover:bg-danger-light disabled:opacity-60"
        >
          {loading === "delete" ? (
            <Loader2 className="size-3 animate-spin" aria-hidden="true" />
          ) : (
            <Trash2 className="size-3" aria-hidden="true" />
          )}
          Delete
        </button>
      </div>
      {error ? <p className="text-xs text-danger">{error}</p> : null}
    </div>
  );
}
