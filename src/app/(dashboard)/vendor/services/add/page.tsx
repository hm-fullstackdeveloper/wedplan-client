import { PageHeader } from "@/components/dashboard/page-header";
import { ServiceForm } from "@/components/dashboard/vendor/service-form";
import { requireDashboardRole } from "@/lib/dashboard-guard";

export default async function AddServicePage() {
  await requireDashboardRole("vendor");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Add Service"
        description="Create a new wedding service. New services start as Pending and require admin approval."
      />

      <div className="rounded-2xl border border-border-custom bg-brand-light/40 p-4 text-sm text-text-secondary">
        <p className="font-medium text-brand-dark">
          Approval required before public visibility.
        </p>
        <p className="mt-1 text-xs text-text-muted">
          Fill in every required field and add clear images. Once submitted, an
          admin will review your service.
        </p>
      </div>

      <ServiceForm mode="add" />
    </div>
  );
}
