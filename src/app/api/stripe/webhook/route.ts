import { NextRequest } from "next/server";
import { connectDB, isDatabaseConfigured } from "@/lib/db";
import { Invoice } from "@/lib/models";
import { apiError, handleApiError, ok } from "@/lib/api";
import { broadcast } from "@/lib/realtime";
import { REALTIME_EVENTS } from "@/lib/realtime-events";
import Stripe from "stripe";

export async function POST(req: NextRequest) {
  try {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!secretKey || !webhookSecret) {
      return apiError("Stripe webhook is not configured", 503);
    }

    const stripe = new Stripe(secretKey);
    const signature = req.headers.get("stripe-signature");
    if (!signature) return apiError("Missing stripe-signature header", 400);

    const payload = await req.text();
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
    } catch (err) {
      console.error("[stripe-webhook] signature verification failed", err);
      return apiError("Invalid signature", 400);
    }

    if (!isDatabaseConfigured()) return apiError("Database is not configured yet.", 503);
    await connectDB();

    if (event.type === "checkout.session.completed") {
      const checkout = event.data.object as Stripe.Checkout.Session;
      const invoiceId = checkout.metadata?.invoiceId;

      if (invoiceId) {
        const invoice = await Invoice.findById(invoiceId);
        if (invoice && invoice.status !== "paid") {
          invoice.status = "paid";
          invoice.paidAt = new Date();
          invoice.stripePaymentIntentId =
            typeof checkout.payment_intent === "string" ? checkout.payment_intent : undefined;
          await invoice.save();
          broadcast(REALTIME_EVENTS.INVOICE_PAID, String(invoice._id), {
            number: invoice.number,
          });
        }
      }
    }

    return ok({ received: true });
  } catch (err) {
    return handleApiError(err);
  }
}