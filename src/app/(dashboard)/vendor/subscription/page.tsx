import {
  BadgeCheck,
  CalendarClock,
  Check,
  CreditCard,
  ShieldCheck,
  Sparkles,
  Store,
} from "lucide-react";

import { PageHeader } from "@/components/dashboard/page-header";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { UpgradeButton } from "@/components/dashboard/vendor/upgrade-button";
import { requireDashboardRole } from "@/lib/dashboard-guard";
import { getVendorStats } from "@/lib/dashboard-data";
import { formatDate } from "@/lib/format";

const FREE_FEATURES = [
  "Maximum 3 active services",
  "Basic vendor dashboard",
  "Booking request management",
];

const PREMIUM_FEATURES = [
  "Unlimited active services",
  "Premium vendor badge",
  "All Free plan features",
  "Priority visibility for your services",
];

function premiumIsActive(plan: string, expiresAt: Date | null) {
  if (plan.toLowerCase() !== "premium") {
    return false;
  }

  if (!expiresAt) {
    return true;
  }

  return expiresAt.getTime() > Date.now();
}

export default async function VendorSubscriptionPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const user = await requireDashboardRole("vendor");
  const { status } = await searchParams;
  const stats = await getVendorStats(user.id, user.subscriptionPlan);

  const expiresAt = user.subscriptionExpiresAt
    ? new Date(user.subscriptionExpiresAt)
    : null;

  const isPremium = premiumIsActive(stats.subscriptionPlan, expiresAt);

  const currentPlan = isPremium ? "premium" : "free";

  return (
    <div className="space-y-6">
      <PageHeader
        title="Subscription"
        description="Choose the plan that fits your wedding business."
        action={<StatusBadge status={currentPlan} />}
      />

      {status === "success" ? (
        <div className="rounded-2xl border border-success/30 bg-success-light p-4 text-sm text-success">
          <p className="flex items-center gap-2 font-semibold">
            <Check className="size-4" aria-hidden="true" />
            Payment received.
          </p>
          <p className="mt-1 text-xs">
            Premium activates only after Stripe confirms the payment through a
            verified webhook. Refresh this page in a moment.
          </p>
        </div>
      ) : null}

      {status === "cancelled" ? (
        <div className="rounded-2xl border border-warning/30 bg-warning-light p-4 text-sm text-warning">
          Checkout was cancelled. Your current plan has not changed.
        </div>
      ) : null}

      <section className="rounded-2xl border border-border-custom bg-surface p-5 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="flex size-12 items-center justify-center rounded-2xl bg-brand-light text-brand">
              <CreditCard className="size-6" aria-hidden="true" />
            </span>
            <div>
              <p className="text-sm text-text-secondary">Current plan</p>
              <p className="text-xl font-bold text-text-primary">
                {isPremium ? "Premium" : "Free"}
              </p>
            </div>
          </div>

          <div className="text-sm text-text-secondary">
            <p className="flex items-center gap-2">
              <Store className="size-4 text-brand" aria-hidden="true" />
              {stats.activeServices} active service
              {stats.activeServices === 1 ? "" : "s"}
            </p>
            {isPremium && expiresAt ? (
              <p className="mt-1 flex items-center gap-2">
                <CalendarClock
                  className="size-4 text-brand"
                  aria-hidden="true"
                />
                Renews on {formatDate(expiresAt)}
              </p>
            ) : null}
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="rounded-2xl border border-border-custom bg-surface p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-text-primary">Free Plan</h2>
            <StatusBadge status="free" />
          </div>
          <p className="mt-1 text-sm text-text-secondary">
            Everything you need to get started.
          </p>
          <p className="mt-4 text-3xl font-bold text-text-primary">
            $0
            <span className="text-sm font-medium text-text-muted"> / month</span>
          </p>

          <ul className="mt-5 space-y-2.5 text-sm text-text-secondary">
            {FREE_FEATURES.map((feature) => (
              <li key={feature} className="flex items-start gap-2">
                <Check
                  className="mt-0.5 size-4 shrink-0 text-success"
                  aria-hidden="true"
                />
                {feature}
              </li>
            ))}
          </ul>

          <div className="mt-6 rounded-xl bg-brand-light/40 px-4 py-3 text-center text-sm font-medium text-text-secondary">
            {currentPlan === "free" ? "Your current plan" : "Included"}
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl border-2 border-brand bg-surface p-6 shadow-md">
          <span className="absolute right-4 top-4 inline-flex items-center gap-1 rounded-full bg-brand px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
            <Sparkles className="size-3" aria-hidden="true" />
            Best value
          </span>

          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-text-primary">
              Premium Plan
            </h2>
            <BadgeCheck className="size-5 text-brand" aria-hidden="true" />
          </div>
          <p className="mt-1 text-sm text-text-secondary">
            For vendors ready to grow without limits.
          </p>
          <p className="mt-4 text-3xl font-bold text-text-primary">
            $19
            <span className="text-sm font-medium text-text-muted"> / month</span>
          </p>

          <ul className="mt-5 space-y-2.5 text-sm text-text-secondary">
            {PREMIUM_FEATURES.map((feature) => (
              <li key={feature} className="flex items-start gap-2">
                <Check
                  className="mt-0.5 size-4 shrink-0 text-brand"
                  aria-hidden="true"
                />
                {feature}
              </li>
            ))}
          </ul>

          <div className="mt-6">
            {isPremium ? (
              <div className="flex items-center justify-center gap-2 rounded-full bg-success-light px-4 py-3 text-sm font-semibold text-success">
                <BadgeCheck className="size-4" aria-hidden="true" />
                Premium is active
              </div>
            ) : (
              <UpgradeButton />
            )}
          </div>
        </div>
      </section>

      <div className="rounded-2xl border border-border-custom bg-brand-light/40 p-4 text-xs text-text-secondary">
        <p className="flex items-center gap-2 font-semibold text-brand-dark">
          <ShieldCheck className="size-4" aria-hidden="true" />
          Secure payment verification
        </p>
        <p className="mt-1">
          Premium access is activated only after Stripe sends a verified webhook
          event. A successful-looking browser page alone never unlocks Premium.
        </p>
      </div>
    </div>
  );
}
