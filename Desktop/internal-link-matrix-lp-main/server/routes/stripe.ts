import { Router, Request, Response } from "express";
import { createCheckoutSession } from "../stripe/checkout.js";
import { handleWebhookEvent, verifyWebhookSignature } from "../stripe/webhook.js";

const router = Router();

/**
 * POST /api/stripe/create-checkout-session
 * Create a Stripe Checkout Session for subscription
 */
router.post(
  "/create-checkout-session",
  async (req: Request, res: Response) => {
    try {
      const { plan } = req.body;
      // Get user from session/auth context
      const user = (req as any).user;

      if (!user) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      if (plan !== "pro") {
        return res.status(400).json({ error: "Invalid plan" });
      }

      const origin = req.headers.origin || "https://www.seo-director.com";

      const checkoutUrl = await createCheckoutSession({
        userId: user.id,
        userEmail: user.email || "",
        userName: user.name || "User",
        plan: "pro",
        origin,
      });

      res.json({ checkoutUrl });
    } catch (error) {
      console.error("[API] Error creating checkout session", error);
      res.status(500).json({
        error: "Failed to create checkout session",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
);

/**
 * POST /api/stripe/webhook
 * Handle Stripe webhook events
 * Must be registered BEFORE express.json() middleware
 */
router.post("/webhook", async (req: Request, res: Response) => {
  try {
    const signature = req.headers["stripe-signature"] as string;

    if (!signature) {
      return res.status(400).json({ error: "Missing stripe-signature header" });
    }

    const event = verifyWebhookSignature(
      (req as any).rawBody || req.body.toString(),
      signature
    );
    await handleWebhookEvent(event);

    res.json({ received: true });
  } catch (error) {
    console.error("[Webhook] Signature verification failed", error);
    res.status(400).json({
      error: "Webhook signature verification failed",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

export default router;
