/**
 * Stripe Products and Prices Configuration
 * Define all products and prices used in your application here.
 * These are used to create checkout sessions and manage subscriptions.
 */

export const STRIPE_PRODUCTS = {
  PRO_PLAN: {
    name: "Pro Plan",
    description: "内部リンクマトリクス - Proプラン",
    priceInCents: 98000, // ¥980 in cents (JPY)
    currency: "jpy",
    interval: "month" as const,
    // Note: In production, replace with actual Stripe Price ID
    // Format: price_xxxxx
    priceId: process.env.STRIPE_PRO_PRICE_ID || "price_1QxxxxxxxxxxxxxN",
  },
};

export const SUBSCRIPTION_PLANS = {
  FREE: {
    name: "Free",
    maxRows: 10,
    price: 0,
  },
  PRO: {
    name: "Pro",
    maxRows: null, // unlimited
    price: 980,
    stripeProductId: STRIPE_PRODUCTS.PRO_PLAN.priceId,
  },
};
