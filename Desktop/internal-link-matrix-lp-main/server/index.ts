import express from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";
import stripeRouter from "./routes/stripe.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const server = createServer(app);

  // Register Stripe webhook BEFORE express.json() middleware
  // This is required for proper signature verification
  app.post(
    "/api/stripe/webhook",
    express.raw({ type: "application/json" }),
    (req, res, next) => {
      stripeRouter(req, res, next);
    }
  );

  // Parse JSON bodies for all other routes
  app.use(express.json());

  // Register Stripe API routes
  app.use("/api/stripe", stripeRouter);

  // Serve static files from dist/public in production
  const staticPath =
    process.env.NODE_ENV === "production"
      ? path.resolve(__dirname, "public")
      : path.resolve(__dirname, "..", "dist", "public");

  app.use(express.static(staticPath));

  // Handle client-side routing - serve index.html for all routes
  // This must be the LAST route handler
  app.get("*", (_req, res) => {
    res.sendFile(path.join(staticPath, "index.html"));
  });

  const port = process.env.PORT || 3000;

  server.listen(port, () => {
    console.log(`[Server] Running on http://localhost:${port}/`);
    console.log(`[Stripe] Webhook endpoint: http://localhost:${port}/api/stripe/webhook`);
  });
}

startServer().catch((error) => {
  console.error("[Server] Failed to start", error);
  process.exit(1);
});
