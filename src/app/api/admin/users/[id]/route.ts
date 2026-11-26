import { NextResponse } from "next/server";

import {
  authenticate,
  badRequest,
  notFound,
  serverError,
} from "@/lib/api-auth";
import { toObjectId, usersCollection } from "@/lib/collections";

export const runtime = "nodejs";

/**
 * PATCH /api/admin/users/:id
 * শুধু block/unblock। Role পরিবর্তন বা নিজের account block করা যাবে না।
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const auth = await authenticate(request, ["admin"]);

    if (auth.error) {
      return auth.error;
    }

    const { id } = await params;
    const userId = toObjectId(id);

    if (!userId) {
      return badRequest("Invalid user ID.");
    }

    if (String(userId) === String(auth.user.id)) {
      return badRequest("You cannot block your own admin account.");
    }

    const body = (await request.json().catch(() => null)) as
      | { isBlocked?: unknown }
      | null;

    if (typeof body?.isBlocked !== "boolean") {
      return badRequest("isBlocked must be true or false.");
    }

    const result = await usersCollection().updateOne(
      { _id: userId },
      { $set: { isBlocked: body.isBlocked, updatedAt: new Date() } },
    );

    if (result.matchedCount === 0) {
      return notFound("User not found.");
    }

    return NextResponse.json({
      success: true,
      message: body.isBlocked ? "User blocked." : "User unblocked.",
    });
  } catch (error) {
    return serverError(error);
  }
}
