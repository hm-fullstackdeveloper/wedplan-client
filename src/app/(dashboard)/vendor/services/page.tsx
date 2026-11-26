import Link from "next/link";
import { ImageOff, MapPin, PlusCircle, Sparkles, Store } from "lucide-react";

import { EmptyState } from "@/components/dashboard/empty-state";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { ServiceActions } from "@/components/dashboard/vendor/service-actions";
import { requireDashboardRole } from "@/lib/dashboard-guard";
import { getVendorServices } from "@/lib/dashboard-data";
import { formatPrice } from "@/lib/format";

export default async function VendorServicesPage() {
  const user = await requireDashboardRole("vendor");
  const services = await getVendorServices(user.id);

  const plan = (user.subscriptionPlan || "free").toLowerCase();
  const activeCount = services.filter(
    (service) => service.status === "approved" && service.isActive,
  ).length;
  const limitReached = plan !== "premium" && activeCount >= 3;

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Services"
        description="Only services created by your vendor account are shown here."
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

      <div className="rounded-2xl border border-border-custom bg-brand-light/40 p-4 text-sm text-text-secondary">
        <p className="flex items-center gap-2 font-medium text-brand-dark">
          <Sparkles className="size-4" aria-hidden="true" />
          {plan === "premium"
            ? "Premium plan — unlimited active services."
            : `Free plan — ${activeCount} of 3 active services used.`}
        </p>
        <p className="mt-1 text-xs text-text-muted">
          New services stay <strong>Pending</strong> until an admin approves
          them. Only approved and active services appear publicly.
        </p>
        {limitReached ? (
          <p className="mt-2 text-xs font-medium text-danger">
            You have reached the free plan limit. Upgrade to Premium to add more
            active services.
          </p>
        ) : null}
      </div>

      {services.length === 0 ? (
        <EmptyState
          icon={Store}
          title="No services yet"
          description="Add your first wedding service. It will be reviewed by an admin before it goes public."
          action={
            <Link
              href="/vendor/services/add"
              className="inline-flex h-10 items-center rounded-full bg-brand px-5 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
            >
              Add Service
            </Link>
          }
        />
      ) : (
        <div className="space-y-4">
          {services.map((service) => (
            <article
              key={service.id}
              className="rounded-2xl border border-border-custom bg-surface p-4 shadow-sm transition-shadow hover:shadow-md sm:p-5"
            >
              <div className="flex flex-col gap-4 sm:flex-row">
                <div className="relative flex h-32 w-full shrink-0 items-center justify-center overflow-hidden rounded-xl bg-brand-light sm:h-24 sm:w-28">
                  {service.images[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={service.images[0]}
                      alt={service.serviceName}
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
                        {service.serviceName}
                      </h2>
                      <p className="mt-0.5 text-xs font-medium uppercase tracking-wide text-text-muted">
                        {service.category || "Uncategorised"}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={service.status} />
                      <StatusBadge
                        status={service.isActive ? "active" : "inactive"}
                      />
                    </div>
                  </div>

                  <p className="mt-2 line-clamp-2 text-sm text-text-secondary">
                    {service.description || "No description provided."}
                  </p>

                  <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-text-secondary">
                    <span className="font-semibold text-text-primary">
                      {formatPrice(service.price)}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <MapPin
                        className="size-3.5 text-brand"
                        aria-hidden="true"
                      />
                      {service.location || "No location"}
                    </span>
                  </div>

                  <div className="mt-3">
                    <ServiceActions
                      serviceId={service.id}
                      isActive={service.isActive}
                      status={service.status}
                    />
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
