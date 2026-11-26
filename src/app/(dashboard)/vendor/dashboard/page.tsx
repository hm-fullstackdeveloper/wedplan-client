import Link from "next/link";
import {
  CalendarCheck,
  CheckCircle2,
  CreditCard,
  Inbox,
  PlusCircle,
  Sparkles,
  Store,
} from "lucide-react";

import { EmptyState } from "@/components/dashboard/empty-state";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { requireDashboardRole } from "@/lib/dashboard-guard";
import { getVendorBookings, getVendorStats } from "@/lib/dashboard-data";
import { formatDate } from "@/lib/format";

export default async function VendorDashboardPage() {
  const user = await requireDashboardRole("vendor");
  const [stats, bookings] = await Promise.all([
    getVendorStats(user.id, user.subscriptionPlan),
    getVendorBookings(user.id),
  ]);

  const pending = bookings.filter((booking) => booking.status === "pending");
  const plan = stats.subscriptionPlan.toLowerCase();

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Welcome back, ${user.name?.split(" ")[0] || "there"}`}
        description="Track your services, booking requests, and subscription."
        action={
          <Link
            href="/vendor/services/add"
            className="inline-flex h-10 items-center gap-2 rounded-full bg-brand px-5 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
          >
            <PlusCircle className="size-4" aria-hidden="true" />
            Add Service
          </Link>
        }
      />

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard
          label="Total Services"
          value={stats.totalServices}
          hint={`${stats.approvedServices} approved`}
          icon={Store}
          tone="brand"
        />
        <StatCard
          label="Active Services"
          value={stats.activeServices}
          hint={plan === "premium" ? "Unlimited plan" : "Free plan limit: 3"}
          icon={CheckCircle2}
          tone="success"
        />
        <StatCard
          label="Pending Requests"
          value={stats.pendingBookings}
          hint="Need your response"
          icon={Inbox}
          tone="warning"
        />
        <StatCard
          label="Accepted Bookings"
          value={stats.acceptedBookings}
          hint="Confirmed events"
          icon={CalendarCheck}
          tone="info"
        />
        <StatCard
          label="Subscription Plan"
          value={plan === "premium" ? "Premium" : "Free"}
          hint={
            plan === "premium"
              ? "Unlimited active services"
              : "Upgrade for unlimited services"
          }
          icon={plan === "premium" ? Sparkles : CreditCard}
          tone={plan === "premium" ? "brand" : "info"}
        />
      </section>

      <section className="rounded-2xl border border-border-custom bg-surface p-5 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-text-primary">
              Pending Booking Requests
            </h2>
            <p className="text-sm text-text-secondary">
              Accept or reject requests from your customers.
            </p>
          </div>
          <Link
            href="/vendor/bookings"
            className="text-sm font-semibold text-brand hover:underline"
          >
            View all
          </Link>
        </div>

        <div className="mt-4">
          {pending.length === 0 ? (
            <EmptyState
              icon={Inbox}
              title="No pending requests"
              description="When a customer books one of your services, the request will appear here."
            />
          ) : (
            <ul className="divide-y divide-border-custom">
              {pending.slice(0, 4).map((booking) => (
                <li
                  key={booking.id}
                  className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-text-primary">
                      {booking.serviceName}
                    </p>
                    <p className="truncate text-xs text-text-secondary">
                      {booking.customerName} · {formatDate(booking.eventDate)}
                    </p>
                  </div>
                  <StatusBadge status={booking.status} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}
