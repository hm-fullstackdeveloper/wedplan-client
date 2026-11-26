
import Link from "next/link";
import Image from "next/image";
import { MapPin, ArrowRight, ImageOff } from "lucide-react";

import { getLatestServices } from "@/lib/dashboard-data";
import { formatPrice } from "@/lib/format";

export default async function LatestServices() {
  const services = await getLatestServices();

  return (
    <section className="bg-page py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* Section Heading */}
        <div className="mb-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-brand">
              Discover Services
            </p>

            <h2 className="mt-2 text-3xl font-bold text-text-primary sm:text-4xl">
              Latest Wedding Services
            </h2>

            <p className="mt-3 max-w-xl text-sm text-text-secondary sm:text-base">
              Explore the latest wedding services from our trusted vendors.
            </p>
          </div>

          <Link
            href="/services"
            className="inline-flex items-center gap-2 text-sm font-semibold text-brand transition-colors hover:text-brand-dark"
          >
            View All Services
            <ArrowRight className="size-4" />
          </Link>
        </div>

        {/* Service Cards */}
        {services.length === 0 ? (
          <div className="rounded-2xl border border-border-custom bg-surface px-6 py-16 text-center">
            <h3 className="text-lg font-semibold text-text-primary">
              No services available yet
            </h3>

            <p className="mt-2 text-sm text-text-secondary">
              New approved wedding services will appear here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <article
                key={service.id}
                className="group overflow-hidden rounded-2xl border border-border-custom bg-surface shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
              >
                {/* Service Image */}
                <div className="relative h-56 overflow-hidden bg-brand-light">
                  {service.images[0] ? (
                    <Image
                      src={service.images[0]}
                      alt={service.serviceName}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <ImageOff className="size-10 text-brand/50" />
                    </div>
                  )}
                </div>

                {/* Service Information */}
                <div className="p-5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-brand">
                    {service.category || "Wedding Service"}
                  </p>

                  <h3 className="mt-2 line-clamp-1 text-lg font-bold text-text-primary">
                    {service.serviceName}
                  </h3>

                  <p className="mt-2 line-clamp-2 min-h-10 text-sm text-text-secondary">
                    {service.description || "No description available."}
                  </p>

                  <div className="mt-4 flex items-center justify-between gap-3">
                    <span className="text-lg font-bold text-brand-dark">
                      {service.price !== null
                        ? formatPrice(service.price)
                        : "Price unavailable"}
                    </span>

                    <span className="flex min-w-0 items-center gap-1 text-xs text-text-secondary">
                      <MapPin className="size-3.5 shrink-0 text-brand" />
                      <span className="truncate">
                        {service.location || "Location unavailable"}
                      </span>
                    </span>
                  </div>

                  <Link
                    href={`/services/${service.id}`}
                    className="mt-5 flex h-11 w-full items-center justify-center gap-2 rounded-full bg-brand text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
                  >
                    View Details
                    <ArrowRight className="size-4" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
