import { NextRequest } from "next/server";
import { requireClient, clientForSession } from "@/lib/auth";
import { connectDB, isDatabaseConfigured } from "@/lib/db";
import { Invoice } from "@/lib/models";
import { apiError, apiForbidden, apiUnauthorized, handleApiError, ok } from "@/lib/api";
import Stripe from "stripe";

export async function POST(req: NextRequest) {
  try {
    const session = await requireClient();
    if (!session) return apiUnauthorized();

    const body = await req.json();
    const invoiceId = String(body.invoiceId ?? "");
    if (!invoiceId) return apiError("Invoice not found", 404);

    if (!isDatabaseConfigured()) return apiError("Database is not configured yet.", 503);
    await connectDB();

    const clientId = await clientForSession(session);
    const invoice = await Invoice.findById(invoiceId);
    if (!invoice) return apiError("Invoice not found", 404);
    if (clientId && String(invoice.clientId) !== clientId) return apiForbidden();
    if (invoice.status === "paid") return apiError("This invoice is already paid", 409);

    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
      return apiError(
        "Stripe is not configured yet. Add STRIPE_SECRET_KEY to .env (test mode).",
        503
      );
    }

    const stripe = new Stripe(secretKey);
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const checkout = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: invoice.currency.toLowerCase(),
            unit_amount: Math.round(invoice.amount * 100),
            product_data: {
              name: `Invoice ${invoice.number}`,
              description: `Payment for invoice ${invoice.number} (${invoice.type} payment)`,
            },
          },
        },
      ],
      metadata: { invoiceId: String(invoice._id) },
      success_url: `${appUrl}/portal/invoices?paid=1`,
      cancel_url: `${appUrl}/portal/invoices?cancelled=1`,
    });

    invoice.stripeSessionId = checkout.id;
    await invoice.save();

    return ok({ url: checkout.url });
  } catch (err) {
    return handleApiError(err);
  }
}