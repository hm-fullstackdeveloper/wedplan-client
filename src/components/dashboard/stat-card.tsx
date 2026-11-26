import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

const TONES = {
  brand: "bg-brand-light text-brand-dark",
  success: "bg-success-light text-success",
  warning: "bg-warning-light text-warning",
  info: "bg-info-light text-info",
  danger: "bg-danger-light text-danger",
} as const;

export type StatTone = keyof typeof TONES;

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = "brand",
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon: LucideIcon;
  tone?: StatTone;
}) {
  return (
    <div className="rounded-2xl border border-border-custom bg-surface p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-text-secondary">{label}</p>
        <span
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-xl",
            TONES[tone],
          )}
        >
          <Icon className="size-5" aria-hidden="true" />
        </span>
      </div>

      <p className="mt-3 text-3xl font-bold tracking-tight text-text-primary">
        {value}
      </p>

      {hint ? <p className="mt-1 text-xs text-text-muted">{hint}</p> : null}
    </div>
  );
}
