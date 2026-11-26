import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { requireDashboardRole } from "@/lib/dashboard-guard";

export default async function VendorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireDashboardRole("vendor");

  return (
    <DashboardShell role="vendor" user={user}>
      {children}
    </DashboardShell>
  );
}
