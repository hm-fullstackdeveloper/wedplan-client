import { redirect } from "next/navigation";

import { getCurrentUser, type SessionUser } from "./authz";
import { dashboardPath, type AppRole } from "./roles";

/**
 * প্রতিটি dashboard layout/page-এর প্রথম কাজ:
 *   1. login আছে কি? না থাকলে Sign In
 *   2. account blocked? হলে /blocked
 *   3. role মিলছে? না হলে নিজের dashboard-এ
 *
 * এটা server-side check — URL হাতে বদলালেও bypass হবে না।
 */
export async function requireDashboardRole(role: AppRole): Promise<SessionUser> {
  const user = await getCurrentUser();

  if (!user) {
    redirect(`/sign-in?redirect=/${role}/dashboard`);
  }

  if (user.isBlocked) {
    redirect("/blocked");
  }

  if (user.role !== role) {
    redirect(dashboardPath(user.role));
  }

  return user;
}
