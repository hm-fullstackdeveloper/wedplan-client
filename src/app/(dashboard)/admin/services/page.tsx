import { PageHeader } from "@/components/dashboard/page-header";
import { AdminServicesTable } from "@/components/dashboard/admin/services-table";
import { requireDashboardRole } from "@/lib/dashboard-guard";
import { getAdminServices } from "@/lib/dashboard-data";

export default async function AdminServicesPage() {
  await requireDashboardRole("admin");
  const services = await getAdminServices();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Manage Services"
        description="Review submissions, approve or reject services, and remove inappropriate listings."
      />

      <AdminServicesTable services={services} />
    </div>
  );
}
