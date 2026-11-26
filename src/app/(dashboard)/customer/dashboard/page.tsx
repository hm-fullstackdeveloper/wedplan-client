import Link from "next/link";
import {
  CalendarCheck,
  CalendarClock,
  CalendarX,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

import { PageHeader } from "@/components/dashboard/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { EmptyState } from "@/components/dashboard/empty-state";
import { requireDashboardRole } from "@/lib/dashboard-guard";
import {
  getCustomerBookingCounts,
  getCustomerBookings,
} from "@/lib/dashboard-data";
import { formatDate } from "@/lib/format";

export default async function CustomerDashboardPage() {
  const user = await requireDashboardRole("customer");
  const [counts, bookings] = await Promise.all([
    getCustomerBookingCounts(user.id),
    getCustomerBookings(user.id),
  ]);

  const recent = bookings.slice(0, 3);

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Welcome back, ${user.name?.split(" ")[0] || "there"}`}
        description="Here is a quick overview of your wedding booking requests."
        action={
          <Link
            href="/customer/bookings"
            className="inline-flex h-10 items-center gap-2 rounded-full bg-brand px-5 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
          >
            <CalendarCheck className="size-4" aria-hidden="true" />
            My Bookings
          </Link>
        }
      />

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Booking Requests"
          value={counts.total}
          hint="All requests you have sent"
          icon={CalendarCheck}
          tone="brand"
        />
        <StatCard
          label="Pending"
          value={counts.pending}
          hint="Waiting for vendor response"
          icon={CalendarClock}
          tone="warning"
        />
        <StatCard
          label="Accepted"
          value={counts.accepted}
          hint="Confirmed by vendors"
          icon={CheckCircle2}
          tone="success"
        />
        <StatCard
          label="Rejected"
          value={counts.rejected}
          hint="Declined by vendors"
          icon={CalendarX}
          tone="danger"
        />
      </section>

      <section className="rounded-2xl border border-border-custom bg-surface p-5 shadow-sm sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-text-primary">
              Recent Requests
            </h2>
            <p className="text-sm text-text-secondary">
              Your latest booking activity.
            </p>
          </div>
          <Link
            href="/customer/bookings"
            className="text-sm font-semibold text-brand hover:underline"
          >
            View all
          </Link>
        </div>

        <div className="mt-4">
          {recent.length === 0 ? (
            <EmptyState
              icon={Sparkles}
              title="No booking requests yet"
              description="Browse wedding services and send your first booking request to a vendor."
              action={
                <Link
                  href="/services"
                  className="inline-flex h-10 items-center rounded-full bg-brand px-5 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
                >
                  Browse Services
                </Link>
              }
            />
          ) : (
            <ul className="divide-y divide-border-custom">
              {recent.map((booking) => (
                <li
                  key={booking.id}
                  className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-text-primary">
                      {booking.serviceName}
                    </p>
                    <p className="truncate text-xs text-text-secondary">
                      {booking.vendorBusinessName || booking.vendorName} ·{" "}
                      {formatDate(booking.eventDate)}
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
