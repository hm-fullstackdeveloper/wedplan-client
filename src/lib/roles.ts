export type AppRole = "customer" | "vendor" | "admin";

export const APP_ROLES: AppRole[] = ["customer", "vendor", "admin"];

export const ROLE_LABELS: Record<AppRole, string> = {
  customer: "Customer",
  vendor: "Vendor",
  admin: "Admin",
};

export function isAppRole(value: unknown): value is AppRole {
  return value === "customer" || value === "vendor" || value === "admin";
}

/** Logged-in user-কে তার নিজের dashboard-এ পাঠানোর path। */
export function dashboardPath(role: string | null | undefined): string {
  if (role === "vendor") {
    return "/vendor/dashboard";
  }

  if (role === "admin") {
    return "/admin/dashboard";
  }

  return "/customer/dashboard";
}
