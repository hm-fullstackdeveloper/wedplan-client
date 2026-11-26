import Link from "next/link";
import {
  CreditCard,
  Receipt,
  ShieldCheck,
  Store,
  Users,
  UserRound,
  Wrench,
} from "lucide-react";

import { EmptyState } from "@/components/dashboard/empty-state";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { requireDashboardRole } from "@/lib/dashboard-guard";
import {
  getAdminServices,
  getAdminStats,
  getAdminTransactions,
} from "@/lib/dashboard-data";
import { formatCurrency, formatDate } from "@/lib/format";

export default async function AdminDashboardPage() {
  await requireDashboardRole("admin");

  const [stats, services, transactions] = await Promise.all([
    getAdminStats(),
    getAdminServices(),
    getAdminTransactions(),
  ]);

  const pendingServices = services.filter(
    (service) => service.status === "pending",
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Platform Overview"
        description="Monitor users, services, and payments across WedPlan."
        action={
          <span className="inline-flex items-center gap-2 rounded-full bg-info-light px-4 py-2 text-xs font-semibold text-info">
            <ShieldCheck className="size-4" aria-hidden="true" />
            Admin Console
          </span>
        }
      />

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard
          label="Total Registered Users"
          value={stats.totalUsers}
          hint="All platform accounts"
          icon={Users}
          tone="brand"
        />
        <StatCard
          label="Total Vendors"
          value={stats.totalVendors}
          hint="Service providers"
          icon={Store}
          tone="success"
        />
        <StatCard
          label="Total Customers"
          value={stats.totalCustomers}
          hint="Couples using WedPlan"
          icon={UserRound}
          tone="info"
        />
        <StatCard
          label="Total Services"
          value={stats.totalServices}
          hint="All submitted services"
          icon={Wrench}
          tone="brand"
        />
        <StatCard
          label="Pending Services"
          value={stats.pendingServices}
          hint="Waiting for your review"
          icon={CreditCard}
          tone="warning"
        />
        <StatCard
          label="Total Transactions"
          value={stats.totalTransactions}
          hint="Subscription payments"
          icon={Receipt}
          tone="info"
        />
      </section>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <section className="rounded-2xl border border-border-custom bg-surface p-5 shadow-sm sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-text-primary">
                Services Awaiting Review
              </h2>
              <p className="text-sm text-text-secondary">
                Approve or reject vendor submissions.
              </p>
            </div>
            <Link
              href="/admin/services"
              className="text-sm font-semibold text-brand hover:underline"
            >
              Manage
            </Link>
          </div>

          <div className="mt-4">
            {pendingServices.length === 0 ? (
              <EmptyState
                icon={Wrench}
                title="Nothing to review"
                description="All submitted services have been reviewed."
              />
            ) : (
              <ul className="divide-y divide-border-custom">
                {pendingServices.slice(0, 5).map((service) => (
                  <li
                    key={service.id}
                    className="flex items-center justify-between gap-3 py-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-text-primary">
                        {service.serviceName}
                      </p>
                      <p className="truncate text-xs text-text-secondary">
                        {service.vendorBusinessName || service.vendorName} ·{" "}
                        {formatDate(service.createdAt)}
                      </p>
                    </div>
                    <StatusBadge status={service.status} />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-border-custom bg-surface p-5 shadow-sm sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-text-primary">
                Recent Transactions
              </h2>
              <p className="text-sm text-text-secondary">
                Verified subscription payments.
              </p>
            </div>
            <Link
              href="/admin/transactions"
              className="text-sm font-semibold text-brand hover:underline"
            >
              View all
            </Link>
          </div>

          <div className="mt-4">
            {transactions.length === 0 ? (
              <EmptyState
                icon={Receipt}
                title="No transactions yet"
                description="Vendor subscription payments will appear here."
              />
            ) : (
              <ul className="divide-y divide-border-custom">
                {transactions.slice(0, 5).map((transaction) => (
                  <li
                    key={transaction.id}
                    className="flex items-center justify-between gap-3 py-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-text-primary">
                        {transaction.vendorBusinessName ||
                          transaction.vendorName}
                      </p>
                      <p className="truncate text-xs capitalize text-text-secondary">
                        {transaction.plan} plan ·{" "}
                        {formatDate(transaction.createdAt)}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <span className="text-sm font-semibold text-text-primary">
                        {formatCurrency(transaction.amount, transaction.currency)}
                      </span>
                      <StatusBadge status={transaction.status} />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
