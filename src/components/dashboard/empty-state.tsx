import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border-custom bg-surface px-6 py-14 text-center">
      <span className="flex size-14 items-center justify-center rounded-2xl bg-brand-light text-brand">
        <Icon className="size-7" aria-hidden="true" />
      </span>
      <h3 className="mt-4 text-base font-semibold text-text-primary">
        {title}
      </h3>
      <p className="mt-1 max-w-sm text-sm text-text-secondary">{description}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
