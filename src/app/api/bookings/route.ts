import { NextResponse } from "next/server";

import {
  authenticate,
  badRequest,
  forbidden,
  serverError,
} from "@/lib/api-auth";
import {
  bookingsCollection,
  servicesCollection,
  toObjectId,
} from "@/lib/collections";
import {
  getAllBookings,
  getCustomerBookings,
  getVendorBookings,
} from "@/lib/dashboard-data";

export const runtime = "nodejs";

/**
 * GET /api/bookings
 * - Customer → শুধু নিজের bookings
 * - Vendor   → শুধু নিজের services-এর bookings
 * - Admin    → সব
 */
export async function GET(request: Request) {
  try {
    const auth = await authenticate(request);

    if (auth.error) {
      return auth.error;
    }

    const user = auth.user;

    if (user.role === "admin") {
      return NextResponse.json({ bookings: await getAllBookings() });
    }

    if (user.role === "vendor") {
      return NextResponse.json({
        bookings: await getVendorBookings(user.id),
      });
    }

    return NextResponse.json({
      bookings: await getCustomerBookings(user.id),
    });
  } catch (error) {
    return serverError(error);
  }
}

/**
 * POST /api/bookings — শুধু customer।
 * customerId কখনো body থেকে নেওয়া হয় না।
 */
export async function POST(request: Request) {
  try {
    const auth = await authenticate(request, ["customer"]);

    if (auth.error) {
      return auth.error;
    }

    const customerId = toObjectId(auth.user.id);

    if (!customerId) {
      return badRequest("Invalid customer account.");
    }

    const body = (await request.json().catch(() => null)) as
      | Record<string, unknown>
      | null;

    if (!body) {
      return badRequest("Invalid request body.");
    }

    const serviceId = toObjectId(String(body.serviceId ?? ""));
    const eventDate = String(body.eventDate ?? "").trim();
    const eventLocation = String(body.eventLocation ?? "").trim();
    const message = String(body.message ?? "").trim().slice(0, 1000);

    if (!serviceId || !eventDate || !eventLocation) {
      return badRequest("Service, event date and event location are required.");
    }

    const service = await servicesCollection().findOne({
      _id: serviceId,
      status: "approved",
      isActive: true,
    });

    if (!service) {
      return badRequest("This service is not available for booking.");
    }

    if (String(service.vendorId) === String(customerId)) {
      return forbidden("You cannot book your own service.");
    }

    const duplicate = await bookingsCollection().findOne({
      serviceId,
      customerId,
      eventDate,
      status: { $in: ["pending", "accepted"] },
    });

    if (duplicate) {
      return NextResponse.json(
        {
          error:
            "You already have an active booking for this service on this date.",
        },
        { status: 409 },
      );
    }

    const now = new Date();

    const result = await bookingsCollection().insertOne({
      serviceId,
      vendorId: service.vendorId,
      customerId,
      eventDate,
      eventLocation,
      message,
      status: "pending",
      createdAt: now,
      updatedAt: now,
    });

    return NextResponse.json(
      {
        success: true,
        id: String(result.insertedId),
        message: "Booking request sent to the vendor.",
      },
      { status: 201 },
    );
  } catch (error) {
    return serverError(error);
  }
}
