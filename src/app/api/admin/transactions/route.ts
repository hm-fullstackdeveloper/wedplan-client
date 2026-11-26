import { NextResponse } from "next/server";

import { authenticate, serverError } from "@/lib/api-auth";
import { getAdminTransactions } from "@/lib/dashboard-data";

export const runtime = "nodejs";

/**
 * শুধু read-only। Admin কখনো payment status বদলাতে পারবে না —
 * সেটা শুধু verified Stripe webhook করতে পারে।
 */
export async function GET(request: Request) {
  try {
    const auth = await authenticate(request, ["admin"]);

    if (auth.error) {
      return auth.error;
    }

    return NextResponse.json({
      transactions: await getAdminTransactions(),
    });
  } catch (error) {
    return serverError(error);
  }
}
