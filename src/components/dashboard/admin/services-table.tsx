"use client";

import { useMemo, useState } from "react";
import { ImageOff, Search, Wrench } from "lucide-react";

import type { ServiceRow } from "@/lib/dashboard-data";
import { AdminServiceActions } from "./service-actions";
import { EmptyState } from "@/components/dashboard/empty-state";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { formatDate, formatPrice } from "@/lib/format";

export function AdminServicesTable({ services }: { services: ServiceRow[] }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");

  const filtered = useMemo(() => {
    const search = query.trim().toLowerCase();

    return services.filter((service) => {
      const matchesStatus = status === "all" || service.status === status;
      const matchesSearch =
        !search ||
        service.serviceName.toLowerCase().includes(search) ||
        service.vendorName.toLowerCase().includes(search) ||
        service.vendorBusinessName.toLowerCase().includes(search) ||
        service.category.toLowerCase().includes(search);

      return matchesStatus && matchesSearch;
    });
  }, [services, query, status]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 rounded-2xl border border-border-custom bg-surface p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-sm">
          <Search
            className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-text-muted"
            aria-hidden="true"
          />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search service, vendor or category..."
            className="w-full rounded-xl border border-border-custom bg-surface py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
          />
        </div>

        <select
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          aria-label="Filter by status"
          className="rounded-xl border border-border-custom bg-surface px-4 py-2.5 text-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
        >
          <option value="all">All statuses</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      <p className="text-sm text-text-secondary">
        Showing <strong className="text-text-primary">{filtered.length}</strong>{" "}
        of {services.length} services
      </p>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Wrench}
          title="No services found"
          description="Try a different search term or status filter."
        />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border-custom bg-surface shadow-sm">
          <table className="w-full min-w-[980px] text-left text-sm">
            <thead className="border-b border-border-custom bg-brand-light/40 text-xs uppercase tracking-wide text-text-muted">
              <tr>
                <th className="px-4 py-3 font-semibold">Service</th>
                <th className="px-4 py-3 font-semibold">Vendor</th>
                <th className="px-4 py-3 font-semibold">Price</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Active</th>
                <th className="px-4 py-3 font-semibold">Submitted</th>
                <th className="px-4 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-custom">
              {filtered.map((service) => (
                <tr key={service.id} className="hover:bg-brand-light/20">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="relative flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-brand-light">
                        {service.images[0] ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={service.images[0]}
                            alt=""
                            className="absolute inset-0 size-full object-cover"
                          />
                        ) : (
                          <ImageOff
                            className="size-4 text-brand/50"
                            aria-hidden="true"
                          />
                        )}
                      </span>
                      <div className="min-w-0">
                        <p className="max-w-[220px] truncate font-semibold text-text-primary">
                          {service.serviceName}
                        </p>
                        <p className="text-xs text-text-secondary">
                          {service.category || "Uncategorised"}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="max-w-[180px] truncate text-text-primary">
                      {service.vendorBusinessName || service.vendorName}
                    </p>
                    <p className="max-w-[180px] truncate text-xs text-text-secondary">
                      {service.vendorEmail}
                    </p>
                  </td>
                  <td className="px-4 py-3 font-semibold text-text-primary">
                    {formatPrice(service.price)}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={service.status} />
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge
                      status={service.isActive ? "active" : "inactive"}
                    />
                  </td>
                  <td className="px-4 py-3 text-text-secondary">
                    {formatDate(service.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    <AdminServiceActions
                      serviceId={service.id}
                      status={service.status}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
