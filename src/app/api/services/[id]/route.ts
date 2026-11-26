import { NextResponse } from "next/server";

import {
  authenticate,
  badRequest,
  forbidden,
  notFound,
  serverError,
} from "@/lib/api-auth";
import {
  servicesCollection,
  toObjectId,
  usersCollection,
} from "@/lib/collections";

export const runtime = "nodejs";

const EDITABLE_FIELDS = [
  "serviceName",
  "category",
  "description",
  "price",
  "location",
  "images",
] as const;

function premiumActive(user: Record<string, unknown> | null) {
  if (user?.subscriptionPlan !== "premium") {
    return false;
  }

  if (!user.subscriptionExpiresAt) {
    return true;
  }

  return new Date(String(user.subscriptionExpiresAt)).getTime() > Date.now();
}

/**
 * PATCH /api/services/:id
 * - Vendor: শুধু নিজের service, শুধু content + availability
 * - Admin : approval status + availability
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const auth = await authenticate(request, ["vendor", "admin"]);

    if (auth.error) {
      return auth.error;
    }

    const { id } = await params;
    const serviceId = toObjectId(id);

    if (!serviceId) {
      return badRequest("Invalid service ID.");
    }

    const body = (await request.json().catch(() => null)) as
      | Record<string, unknown>
      | null;

    if (!body) {
      return badRequest("Invalid request body.");
    }

    const now = new Date();

    if (auth.user.role === "vendor") {
      const vendorId = toObjectId(auth.user.id);

      if (!vendorId) {
        return badRequest("Invalid vendor account.");
      }

      // Ownership check — অন্য vendor-এর service ছোঁয়া যাবে না।
      const service = await servicesCollection().findOne({
        _id: serviceId,
        vendorId,
      });

      if (!service) {
        return notFound("Service not found.");
      }

      if (body.status !== undefined) {
        return forbidden("Only an admin can change approval status.");
      }

      const update: Record<string, unknown> = { updatedAt: now };

      for (const field of EDITABLE_FIELDS) {
        if (body[field] === undefined) {
          continue;
        }

        if (field === "price") {
          const price = Number(body.price);
          if (!Number.isFinite(price) || price <= 0) {
            return badRequest("Price must be greater than 0.");
          }
          update.price = price;
          continue;
        }

        if (field === "images") {
          if (!Array.isArray(body.images)) {
            return badRequest("Images must be an array.");
          }
          update.images = body.images
            .filter(
              (item): item is string => typeof item === "string" && !!item,
            )
            .slice(0, 8);
          continue;
        }

        const value = String(body[field] ?? "").trim();

        if (field === "serviceName" && value.length < 3) {
          return badRequest("Service name must be at least 3 characters.");
        }

        if (field === "description" && value.length < 20) {
          return badRequest("Description must be at least 20 characters.");
        }

        update[field] = value;
      }

      if (body.isActive !== undefined) {
        const nextActive = Boolean(body.isActive);

        if (
          nextActive &&
          service.status === "approved" &&
          !premiumActive(await usersCollection().findOne({ _id: vendorId }))
        ) {
          const activeCount = await servicesCollection().countDocuments({
            vendorId,
            status: "approved",
            isActive: true,
            _id: { $ne: serviceId },
          });

          if (activeCount >= 3) {
            return forbidden(
              "Free plan allows a maximum of 3 active services. Upgrade to Premium.",
            );
          }
        }

        update.isActive = nextActive;
      }

      await servicesCollection().updateOne(
        { _id: serviceId, vendorId },
        { $set: update },
      );

      return NextResponse.json({
        success: true,
        message: "Service updated successfully.",
      });
    }

    // ---- Admin path ----
    const service = await servicesCollection().findOne({ _id: serviceId });

    if (!service) {
      return notFound("Service not found.");
    }

    const update: Record<string, unknown> = { updatedAt: now };

    if (body.status !== undefined) {
      const nextStatus = String(body.status);

      if (!["approved", "rejected", "pending"].includes(nextStatus)) {
        return badRequest("Status must be approved, rejected or pending.");
      }

      if (nextStatus === "approved") {
        const vendorId = toObjectId(String(service.vendorId ?? ""));

        if (vendorId) {
          const vendor = await usersCollection().findOne({ _id: vendorId });

          if (!premiumActive(vendor)) {
            const activeCount = await servicesCollection().countDocuments({
              vendorId,
              status: "approved",
              isActive: true,
              _id: { $ne: serviceId },
            });

            if (activeCount >= 3) {
              return forbidden(
                "This vendor is on the Free plan and already has 3 active services.",
              );
            }
          }
        }
      }

      update.status = nextStatus;
      update.reviewedAt = now;
      update.reviewedBy = toObjectId(auth.user.id);
    }

    if (body.isActive !== undefined) {
      update.isActive = Boolean(body.isActive);
    }

    await servicesCollection().updateOne({ _id: serviceId }, { $set: update });

    return NextResponse.json({
      success: true,
      message: "Service updated successfully.",
    });
  } catch (error) {
    return serverError(error);
  }
}

/**
 * DELETE /api/services/:id
 * - Vendor: শুধু নিজের service
 * - Admin : যেকোনো service
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const auth = await authenticate(request, ["vendor", "admin"]);

    if (auth.error) {
      return auth.error;
    }

    const { id } = await params;
    const serviceId = toObjectId(id);

    if (!serviceId) {
      return badRequest("Invalid service ID.");
    }

    const filter: Record<string, unknown> = { _id: serviceId };

    if (auth.user.role === "vendor") {
      const vendorId = toObjectId(auth.user.id);

      if (!vendorId) {
        return badRequest("Invalid vendor account.");
      }

      filter.vendorId = vendorId;
    }

    const result = await servicesCollection().deleteOne(filter);

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
