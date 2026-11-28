import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  ImageOff,
  Mail,
  MapPin,
  Store,
} from "lucide-react";

import { BookingForm } from "@/components/services/booking-form";
import { getCurrentUser } from "@/lib/authz";
import { getServiceDetails } from "@/lib/dashboard-data";
import { formatPrice, getInitials } from "@/lib/format";
import { toObjectId } from "@/lib/collections";

export default async function ServiceDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // 1. ID validation — ভুল বা অসম্পূর্ণ ID হলে 404।
  if (!toObjectId(id)) {
    notFound();
  }

  // 2. Guest হলে Sign In — return destination `?redirect=`-এ রাখা হয়।
  const user = await getCurrentUser();

  if (!user) {
    redirect(`/sign-in?redirect=/services/${id}`);
  }

  if (user.isBlocked) {
    redirect("/blocked");
  }

  // 3. শুধু approved ও active service দেখা যায় (missing record → 404)।
  const details = await getServiceDetails(id);

  if (!details) {
    notFound();
  }

  const { service, vendor } = details;
  const images = service.images.filter(Boolean);
  const [mainImage, ...thumbnailImages] = images;

  return (
    <main className="bg-page py-10 sm:py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Link
          href="/services"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand transition-colors hover:text-brand-dark"
        >
          <ArrowLeft aria-hidden="true" className="size-4" />
          Back to services
        </Link>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left column — gallery, information, vendor */}
          <div className="space-y-6 lg:col-span-2">
            {/* Service Images */}
            <section className="overflow-hidden rounded-2xl border border-border-custom bg-surface p-4 shadow-sm sm:p-5">
              <div className="relative h-64 overflow-hidden rounded-xl bg-brand-light sm:h-96">
                {mainImage ? (
                  <Image
                    src={mainImage}
                    alt={service.serviceName}
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 66vw"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full flex-col items-center justify-center gap-2 text-brand/60">
                    <ImageOff aria-hidden="true" className="size-10" />
                    <span className="text-sm">No image available</span>
                  </div>
                )}
              </div>

              {thumbnailImages.length > 0 ? (
                <div className="mt-4 grid grid-cols-4 gap-3 sm:grid-cols-6">
                  {thumbnailImages.map((image) => (
                    <div
                      key={image}
                      className="relative aspect-square overflow-hidden rounded-lg border border-border-custom bg-brand-light"
                    >
                      <Image
                        src={image}
                        alt={`${service.serviceName} gallery image`}
                        fill
                        sizes="(max-width: 640px) 25vw, 16vw"
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              ) : null}
            </section>

            {/* Service Information */}
            <section className="rounded-2xl border border-border-custom bg-surface p-5 shadow-sm sm:p-6">
              <div className="flex flex-wrap items-center gap-3">
                <span className="rounded-full bg-brand-light px-3 py-1 text-xs font-semibold uppercase tracking-wider text-brand-dark">
                  {service.category || "Wedding Service"}
                </span>

                <span className="text-lg font-bold text-brand-dark">
                  {service.price !== null
                    ? formatPrice(service.price)
                    : "Price unavailable"}
                </span>
              </div>

              <h1 className="mt-3 text-2xl font-bold text-text-primary sm:text-3xl">
                {service.serviceName}
              </h1>

              <p className="mt-3 flex items-center gap-1.5 text-sm text-text-secondary">
                <MapPin aria-hidden="true" className="size-4 text-brand" />
                {service.location || "Location unavailable"}
              </p>

              <div className="mt-5 border-t border-border-custom pt-5">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-text-secondary">
                  Description
                </h2>
                <p className="mt-2 whitespace-pre-line text-sm leading-6 text-text-secondary sm:text-base">
                  {service.description || "No description available."}
                </p>
              </div>
            </section>

            {/* Vendor Information */}
            <section className="rounded-2xl border border-border-custom bg-surface p-5 shadow-sm sm:p-6">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-text-secondary">
                About the Vendor
              </h2>

              <div className="mt-4 flex items-start gap-4">
                <span
                  aria-hidden="true"
                  className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-brand-light text-lg font-bold text-brand-dark"
                >
                  {vendor.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={vendor.image}
                      alt=""
                      className="size-full object-cover"
                    />
                  ) : (
                    getInitials(vendor.businessName || vendor.name)
                  )}
                </span>

                <div className="min-w-0">
                  <p className="flex items-center gap-1.5 text-base font-bold text-text-primary">
                    <Store
                      aria-hidden="true"
                      className="size-4 shrink-0 text-brand"
                    />
                    {vendor.businessName || vendor.name}
                  </p>

                  <p className="mt-1 text-sm text-text-secondary">
                    {vendor.businessName ? vendor.name : "WedPlan vendor"}
                  </p>

                  {vendor.email ? (
                    <p className="mt-2 flex items-center gap-1.5 break-all text-sm text-text-secondary">
                      <Mail aria-hidden="true" className="size-4 shrink-0 text-brand" />
                      {vendor.email}
                    </p>
                  ) : null}
                </div>
              </div>
            </section>
          </div>

          {/* Right column — booking */}
          <aside className="lg:col-span-1">
            <div className="rounded-2xl border border-border-custom bg-surface p-5 shadow-sm sm:p-6">
              <h2 className="flex items-center gap-2 text-lg font-bold text-text-primary">
                <CalendarDays aria-hidden="true" className="size-5 text-brand" />
                Book this Service
              </h2>

              <div className="mt-5">
                {user.role === "customer" ? (
                  <BookingForm serviceId={service.id} />
                ) : (
                  <div className="rounded-xl border border-border-custom bg-brand-light/50 p-4">
                    <p className="text-sm font-semibold text-text-primary">
                      {user.role === "vendor"
                        ? "Vendors cannot book services"
                        : "Administrators cannot book services"}
                    </p>
                    <p className="mt-1.5 text-sm text-text-secondary">
                      {user.role === "vendor"
                        ? "You can manage your own services and bookings from your vendor dashboard."
                        : "Booking requests are only available to customer accounts."}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
