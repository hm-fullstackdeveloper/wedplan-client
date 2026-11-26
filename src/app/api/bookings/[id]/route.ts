import { NextResponse } from "next/server";

import {
  authenticate,
  badRequest,
  forbidden,
  notFound,
  serverError,
} from "@/lib/api-auth";
import { bookingsCollection, toObjectId } from "@/lib/collections";

export const runtime = "nodejs";

/**
 * PATCH /api/bookings/:id
 * - Customer: শুধু নিজের pending booking cancel
 * - Vendor  : শুধু নিজের pending booking accept/reject
 * - একবার process হলে আর বদলানো যাবে না (atomic filter)।
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const auth = await authenticate(request, ["customer", "vendor"]);

    if (auth.error) {
      return auth.error;
    }

    const { id } = await params;
    const bookingId = toObjectId(id);

    if (!bookingId) {
      return badRequest("Invalid booking ID.");
    }

    const body = (await request.json().catch(() => null)) as
      | { action?: string }
      | null;

    const action = body?.action;
    const now = new Date();

    if (auth.user.role === "customer") {
      if (action !== "cancel") {
        return forbidden("Customers can only cancel their own bookings.");
      }

      const customerId = toObjectId(auth.user.id);

      if (!customerId) {
        return badRequest("Invalid customer account.");
      }

      const result = await bookingsCollection().updateOne(
        { _id: bookingId, customerId, status: "pending" },
        { $set: { status: "cancelled", updatedAt: now } },
      );

      if (result.matchedCount === 0) {
        const exists = await bookingsCollection().findOne({
          _id: bookingId,
          customerId,
        });

        if (!exists) {
          return notFound("Booking not found.");
        }

        return NextResponse.json(
          { error: "Only pending bookings can be cancelled." },
          { status: 409 },
        );
      }

      return NextResponse.json({
        success: true,
        message: "Booking cancelled.",
      });
    }

    // ---- Vendor ----
    if (action !== "accept" && action !== "reject") {
      return forbidden("Vendors can only accept or reject bookings.");
    }

    const vendorId = toObjectId(auth.user.id);

    if (!vendorId) {
      return badRequest("Invalid vendor account.");
    }

    const nextStatus = action === "accept" ? "accepted" : "rejected";

    const result = await bookingsCollection().updateOne(
      { _id: bookingId, vendorId, status: "pending" },
      { $set: { status: nextStatus, updatedAt: now } },
    );

    if (result.matchedCount === 0) {
      const exists = await bookingsCollection().findOne({
        _id: bookingId,
        vendorId,
      });

      if (!exists) {
        return notFound("Booking not found.");
      }

      return NextResponse.json(
        { error: "Only pending bookings can be accepted or rejected." },
        { status: 409 },
      );
    }

    return NextResponse.json({
      success: true,
      message: `Booking ${nextStatus}.`,
    });
  } catch (error) {
    return serverError(error);
  }
}
