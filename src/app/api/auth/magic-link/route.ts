import { NextRequest } from "next/server";
import { connectDB, isDatabaseConfigured } from "@/lib/db";
import { Client } from "@/lib/models";
import { apiError, handleApiError, ok } from "@/lib/api";
import { createMagicTokenForEmail, magicLinkUrl } from "@/lib/magic-token";
import { magicLinkSchema } from "@/lib/validators";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = magicLinkSchema.safeParse(body);
    if (!parsed.success) {
      return apiError(parsed.error.issues[0]?.message ?? "Invalid email", 422);
    }
    const email = parsed.data.email.toLowerCase().trim();

    if (!isDatabaseConfigured()) {
      return apiError(
        "Database is not configured yet. Add MONGODB_URI to .env and run `npm run seed`.",
        503
      );
    }
    await connectDB();

    const client = await Client.findOne({ email });
    if (!client) {
      return ok({ sent: true, message: "If an account exists for that email, a sign-in link was sent." });
    }

    const token = await createMagicTokenForEmail(email);
    const url = magicLinkUrl(token);

    const smtpConfigured = Boolean(process.env.SMTP_HOST && process.env.SMTP_USER);
    let devUrl: string | undefined;
    if (smtpConfigured) {
      try {
        const nodemailer = await import("nodemailer");
        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: Number(process.env.SMTP_PORT || 587),
          secure: process.env.SMTP_SECURE === "true",
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
        });
        await transporter.sendMail({
          from: process.env.SMTP_FROM || "ClientFlow Lite <no-reply@clientflow.app>",
          to: email,
          subject: "Your sign-in link for ClientFlow Lite",
          html: `<p>Hi there,</p><p>Sign in to your ClientFlow Lite portal with this link:</p><p><a href="${url}">${url}</a></p><p>This link expires in 10 minutes.</p>`,
        });
      } catch (err) {
        console.error("[magic-link] email send failed", err);
      }
    } else if (process.env.NODE_ENV !== "production") {
      devUrl = url;
      console.log(`[magic-link] DEV MODE — sign-in link for ${email}:\n${url}`);
    }

    return ok({ sent: true, devUrl });
  } catch (err) {
    return handleApiError(err);
  }
}