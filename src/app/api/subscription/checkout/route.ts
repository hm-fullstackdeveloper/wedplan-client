import Stripe from "stripe";
import { NextResponse } from "next/server";

import { authenticate, forbidden, serverError } from "@/lib/api-auth";
import {
  toObjectId,
  transactionsCollection,
  usersCollection,
} from "@/lib/collections";

export const runtime = "nodejs";

function premiumActive(vendor: Record<string, unknown> | null) {
  if (vendor?.subscriptionPlan !== "premium") {
    return false;
  }

  if (!vendor.subscriptionExpiresAt) {
    return true;
  }

  return new Date(String(vendor.subscriptionExpiresAt)).getTime() > Date.now();
}

/**
 * POST /api/subscription/checkout
 * শুধু vendor নিজের Premium subscription শুরু করতে পারবে।
 * এখানে কোনো premium activate হয় না — শুধু Stripe checkout session তৈরি হয়।
 */
export async function POST(request: Request) {
  try {
    const auth = await authenticate(request, ["vendor"]);

    if (auth.error) {
      return auth.error;
    }

    const secretKey = process.env.STRIPE_SECRET_KEY;
    const priceId = process.env.STRIPE_PREMIUM_PRICE_ID;

    if (!secretKey || !priceId) {
      return NextResponse.json(
        {
          error:
            "Stripe is not configured. Add STRIPE_SECRET_KEY and STRIPE_PREMIUM_PRICE_ID to .env.",
        },
        { status: 503 },
      );
    }

    const vendorId = toObjectId(auth.user.id);

    if (!vendorId) {
      return NextResponse.json(
        { error: "Invalid vendor account." },
        { status: 400 },
      );
    }

    const vendor = await usersCollection().findOne({ _id: vendorId });

    if (!vendor) {
      return forbidden("Vendor account not found.");
    }

    if (premiumActive(vendor)) {
      return NextResponse.json(
        { error: "Your Premium plan is already active." },
        { status: 409 },
      );
    }

    const origin = new URL(request.url).origin;
    const stripe = new Stripe(secretKey);

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      customer_email: typeof vendor.email === "string" ? vendor.email : undefined,
      client_reference_id: String(vendorId),
      metadata: {
        vendorId: String(vendorId),
        plan: "premium",
      },
      success_url: `${origin}/vendor/subscription?status=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/vendor/subscription?status=cancelled`,
    });

    const subscriptionId =
      typeof session.subscription === "string" ? session.subscription : "";

    await transactionsCollection().insertOne({
      vendorId,
      plan: "premium",
      amount: (session.amount_total ?? 1900) / 100,
      currency: session.currency ?? "usd",
      stripeSessionId: session.id,
      stripeSubscriptionId: subscriptionId,
      // Webhook verified না হওয়া পর্যন্ত pending।
      status: "pending",
      createdAt: new Date(),
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    return serverError(error);
  }
}
