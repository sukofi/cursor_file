import Stripe from "stripe";
import { STRIPE_PRODUCTS } from "./products";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2026-01-28.clover",
});

export interface CreateCheckoutSessionParams {
  userId: number;
  userEmail: string;
  userName: string;
  plan: "pro";
  origin: string;
}

/**
 * Create a Stripe Checkout Session for subscription
 * Returns the checkout URL to redirect the user
 */
export async function createCheckoutSession(
  params: CreateCheckoutSessionParams
): Promise<string> {
  const { userId, userEmail, userName, plan, origin } = params;

  if (plan !== "pro") {
    throw new Error("Invalid plan");
  }

  const priceId = STRIPE_PRODUCTS.PRO_PLAN.priceId;

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "subscription",
    customer_email: userEmail,
    client_reference_id: userId.toString(),
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    metadata: {
      user_id: userId.toString(),
      customer_email: userEmail,
      customer_name: userName,
      plan: plan,
    },
    allow_promotion_codes: true,
    success_url: `${origin}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/#pricing`,
  });

  if (!session.url) {
    throw new Error("Failed to create checkout session");
  }

  return session.url;
}

/**
 * Retrieve checkout session details
 */
export async function getCheckoutSession(sessionId: string) {
  return await stripe.checkout.sessions.retrieve(sessionId);
}
