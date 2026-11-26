import { notFound } from "next/navigation";

import { PageHeader } from "@/components/dashboard/page-header";
import { ServiceForm } from "@/components/dashboard/vendor/service-form";
import { requireDashboardRole } from "@/lib/dashboard-guard";
import { getVendorService } from "@/lib/dashboard-data";

export default async function EditServicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireDashboardRole("vendor");
  const { id } = await params;
  const service = await getVendorService(user.id, id);

  if (!service) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Edit Service"
        description="Update your service details. Changes to an approved service keep their current approval status."
      />

      <ServiceForm
        mode="edit"
        serviceId={service.id}
        initial={{
          serviceName: service.serviceName,
          category: service.category,
          description: service.description,
          price: service.price !== null ? String(service.price) : "",
          location: service.location,
          images: service.images,
        }}
      />
    </div>
  );
}
