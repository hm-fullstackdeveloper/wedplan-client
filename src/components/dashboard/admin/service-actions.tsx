"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2, RotateCcw, Trash2, X } from "lucide-react";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type ConfirmRequest = {
  key: "delete" | "rejected";
  title: string;
  description: string;
  confirmLabel: string;
  successMessage: string;
};

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
  const [confirm, setConfirm] = useState<ConfirmRequest | null>(null);

  const run = async (
    key: string,
    request: () => Promise<Response>,
    successMessage: string,
  ) => {
    if (loading) {
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
        const message = data.error || "Could not update this service.";
        setError(message);
        toast.error(message);
        return;
      }

      toast.success(successMessage);
      router.refresh();
    } catch {
      const message = "Something went wrong. Please try again.";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(null);
    }
  };

  const setStatus = (nextStatus: "approved" | "pending") =>
    run(
      nextStatus,
      () =>
        fetch(`/api/services/${serviceId}`, {
          method: "PATCH",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ status: nextStatus }),
        }),
      nextStatus === "approved"
        ? "Service approved."
        : "Service moved back to pending.",
    );

  // Delete এবং Reject — দুটোই এই Dialog দিয়ে নিশ্চিত করা হয় (browser confirm নয়)।
  const handleConfirm = async () => {
    if (!confirm || loading) {
      return;
    }

    const request = confirm;

    setLoading(request.key);
    setError("");

    try {
      const response =
        request.key === "delete"
          ? await fetch("/api/admin/services", {
              method: "DELETE",
              headers: { "content-type": "application/json" },
              body: JSON.stringify({ id: serviceId }),
            })
          : await fetch(`/api/services/${serviceId}`, {
              method: "PATCH",
              headers: { "content-type": "application/json" },
              body: JSON.stringify({ status: "rejected" }),
            });

      const data = (await response.json().catch(() => ({}))) as {
        error?: string;
      };

      if (!response.ok) {
        // ভুল হলে dialog খোলা থাকে এবং service list অপরিবর্তিত থাকে।
        const message = data.error || "Could not update this service.";
        setError(message);
        toast.error(message);
        return;
      }

      setConfirm(null);
      setError("");
      toast.success(request.successMessage);
      router.refresh();
    } catch {
      const message = "Something went wrong. Please try again.";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(null);
    }
  };

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
            onClick={() => {
              if (loading) {
                return;
              }
              setError("");
              setConfirm({
                key: "rejected",
                title: "Are you sure you want to reject this service?",
                description:
                  "It will be hidden from the public site until an admin approves it again.",
                confirmLabel: "Yes, Reject",
                successMessage: "Service rejected.",
              });
            }}
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
          onClick={() => {
            if (loading) {
              return;
            }
            setError("");
            setConfirm({
              key: "delete",
              title: "Are you sure you want to delete this service?",
              description:
                "This service will be removed permanently. This cannot be undone.",
              confirmLabel: "Yes, Delete",
              successMessage: "Service deleted successfully.",
            });
          }}
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
      {error && !confirm ? <p className="text-xs text-danger">{error}</p> : null}

      <Dialog
        open={confirm !== null}
        onOpenChange={(open) => {
          if (!open && loading === null) {
            setConfirm(null);
            setError("");
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{confirm?.title}</DialogTitle>
            <DialogDescription>{confirm?.description}</DialogDescription>
          </DialogHeader>

          {error ? (
            <p role="alert" className="text-sm text-danger">
              {error}
            </p>
          ) : null}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setConfirm(null);
                setError("");
              }}
              disabled={loading !== null}
              className="rounded-full px-5"
            >
              Cancel
            </Button>

            <Button
              type="button"
              onClick={handleConfirm}
              disabled={loading !== null}
              className="rounded-full bg-danger px-5 text-white hover:bg-danger/90"
            >
              {loading === confirm?.key ? (
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              ) : null}
              {confirm?.confirmLabel}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
