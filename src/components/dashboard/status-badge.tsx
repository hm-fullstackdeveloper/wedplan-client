import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-warning-light text-warning",
  approved: "bg-success-light text-success",
  accepted: "bg-success-light text-success",
  active: "bg-success-light text-success",
  paid: "bg-success-light text-success",
  premium: "bg-brand-light text-brand-dark",
  rejected: "bg-danger-light text-danger",
  cancelled: "bg-danger-light text-danger",
  failed: "bg-danger-light text-danger",
  blocked: "bg-danger-light text-danger",
  inactive: "bg-muted text-text-secondary",
  free: "bg-muted text-text-secondary",
  succeeded: "bg-success-light text-success",
};

const STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  approved: "Approved",
  accepted: "Accepted",
  active: "Active",
  paid: "Paid",
  premium: "Premium",
  rejected: "Rejected",
  cancelled: "Cancelled",
  failed: "Failed",
  blocked: "Blocked",
  inactive: "Inactive",
  free: "Free",
  succeeded: "Succeeded",
};

export function StatusBadge({
  status,
  className,
}: {
  status?: string | null;
  className?: string;
}) {
  const key = (status ?? "unknown").toLowerCase();
  const style = STATUS_STYLES[key] ?? "bg-muted text-text-secondary";
  const label =
    STATUS_LABELS[key] ??
    (key === "unknown"
      ? "Unknown"
      : key.charAt(0).toUpperCase() + key.slice(1));

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold",
        style,
        className,
      )}
    >
      {label}
    </span>
  );
}
