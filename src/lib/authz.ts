import { cache } from "react";
import { headers } from "next/headers";

import { auth } from "@/app/lib/auth";
import { isAppRole, type AppRole } from "./roles";

export type SessionUser = {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role: AppRole;
  isBlocked?: boolean | null;
  businessName?: string | null;
  subscriptionPlan?: string | null;
  subscriptionExpiresAt?: Date | string | null;
};

type RawUser = {
  id?: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role?: string | null;
  isBlocked?: boolean | null;
  businessName?: string | null;
  subscriptionPlan?: string | null;
  subscriptionExpiresAt?: Date | string | null;
};

/**
 * Better Auth session-এর user-কে নিরাপদ, predictable shape-এ আনি।
 * Role সবসময় server-এর session record থেকে আসে — client থেকে নয়।
 */
export function normalizeSessionUser(user: RawUser | null | undefined): SessionUser | null {
  if (!user?.id) {
    return null;
  }

  return {
    id: user.id,
    name: user.name ?? null,
    email: user.email ?? null,
    image: user.image ?? null,
    role: isAppRole(user.role) ? user.role : "customer",
    isBlocked: user.isBlocked ?? false,
    businessName: user.businessName ?? null,
    subscriptionPlan: user.subscriptionPlan ?? "free",
    subscriptionExpiresAt: user.subscriptionExpiresAt ?? null,
  };
}

/** API route handler-এর জন্য — request-এর header থেকেই session যাচাই হয়। */
export async function getSessionUserFromHeaders(
  requestHeaders: Headers,
): Promise<SessionUser | null> {
  const session = await auth.api.getSession({ headers: requestHeaders });
  return normalizeSessionUser(session?.user as RawUser | undefined);
}

/**
 * Server component-এর জন্য। React `cache` একই request-এ বারবার
 * DB/session call হলে সেটা একবারই চালায়।
 */
export const getCurrentUser = cache(async (): Promise<SessionUser | null> => {
  const requestHeaders = await headers();
  return getSessionUserFromHeaders(requestHeaders);
});
