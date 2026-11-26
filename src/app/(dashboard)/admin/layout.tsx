import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { requireDashboardRole } from "@/lib/dashboard-guard";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireDashboardRole("admin");

  return (
    <DashboardShell role="admin" user={user}>
      {children}
    </DashboardShell>
  );
}
