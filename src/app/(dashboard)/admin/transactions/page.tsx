import { Receipt, ShieldCheck } from "lucide-react";

import { EmptyState } from "@/components/dashboard/empty-state";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { requireDashboardRole } from "@/lib/dashboard-guard";
import { getAdminTransactions } from "@/lib/dashboard-data";
import { formatCurrency, formatDate } from "@/lib/format";

export default async function AdminTransactionsPage() {
  await requireDashboardRole("admin");
  const transactions = await getAdminTransactions();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Transactions"
        description="Monitor vendor subscription payments. Payment status is controlled only by verified Stripe events."
      />

      <div className="flex items-start gap-2 rounded-2xl border border-info/30 bg-info-light/60 p-4 text-xs text-info">
        <ShieldCheck className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
        <p>
          Admins can view transactions but cannot mark an unsuccessful payment
          as successful. Premium access changes only through a verified Stripe
          webhook.
        </p>
      </div>

      {transactions.length === 0 ? (
        <EmptyState
          icon={Receipt}
          title="No transactions yet"
          description="Vendor subscription payments will appear here once Stripe is configured."
        />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border-custom bg-surface shadow-sm">
          <table className="w-full min-w-[920px] text-left text-sm">
            <thead className="border-b border-border-custom bg-brand-light/40 text-xs uppercase tracking-wide text-text-muted">
              <tr>
                <th className="px-4 py-3 font-semibold">Vendor</th>
                <th className="px-4 py-3 font-semibold">Plan</th>
                <th className="px-4 py-3 font-semibold">Amount</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Date</th>
                <th className="px-4 py-3 font-semibold">Stripe Session</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-custom">
              {transactions.map((transaction) => (
                <tr
                  key={transaction.id}
                  className="hover:bg-brand-light/20"
                >
                  <td className="px-4 py-3">
                    <p className="font-semibold text-text-primary">
                      {transaction.vendorBusinessName || transaction.vendorName}
                    </p>
                    <p className="text-xs text-text-secondary">
                      {transaction.vendorEmail || "—"}
                    </p>
                  </td>
                  <td className="px-4 py-3 capitalize text-text-secondary">
                    {transaction.plan}
                  </td>
                  <td className="px-4 py-3 font-semibold text-text-primary">
                    {formatCurrency(transaction.amount, transaction.currency)}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={transaction.status} />
                  </td>
                  <td className="px-4 py-3 text-text-secondary">
                    {formatDate(transaction.createdAt)}
                  </td>
                  <td className="max-w-[220px] truncate px-4 py-3 font-mono text-xs text-text-muted">
                    {transaction.stripeSessionId || "—"}
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
