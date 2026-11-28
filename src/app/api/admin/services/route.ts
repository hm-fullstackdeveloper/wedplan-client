import { NextResponse } from "next/server";

import {
  authenticate,
  badRequest,
  notFound,
  serverError,
} from "@/lib/api-auth";
import { getAdminServices } from "@/lib/dashboard-data";
import { servicesCollection, toObjectId } from "@/lib/collections";

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

/**
 * DELETE /api/admin/services — শুধু Admin।
 * Vendor নিজের service delete করতে পারে সেটা `/api/services/:id` দিয়ে —
 * সেটার আচরণ অপরিবর্তিত রাখা হয়েছে।
 */
export async function DELETE(request: Request) {
  try {
    const auth = await authenticate(request, ["admin"]);

    if (auth.error) {
      return auth.error;
    }

    const body = (await request.json().catch(() => null)) as
      | Record<string, unknown>
      | null;

    const serviceId = toObjectId(String(body?.id ?? ""));

    if (!serviceId) {
      return badRequest("Invalid service ID.");
    }

    const result = await servicesCollection().deleteOne({ _id: serviceId });

    if (result.deletedCount === 0) {
      return notFound("Service not found.");
    }

    return NextResponse.json({
      success: true,
      message: "Service deleted successfully.",
    });
  } catch (error) {
    return serverError(error);
  }
}
