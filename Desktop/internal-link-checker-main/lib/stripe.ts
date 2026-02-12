import Stripe from "stripe"

// ビルド時に STRIPE_SECRET_KEY がなくてもエラーにしないよう遅延初期化
let _stripe: Stripe | null = null

export function getStripe(): Stripe {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY
    if (!key) throw new Error("STRIPE_SECRET_KEY is not set")
    _stripe = new Stripe(key, {
      apiVersion: "2026-01-28.clover",
      typescript: true,
    })
  }
  return _stripe
}

export const PLANS = {
  free: {
    name: "Free",
    maxRows: 10,
  },
  pro: {
    name: "Pro",
    maxRows: Infinity,
    priceId: process.env.STRIPE_PRO_PRICE_ID!,
  },
} as const

export type PlanType = keyof typeof PLANS
