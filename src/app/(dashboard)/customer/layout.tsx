import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { requireDashboardRole } from "@/lib/dashboard-guard";

export default async function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireDashboardRole("customer");

  return (
    <DashboardShell role="customer" user={user}>
      {children}
    </DashboardShell>
  );
}
