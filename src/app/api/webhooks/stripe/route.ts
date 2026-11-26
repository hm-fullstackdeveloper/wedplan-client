import Stripe from "stripe";
import { NextResponse } from "next/server";

import {
  toObjectId,
  transactionsCollection,
  usersCollection,
} from "@/lib/collections";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function activatePremium(session: Stripe.Checkout.Session) {
  const vendorId = toObjectId(
    String(session.metadata?.vendorId ?? session.client_reference_id ?? ""),
  );

  if (!vendorId) {
    return;
  }

  const now = new Date();
  const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  await usersCollection().updateOne(
    { _id: vendorId },
    {
      $set: {
        subscriptionPlan: "premium",
        subscriptionExpiresAt: expiresAt,
        updatedAt: now,
      },
    },
  );

  const subscriptionId =
    typeof session.subscription === "string" ? session.subscription : "";

  await transactionsCollection().updateOne(
    { stripeSessionId: session.id },
    {
      $set: {
        status: "paid",
        stripeSubscriptionId: subscriptionId,
        amount:
          session.amount_total !== null && session.amount_total !== undefined
            ? session.amount_total / 100
            : 19,
        currency: session.currency ?? "usd",
        paidAt: now,
        updatedAt: now,
      },
    },
  );
}

async function markSessionFailed(session: Stripe.Checkout.Session) {
  await transactionsCollection().updateOne(
    { stripeSessionId: session.id },
    {
      $set: {
        status: "failed",
        updatedAt: new Date(),
      },
    },
  );
}

/**
 * POST /api/webhooks/stripe
 * এটাই একমাত্র জায়গা যেখানে Premium activate হয়।
 * signature verify না হলে কোনো DB change হয় না।
 */
export async function POST(request: Request) {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!secretKey || !webhookSecret) {
    return NextResponse.json(
      { error: "Stripe webhook is not configured." },
      { status: 500 },
    );
  }

  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing stripe-signature header." },
      { status: 400 },
    );
  }

  const payload = await request.text();
  const stripe = new Stripe(secretKey);

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      payload,
      signature,
      webhookSecret,
    );
  } catch (error) {
    console.error("Stripe webhook signature verification failed:", error);
    return NextResponse.json(
      { error: "Invalid webhook signature." },
      { status: 400 },
    );
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;

        if (session.payment_status === "paid") {
          await activatePremium(session);
        }

        break;
      }

      case "checkout.session.async_payment_succeeded": {
        const session = event.data.object as Stripe.Checkout.Session;
        await activatePremium(session);
        break;
      }

      case "checkout.session.async_payment_failed":
      case "checkout.session.expired": {
        const session = event.data.object as Stripe.Checkout.Session;
        await markSessionFailed(session);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;

        const transaction = await transactionsCollection().findOne({
          stripeSubscriptionId: subscription.id,
        });

        const vendorId = toObjectId(String(transaction?.vendorId ?? ""));

        if (vendorId) {
          await usersCollection().updateOne(
            { _id: vendorId },
            {
              $set: {
                subscriptionPlan: "free",
                subscriptionExpiresAt: null,
                updatedAt: new Date(),
              },
            },
          );
        }

        break;
      }

      default:
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Stripe webhook handling failed:", error);
    return NextResponse.json(
      { error: "Webhook handler failed." },
      { status: 500 },
    );
  }
}
