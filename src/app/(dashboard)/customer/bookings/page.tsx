import Link from "next/link";
import {
  CalendarDays,
  ImageOff,
  MapPin,
  MessageSquare,
  Store,
} from "lucide-react";

import { CancelBookingButton } from "@/components/dashboard/customer/cancel-booking-button";
import { EmptyState } from "@/components/dashboard/empty-state";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { requireDashboardRole } from "@/lib/dashboard-guard";
import { getCustomerBookings } from "@/lib/dashboard-data";
import { formatDate, formatPrice } from "@/lib/format";

export default async function CustomerBookingsPage() {
  const user = await requireDashboardRole("customer");
  const bookings = await getCustomerBookings(user.id);

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Bookings"
        description="Only your own booking requests are shown here."
      />

      {bookings.length === 0 ? (
        <EmptyState
          icon={CalendarDays}
          title="No bookings found"
          description="You have not requested any wedding service yet. Browse services and send a request."
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
        <div className="space-y-4">
          {bookings.map((booking) => (
            <article
              key={booking.id}
              className="rounded-2xl border border-border-custom bg-surface p-4 shadow-sm transition-shadow hover:shadow-md sm:p-5"
            >
              <div className="flex flex-col gap-4 sm:flex-row">
                <div className="relative flex h-28 w-full shrink-0 items-center justify-center overflow-hidden rounded-xl bg-brand-light sm:h-24 sm:w-24">
                  {booking.serviceImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={booking.serviceImage}
                      alt={booking.serviceName}
                      className="absolute inset-0 size-full object-cover"
                    />
                  ) : (
                    <ImageOff
                      className="size-7 text-brand/50"
                      aria-hidden="true"
                    />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h2 className="truncate text-base font-semibold text-text-primary">
                        {booking.serviceName}
                      </h2>
                      <p className="mt-0.5 flex items-center gap-1.5 text-sm text-text-secondary">
                        <Store className="size-3.5 shrink-0" aria-hidden="true" />
                        <span className="truncate">
                          {booking.vendorBusinessName || booking.vendorName}
                        </span>
                      </p>
                    </div>
                    <StatusBadge status={booking.status} />
                  </div>

                  <dl className="mt-3 grid grid-cols-1 gap-2 text-sm text-text-secondary sm:grid-cols-2">
                    <div className="flex items-center gap-2">
                      <CalendarDays
                        className="size-4 shrink-0 text-brand"
                        aria-hidden="true"
                      />
                      <span>Event: {formatDate(booking.eventDate)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin
                        className="size-4 shrink-0 text-brand"
                        aria-hidden="true"
                      />
                      <span className="truncate">
                        {booking.eventLocation || "Location not provided"}
                      </span>
                    </div>
                    {booking.servicePrice !== null ? (
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold uppercase tracking-wide text-text-muted">
                          Price
                        </span>
                        <span className="font-semibold text-text-primary">
                          {formatPrice(booking.servicePrice)}
                        </span>
                      </div>
                    ) : null}
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold uppercase tracking-wide text-text-muted">
                        Requested
                      </span>
                      <span>{formatDate(booking.createdAt)}</span>
                    </div>
                  </dl>

                  {booking.message ? (
                    <p className="mt-3 flex items-start gap-2 rounded-xl bg-brand-light/50 p-3 text-sm text-text-secondary">
                      <MessageSquare
                        className="mt-0.5 size-4 shrink-0 text-brand"
                        aria-hidden="true"
                      />
                      {booking.message}
                    </p>
                  ) : null}

                  {booking.status === "pending" ? (
                    <div className="mt-3 flex justify-end">
                      <CancelBookingButton bookingId={booking.id} />
                    </div>
                  ) : null}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
