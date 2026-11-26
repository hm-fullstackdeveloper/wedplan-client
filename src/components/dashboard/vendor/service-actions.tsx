"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Pencil, Trash2 } from "lucide-react";

export function ServiceActions({
  serviceId,
  isActive,
  status,
}: {
  serviceId: string;
  isActive: boolean;
  status: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState<"toggle" | "delete" | null>(null);
  const [error, setError] = useState("");

  const toggleAvailability = async () => {
    if (loading) {
      return;
    }

    setLoading("toggle");
    setError("");

    try {
      const response = await fetch(`/api/services/${serviceId}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ isActive: !isActive }),
      });

      const data = (await response.json().catch(() => ({}))) as {
        error?: string;
      };

      if (!response.ok) {
        setError(data.error || "Could not update availability.");
        return;
      }

      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(null);
    }
  };

  const handleDelete = async () => {
    if (loading) {
      return;
    }

    if (
      !window.confirm(
        "Delete this service permanently? Related bookings will remain, but the service will be removed.",
      )
    ) {
      return;
    }

    setLoading("delete");
    setError("");

    try {
      const response = await fetch(`/api/services/${serviceId}`, {
        method: "DELETE",
      });

      const data = (await response.json().catch(() => ({}))) as {
        error?: string;
      };

      if (!response.ok) {
        setError(data.error || "Could not delete this service.");
        return;
      }

      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="flex flex-col items-end gap-1.5">
      <div className="flex flex-wrap items-center justify-end gap-2">
        <Link
          href={`/vendor/services/${serviceId}/edit`}
          className="inline-flex h-9 items-center gap-1.5 rounded-full border border-border-custom bg-surface px-3 text-xs font-semibold text-text-secondary transition-colors hover:bg-brand-light hover:text-brand-dark"
        >
          <Pencil className="size-3.5" aria-hidden="true" />
          Edit
        </Link>

        {status === "approved" ? (
          <button
            type="button"
            onClick={toggleAvailability}
            disabled={loading !== null}
            className="inline-flex h-9 items-center gap-1.5 rounded-full border border-border-custom bg-surface px-3 text-xs font-semibold text-text-secondary transition-colors hover:bg-brand-light hover:text-brand-dark disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading === "toggle" ? (
              <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
            ) : null}
            {isActive ? "Set Inactive" : "Set Active"}
          </button>
        ) : null}

        <button
          type="button"
          onClick={handleDelete}
          disabled={loading !== null}
          className="inline-flex h-9 items-center gap-1.5 rounded-full border border-danger/30 bg-danger-light px-3 text-xs font-semibold text-danger transition-colors hover:bg-danger/15 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading === "delete" ? (
            <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
          ) : (
            <Trash2 className="size-3.5" aria-hidden="true" />
          )}
          Delete
        </button>
      </div>
      {error ? <p className="text-xs text-danger">{error}</p> : null}
    </div>
  );
}
