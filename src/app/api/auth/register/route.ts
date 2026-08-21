import { NextRequest } from "next/server";
import { connectDB, isDatabaseConfigured } from "@/lib/db";
import { User } from "@/lib/models";
import { apiError, handleApiError, ok } from "@/lib/api";
import { hashPassword } from "@/lib/password";
import { registerSchema } from "@/lib/validators";
import { registerRateLimit } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  try {
    const rl = await registerRateLimit(req);
    if (!rl.allowed) {
      return apiError("Too many registration attempts. Please try again later.", 429, { "Retry-After": String(Math.ceil((rl.resetAt - Date.now()) / 1000)) });
    }

    if (!isDatabaseConfigured()) {
      return apiError(
        "Database is not configured yet. Add MONGODB_URI to .env and run `npm run seed`.",
        503
      );
    }

    const body = registerSchema.parse(await req.json());
    const email = body.email.toLowerCase().trim();

    await connectDB();

    const existing = await User.findOne({ email });
    if (existing) {
      return apiError("An account with this email already exists", 409);
    }

    const name = email
      .split("@")[0]
      .replace(/[._-]+/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase())
      .trim();

    const trialEndDate = new Date();
    trialEndDate.setDate(trialEndDate.getDate() + 15);

    const user = await User.create({
      email,
      name,
      role: "admin",
      passwordHash: await hashPassword(body.password),
      trialEndDate,
    });

    return ok({ id: String(user._id), email: user.email, name: user.name }, { status: 201 });
  } catch (err) {
    return handleApiError(err);
  }
}
