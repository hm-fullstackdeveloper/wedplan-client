import { NextResponse, type NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

/**
 * Private route protection.
 *
 * এখানে শুধু session cookie আছে কিনা দেখা হয় (দ্রুত check)।
 * Cookie থাকলেও session expired হতে পারে — তাই page নিজেও
 * `useSession` দিয়ে আসল validation করে।
 */
export function middleware(request: NextRequest) {
  const sessionCookie = getSessionCookie(request);

  if (!sessionCookie) {
    const signInUrl = new URL("/sign-in", request.url);
    signInUrl.searchParams.set("redirect", request.nextUrl.pathname);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/profile/:path*",
    "/dashboard/:path*",
    "/customer/:path*",
    "/vendor/:path*",
    "/admin/:path*",
  ],
};
