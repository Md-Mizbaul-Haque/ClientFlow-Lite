import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { connectDB, isDatabaseConfigured } from "@/lib/db";
import { Client } from "@/lib/models";
import { apiError, apiUnauthorized, handleApiError, ok } from "@/lib/api";
import { createMagicTokenForEmail, magicLinkUrl } from "@/lib/magic-token";

export async function POST(_req: NextRequest, ctx: RouteContext<"/api/clients/[id]/invite">) {
  try {
    const admin = await requireAdmin();
    if (!admin) return apiUnauthorized();
    const { id } = await ctx.params;

    if (!isDatabaseConfigured()) return apiError("Database is not configured yet.", 503);
    await connectDB();

    const client = await Client.findById(id);
    if (!client) return apiError("Client not found", 404);

    const token = await createMagicTokenForEmail(client.email);
    const url = magicLinkUrl(token);

    const smtpConfigured = Boolean(process.env.SMTP_HOST && process.env.SMTP_USER);
    if (smtpConfigured) {
      try {
        const nodemailer = await import("nodemailer");
        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: Number(process.env.SMTP_PORT || 587),
          secure: process.env.SMTP_SECURE === "true",
          auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
        });
        await transporter.sendMail({
          from: process.env.SMTP_FROM || "ClientFlow Lite <no-reply@clientflow.app>",
          to: client.email,
          subject: `You're invited to the ${client.company} client portal`,
          html: `<p>Hi ${client.name},</p><p>Your agency has created a portal for you on ClientFlow Lite. Sign in with this link:</p><p><a href="${url}">${url}</a></p><p>This link expires in 10 minutes.</p>`,
        });
      } catch (err) {
        console.error("[invite] email send failed", err);
      }
    } else if (process.env.NODE_ENV !== "production") {
      console.log(`[invite] DEV MODE — sign-in link for ${client.email}:\n${url}`);
    }

    return ok({
      sent: true,
      devUrl:
        !smtpConfigured && process.env.NODE_ENV !== "production" ? url : undefined,
    });
  } catch (err) {
    return handleApiError(err);
  }
}