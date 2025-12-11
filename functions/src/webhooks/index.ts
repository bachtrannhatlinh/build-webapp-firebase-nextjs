import { onRequest } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";

const db = admin.firestore();

// ============================================
// Webhooks - Receive external events
// ============================================

/**
 * Stripe webhook handler
 * Xử lý events từ Stripe (payment, subscription, etc.)
 */
export const stripeWebhook = onRequest(
  { cors: false, region: "asia-southeast1" },
  async (req, res) => {
    if (req.method !== "POST") {
      res.status(405).json({ error: "Method not allowed" });
      return;
    }

    try {
      const signature = req.headers["stripe-signature"];
      if (!signature) {
        res.status(400).json({ error: "Missing stripe signature" });
        return;
      }

      // In production, verify the webhook signature
      // const event = stripe.webhooks.constructEvent(req.rawBody, signature, webhookSecret);

      const event = req.body;
      const eventType = event.type;
      const eventData = event.data?.object;

      console.log(`Received Stripe event: ${eventType}`);

      // Log webhook event
      await db.collection("webhookLogs").add({
        source: "stripe",
        eventType,
        eventData,
        processedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      // Handle different event types
      switch (eventType) {
        case "payment_intent.succeeded":
          await handlePaymentSuccess(eventData);
          break;
        case "payment_intent.payment_failed":
          await handlePaymentFailed(eventData);
          break;
        case "customer.subscription.created":
          await handleSubscriptionCreated(eventData);
          break;
        case "customer.subscription.deleted":
          await handleSubscriptionCanceled(eventData);
          break;
        default:
          console.log(`Unhandled event type: ${eventType}`);
      }

      res.json({ received: true });
    } catch (error) {
      console.error("Stripe webhook error:", error);
      res.status(500).json({ error: "Webhook processing failed" });
    }
  }
);

/**
 * GitHub webhook handler
 * Xử lý events từ GitHub (push, PR, issues, etc.)
 */
export const githubWebhook = onRequest(
  { cors: false, region: "asia-southeast1" },
  async (req, res) => {
    if (req.method !== "POST") {
      res.status(405).json({ error: "Method not allowed" });
      return;
    }

    try {
      const event = req.headers["x-github-event"] as string;
      const payload = req.body;

      console.log(`Received GitHub event: ${event}`);

      // Log webhook event
      await db.collection("webhookLogs").add({
        source: "github",
        eventType: event,
        payload,
        processedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      switch (event) {
        case "push":
          console.log(`Push to ${payload.repository?.full_name}`);
          break;
        case "pull_request":
          console.log(`PR ${payload.action}: ${payload.pull_request?.title}`);
          break;
        case "issues":
          console.log(`Issue ${payload.action}: ${payload.issue?.title}`);
          break;
        default:
          console.log(`Unhandled GitHub event: ${event}`);
      }

      res.json({ received: true });
    } catch (error) {
      console.error("GitHub webhook error:", error);
      res.status(500).json({ error: "Webhook processing failed" });
    }
  }
);

/**
 * Generic webhook handler
 * Dùng cho các third-party services khác
 */
export const genericWebhook = onRequest(
  { cors: true, region: "asia-southeast1" },
  async (req, res) => {
    if (req.method !== "POST") {
      res.status(405).json({ error: "Method not allowed" });
      return;
    }

    try {
      const source = req.query.source as string || "unknown";
      const payload = req.body;

      console.log(`Received webhook from: ${source}`);

      // Log webhook event
      await db.collection("webhookLogs").add({
        source,
        payload,
        headers: req.headers,
        processedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      res.json({ received: true, source });
    } catch (error) {
      console.error("Generic webhook error:", error);
      res.status(500).json({ error: "Webhook processing failed" });
    }
  }
);

// Helper functions for Stripe events
async function handlePaymentSuccess(paymentIntent: Record<string, unknown>) {
  const metadata = paymentIntent.metadata as Record<string, string> | undefined;
  const userId = metadata?.userId;
  if (userId) {
    await db.collection("payments").add({
      userId,
      amount: paymentIntent.amount,
      status: "succeeded",
      paymentIntentId: paymentIntent.id,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  }
}

async function handlePaymentFailed(paymentIntent: Record<string, unknown>) {
  console.log("Payment failed:", paymentIntent.id);
}

async function handleSubscriptionCreated(subscription: Record<string, unknown>) {
  console.log("Subscription created:", subscription.id);
}

async function handleSubscriptionCanceled(subscription: Record<string, unknown>) {
  console.log("Subscription canceled:", subscription.id);
}
