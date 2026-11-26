import { PageHeader } from "@/components/dashboard/page-header";
import { AdminUsersTable } from "@/components/dashboard/admin/users-table";
import { requireDashboardRole } from "@/lib/dashboard-guard";
import { getAdminUsers } from "@/lib/dashboard-data";

export default async function AdminUsersPage() {
  const user = await requireDashboardRole("admin");
  const users = await getAdminUsers();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Manage Users"
        description="View, search, filter, block, and unblock registered accounts."
      />

      <AdminUsersTable users={users} currentUserId={user.id} />
    </div>
  );
}
