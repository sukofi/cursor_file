import Stripe from "stripe";
import { getDb } from "../db";
import { subscriptions, payments } from "../../drizzle/schema";

let db: any;
import { eq } from "drizzle-orm";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2026-01-28.clover",
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "";

export function verifyWebhookSignature(
  body: string,
  signature: string
): Stripe.Event {
  return stripe.webhooks.constructEvent(body, signature, webhookSecret);
}

/**
 * Handle checkout.session.completed event
 * Create subscription record when user completes checkout
 */
async function handleCheckoutSessionCompleted(
  session: Stripe.Checkout.Session
) {
  if (!db) db = await getDb();
  if (!db) {
    console.error("[Webhook] Database not available");
    return;
  }
  const userId = parseInt(session.client_reference_id || "0");
  const userEmail = session.customer_email;
  const subscriptionId = session.subscription as string;

  if (!userId || !userEmail || !subscriptionId) {
    console.error("[Webhook] Missing required fields in checkout session", {
      userId,
      userEmail,
      subscriptionId,
    });
    return;
  }

  try {
    // Get subscription details from Stripe
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);

    // Create or update subscription record in database
    const existingSubscription = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.userId, userId))
      .limit(1);

    if (existingSubscription.length > 0) {
      // Update existing subscription
      await db
        .update(subscriptions)
        .set({
          stripeSubscriptionId: subscriptionId,
          stripeCustomerId: subscription.customer as string,
          status: subscription.status as any,
          currentPeriodStart: new Date(
            (subscription as any).current_period_start * 1000
          ),
          currentPeriodEnd: new Date(
            (subscription as any).current_period_end * 1000
          ),
          updatedAt: new Date(),
        })
        .where(eq(subscriptions.userId, userId));
    } else {
      // Create new subscription record
      await db.insert(subscriptions).values({
        userId,
        stripeCustomerId: subscription.customer as string,
        stripeSubscriptionId: subscriptionId,
        plan: "pro",
        status: subscription.status as any,
        currentPeriodStart: new Date(
          (subscription as any).current_period_start * 1000
        ),
        currentPeriodEnd: new Date(
          (subscription as any).current_period_end * 1000
        ),
      });
    }

    console.log("[Webhook] Subscription created/updated for user", userId);
  } catch (error) {
    console.error("[Webhook] Error handling checkout.session.completed", error);
    throw error;
  }
}

/**
 * Handle invoice.payment_succeeded event
 * Update subscription status and create payment record
 */
async function handleInvoicePaid(invoice: Stripe.Invoice) {
  if (!db) db = await getDb();
  if (!db) {
    console.error("[Webhook] Database not available");
    return;
  }
  const subscriptionId = (invoice as any).subscription as string;
  const customerId = invoice.customer as string;
  const amount = invoice.amount_paid;
  const currency = invoice.currency;
  const invoiceId = invoice.id;
  const paymentIntentId = (invoice as any).payment_intent as string;

  try {
    // Find user by subscription
    const sub = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.stripeSubscriptionId, subscriptionId))
      .limit(1);

    if (sub.length === 0) {
      console.error("[Webhook] Subscription not found", subscriptionId);
      return;
    }

    const userId = sub[0].userId;

    // Update subscription status
    await db
      .update(subscriptions)
      .set({
        status: "active",
        updatedAt: new Date(),
      })
      .where(eq(subscriptions.userId, userId));

    // Create payment record
    await db.insert(payments).values({
      userId,
      stripePaymentIntentId: paymentIntentId,
      stripeInvoiceId: invoiceId,
      amount,
      currency: currency.toUpperCase(),
      status: "succeeded",
    });

    console.log("[Webhook] Payment recorded for user", userId);
  } catch (error) {
    console.error("[Webhook] Error handling invoice.payment_succeeded", error);
    throw error;
  }
}

/**
 * Handle customer.subscription.deleted event
 * Mark subscription as canceled
 */
async function handleSubscriptionDeleted(
  subscription: Stripe.Subscription
) {
  if (!db) db = await getDb();
  if (!db) {
    console.error("[Webhook] Database not available");
    return;
  }
  const subscriptionId = subscription.id;

  try {
    const sub = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.stripeSubscriptionId, subscriptionId))
      .limit(1);

    if (sub.length === 0) {
      console.error("[Webhook] Subscription not found", subscriptionId);
      return;
    }

    await db
      .update(subscriptions)
      .set({
        status: "canceled",
        canceledAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(subscriptions.stripeSubscriptionId, subscriptionId));

    console.log("[Webhook] Subscription canceled", subscriptionId);
  } catch (error) {
    console.error("[Webhook] Error handling customer.subscription.deleted", error);
    throw error;
  }
}

/**
 * Main webhook event handler
 */
export async function handleWebhookEvent(event: Stripe.Event) {
  console.log("[Webhook] Processing event:", event.type);

  // Handle test events
  if (event.id.startsWith("evt_test_")) {
    console.log("[Webhook] Test event detected, returning verification response");
    return { verified: true };
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutSessionCompleted(
          event.data.object as Stripe.Checkout.Session
        );
        break;

      case "invoice.paid":
        await handleInvoicePaid(event.data.object as Stripe.Invoice);
        break;

      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(
          event.data.object as Stripe.Subscription
        );
        break;

      default:
        console.log("[Webhook] Unhandled event type:", event.type);
    }

    return { verified: true };
  } catch (error) {
    console.error("[Webhook] Error processing event", error);
    throw error;
  }
}
