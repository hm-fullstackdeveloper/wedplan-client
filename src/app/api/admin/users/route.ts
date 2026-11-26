import { NextResponse } from "next/server";

import { authenticate, serverError } from "@/lib/api-auth";
import { getAdminUsers } from "@/lib/dashboard-data";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const auth = await authenticate(request, ["admin"]);

    if (auth.error) {
      return auth.error;
    }

    return NextResponse.json({ users: await getAdminUsers() });
  } catch (error) {
    return serverError(error);
  }
}
