import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ImageOff, MapPin, Search, Store } from "lucide-react";

import {
  getBrowseCategories,
  getBrowseServices,
  type ServiceRow,
} from "@/lib/dashboard-data";
import { formatPrice, getInitials } from "@/lib/format";

export const metadata: Metadata = {
  title: "Browse Wedding Services | WedPlan",
  description:
    "Browse approved wedding services from trusted WedPlan vendors.",
};

type BrowseSearchParams = {
  q?: string;
  category?: string;
  location?: string;
  sort?: string;
};

export default async function BrowseServicesPage({
  searchParams,
}: {
  searchParams: Promise<BrowseSearchParams>;
}) {
  const params = await searchParams;

  const search = typeof params.q === "string" ? params.q : "";
  const category = typeof params.category === "string" ? params.category : "";
  const location =
    typeof params.location === "string" ? params.location : "";
  const sort = typeof params.sort === "string" ? params.sort : "";

  const hasFilters = Boolean(
    search.trim() || category.trim() || location.trim() || sort,
  );

  let services: ServiceRow[] = [];
  let loadFailed = false;
  let categories: string[] = [];

  try {
    services = await getBrowseServices({ search, category, location, sort });
  } catch (error) {
    console.error("Failed to load wedding services:", error);
    loadFailed = true;
  }

  // Category filter dropdown — DB-র নিজের approved values থেকে।
  try {
    categories = await getBrowseCategories();
  } catch (error) {
    console.error("Failed to load service categories:", error);
  }

  return (
    <main className="bg-page py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Page Heading */}
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-wider text-brand">
            Browse Services
          </p>

          <h1 className="mt-2 text-3xl font-bold text-text-primary sm:text-4xl">
            Find the Right Wedding Service
          </h1>

          <p className="mt-3 text-sm text-text-secondary sm:text-base">
            Search approved services by name, category and location, then sort
            by price to compare vendors.
          </p>
        </div>

        {/* Search & Filter */}
        <form
          method="get"
          action="/services"
          className="mt-8 rounded-2xl border border-border-custom bg-surface p-4 shadow-sm sm:p-5"
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label
                htmlFor="browse-search"
                className="mb-2 block text-sm font-medium text-text-primary"
              >
                Service Name
              </label>

              <div className="relative">
                <Search
                  aria-hidden="true"
                  className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-muted"
                />
                <input
                  id="browse-search"
                  name="q"
                  type="search"
                  defaultValue={search}
                  placeholder="Search by service name"
                  className="w-full rounded-xl border border-border-custom bg-surface py-3 pl-9 pr-4 text-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="browse-category"
                className="mb-2 block text-sm font-medium text-text-primary"
              >
                Category
              </label>
              <select
                id="browse-category"
                name="category"
                defaultValue={category}
                className="w-full rounded-xl border border-border-custom bg-surface px-4 py-3 text-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
              >
                <option value="">All categories</option>
                {categories.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="browse-location"
                className="mb-2 block text-sm font-medium text-text-primary"
              >
                Location
              </label>
              <input
                id="browse-location"
                name="location"
                type="text"
                defaultValue={location}
                placeholder="e.g. Dhaka"
                className="w-full rounded-xl border border-border-custom bg-surface px-4 py-3 text-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
              />
            </div>

            <div>
              <label
                htmlFor="browse-sort"
                className="mb-2 block text-sm font-medium text-text-primary"
              >
                Sort By
              </label>
              <select
                id="browse-sort"
                name="sort"
                defaultValue={sort || "newest"}
                className="w-full rounded-xl border border-border-custom bg-surface px-4 py-3 text-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
              >
                <option value="newest">Newest first</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-3 border-t border-border-custom pt-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-text-secondary" role="status">
              {loadFailed
                ? "Services could not be loaded."
                : `${services.length} ${services.length === 1 ? "service" : "services"} found`}
              {hasFilters ? " with the current filters" : ""}
            </p>

            <div className="flex flex-wrap gap-2">
              {hasFilters ? (
                <Link
                  href="/services"
                  className="inline-flex h-10 items-center justify-center rounded-full border border-border-custom bg-surface px-5 text-sm font-medium text-text-secondary transition-colors hover:bg-brand-light"
                >
                  Clear filters
                </Link>
              ) : null}

              <button
                type="submit"
                className="inline-flex h-10 items-center justify-center rounded-full bg-brand px-5 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
              >
                Apply filters
              </button>
            </div>
          </div>
        </form>

        {/* Results */}
        <div className="mt-8">
          {loadFailed ? (
            <div
              role="alert"
              className="rounded-2xl border border-border-custom bg-surface px-6 py-16 text-center"
            >
              <h2 className="text-lg font-semibold text-text-primary">
                Unable to load services
              </h2>

              <p className="mt-2 text-sm text-text-secondary">
                Something went wrong while loading wedding services. Please
                refresh the page and try again.
              </p>
            </div>
          ) : services.length === 0 ? (
            <div className="rounded-2xl border border-border-custom bg-surface px-6 py-16 text-center">
              <h2 className="text-lg font-semibold text-text-primary">
                No services found
              </h2>

              <p className="mt-2 text-sm text-text-secondary">
                {hasFilters
                  ? "Try adjusting your search or filter to see more results."
                  : "New approved wedding services will appear here."}
              </p>

              {hasFilters ? (
                <Link
                  href="/services"
                  className="mt-5 inline-flex h-10 items-center justify-center rounded-full bg-brand px-5 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
                >
                  Clear filters
                </Link>
              ) : null}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {services.map((service) => {
                const vendorName =
                  service.vendorBusinessName ||
                  service.vendorName ||
                  "WedPlan vendor";

                const vendorDetail =
                  service.vendorBusinessName
                    ? service.vendorName
                    : service.vendorEmail;

                return (
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
                          <ImageOff
                            aria-hidden="true"
                            className="size-10 text-brand/50"
                          />
                        </div>
                      )}
                    </div>

                    {/* Service Information */}
                    <div className="p-5">
                      <p className="text-xs font-semibold uppercase tracking-wider text-brand">
                        {service.category || "Wedding Service"}
                      </p>

                      <h2 className="mt-2 line-clamp-1 text-lg font-bold text-text-primary">
                        {service.serviceName}
                      </h2>

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
                          <MapPin
                            aria-hidden="true"
                            className="size-3.5 shrink-0 text-brand"
                          />
                          <span className="truncate">
                            {service.location || "Location unavailable"}
                          </span>
                        </span>
                      </div>

                      {/* Vendor Information */}
                      <div className="mt-4 flex items-center gap-3 border-t border-border-custom pt-4">
                        <span
                          aria-hidden="true"
                          className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand-light text-xs font-bold text-brand-dark"
                        >
                          {getInitials(vendorName)}
                        </span>

                        <div className="min-w-0">
                          <p className="flex items-center gap-1.5 truncate text-sm font-semibold text-text-primary">
                            <Store
                              aria-hidden="true"
                              className="size-3.5 shrink-0 text-brand"
                            />
                            <span className="truncate">{vendorName}</span>
                          </p>

                          {vendorDetail ? (
                            <p className="truncate text-xs text-text-secondary">
                              {vendorDetail}
                            </p>
                          ) : null}
                        </div>
                      </div>

                      <Link
                        href={`/services/${service.id}`}
                        aria-label={`View details for ${service.serviceName}`}
                        className="mt-5 flex h-11 w-full items-center justify-center gap-2 rounded-full bg-brand text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
                      >
                        View Details
                        <ArrowRight aria-hidden="true" className="size-4" />
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
