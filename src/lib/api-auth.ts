import { NextResponse } from "next/server";

import { getSessionUserFromHeaders, type SessionUser } from "./authz";
import type { AppRole } from "./roles";

type AuthSuccess = { user: SessionUser; error: null };
type AuthFailure = { user: null; error: NextResponse };

/**
 * সব protected API-এর প্রথম gate।
 * - session নেই        → 401
 * - account blocked    → 403
 * - role অনুমোদিত নয়  → 403
 */
export async function authenticate(
  request: Request,
  allowedRoles?: AppRole[],
): Promise<AuthSuccess | AuthFailure> {
  const user = await getSessionUserFromHeaders(request.headers);

  if (!user) {
    return {
      user: null,
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  if (user.isBlocked) {
    return {
      user: null,
      error: NextResponse.json(
        { error: "Your account has been blocked." },
        { status: 403 },
      ),
    };
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return {
      user: null,
      error: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    };
  }

  return { user, error: null };
}

export function badRequest(message: string) {
  return NextResponse.json({ error: message }, { status: 400 });
}

export function notFound(message = "Not found") {
  return NextResponse.json({ error: message }, { status: 404 });
}

export function forbidden(message = "Forbidden") {
  return NextResponse.json({ error: message }, { status: 403 });
}

export function serverError(error: unknown) {
  console.error(error);
  return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
}
