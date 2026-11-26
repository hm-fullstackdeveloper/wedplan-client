import { NextResponse } from "next/server";

import { authenticate, serverError } from "@/lib/api-auth";
import { getAdminServices } from "@/lib/dashboard-data";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const auth = await authenticate(request, ["admin"]);

    if (auth.error) {
      return auth.error;
    }

    return NextResponse.json({ services: await getAdminServices() });
  } catch (error) {
    return serverError(error);
  }
}
