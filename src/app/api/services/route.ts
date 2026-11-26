import { NextResponse } from "next/server";

import {
  authenticate,
  badRequest,
  forbidden,
  serverError,
} from "@/lib/api-auth";
import { getSessionUserFromHeaders } from "@/lib/authz";
import {
  servicesCollection,
  toObjectId,
  usersCollection,
} from "@/lib/collections";
import { getAdminServices, getVendorServices } from "@/lib/dashboard-data";

export const runtime = "nodejs";

function premiumActive(user: Record<string, unknown> | null) {
  if (user?.subscriptionPlan !== "premium") {
    return false;
  }

  if (!user.subscriptionExpiresAt) {
    return true;
  }

  return new Date(String(user.subscriptionExpiresAt)).getTime() > Date.now();
}

function sanitizeImages(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((item): item is string => typeof item === "string" && !!item)
    .slice(0, 8);
}

/**
 * GET /api/services
 * - Vendor  → শুধু নিজের services
 * - Admin   → সব services
 * - অন্যসব  → শুধু approved + active (public)
 */
export async function GET(request: Request) {
  try {
    const user = await getSessionUserFromHeaders(request.headers);

    if (user?.isBlocked) {
      return NextResponse.json(
        { error: "Your account has been blocked." },
        { status: 403 },
      );
    }

    if (user?.role === "admin") {
      return NextResponse.json({ services: await getAdminServices() });
    }

    if (user?.role === "vendor") {
      return NextResponse.json({ services: await getVendorServices(user.id) });
    }

    const services = await servicesCollection()
      .find({ status: "approved", isActive: true })
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({ services });
  } catch (error) {
    return serverError(error);
  }
}

/**
 * POST /api/services — শুধু vendor।
 * vendorId, status, isActive কখনো body থেকে নেওয়া হয় না।
 */
export async function POST(request: Request) {
  try {
    const auth = await authenticate(request, ["vendor"]);

    if (auth.error) {
      return auth.error;
    }

    const user = auth.user;
    const vendorId = toObjectId(user.id);

    if (!vendorId) {
      return badRequest("Invalid vendor account.");
    }

    const body = (await request.json().catch(() => null)) as
      | Record<string, unknown>
      | null;

    if (!body) {
      return badRequest("Invalid request body.");
    }

    const serviceName = String(body.serviceName ?? "").trim();
    const category = String(body.category ?? "").trim();
    const description = String(body.description ?? "").trim();
    const location = String(body.location ?? "").trim();
    const price = Number(body.price);
    const images = sanitizeImages(body.images);

    if (serviceName.length < 3) {
      return badRequest("Service name must be at least 3 characters.");
    }

    if (!category) {
      return badRequest("Service category is required.");
    }

    if (description.length < 20) {
      return badRequest("Description must be at least 20 characters.");
    }

    if (!Number.isFinite(price) || price <= 0) {
      return badRequest("Price must be greater than 0.");
    }

    if (!location) {
      return badRequest("Location is required.");
    }

    const vendorDoc = await usersCollection().findOne({ _id: vendorId });

    if (!vendorDoc) {
      return forbidden("Vendor account not found.");
    }

    if (!premiumActive(vendorDoc)) {
      // Free plan-এ rejected বাদে সর্বোচ্চ ৩টি service রাখা যাবে।
      const existing = await servicesCollection().countDocuments({
        vendorId,
        status: { $ne: "rejected" },
      });

      if (existing >= 3) {
        return forbidden(
          "Free plan allows a maximum of 3 services. Upgrade to Premium to add more.",
        );
      }
    }

    const now = new Date();

    const result = await servicesCollection().insertOne({
      vendorId,
      serviceName,
      category,
      description,
      price,
      location,
      images,
      // Server-নিয়ন্ত্রিত field — client এগুলো বদলাতে পারবে না।
      status: "pending",
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });

    return NextResponse.json(
      {
        success: true,
        id: String(result.insertedId),
        message:
          "Service submitted for admin approval. It is not public until approved.",
      },
      { status: 201 },
    );
  } catch (error) {
    return serverError(error);
  }
}
