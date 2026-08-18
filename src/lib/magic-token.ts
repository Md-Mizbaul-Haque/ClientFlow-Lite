import mongoose from "mongoose";
import { randomBytes, createHash } from "crypto";
import { connectDB } from "./db";
import { Client, MagicToken, User } from "./models";

/* ---------------------------- magic tokens ---------------------------- */

export function generateMagicToken() {
  const token = randomBytes(32).toString("base64url");
  const hash = createHash("sha256").update(token).digest("hex");
  return { token, hash };
}

export async function createMagicTokenForEmail(email: string) {
  const { token, hash } = generateMagicToken();
  await MagicToken.create({
    email,
    tokenHash: hash,
    purpose: "login",
    expiresAt: new Date(Date.now() + 10 * 60 * 1000),
  });
  return token;
}

export function magicLinkUrl(token: string) {
  const base = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  return `${base}/auth/verify?token=${token}`;
}

/** Validates a token without consuming it. Returns the email (or null). */
export async function peekMagicToken(token: string) {
  if (!token) return null;
  await connectDB();
  const hash = createHash("sha256").update(token).digest("hex");
  const record = await MagicToken.findOne({
    tokenHash: hash,
    purpose: "login",
    expiresAt: { $gt: new Date() },
    consumedAt: { $exists: false },
  });
  return record?.email ?? null;
}

/** Validates a token, consumes it, and returns the matching email (or null). */
export async function consumeMagicToken(token: string) {
  const email = await peekMagicToken(token);
  if (!email) return null;
  await MagicToken.updateOne(
    { tokenHash: createHash("sha256").update(token).digest("hex") },
    { $set: { consumedAt: new Date() } }
  );
  return email;
}

/** Ensure a client user account exists and is linked to the client profile. */
export async function ensureClientUser(email: string, name?: string) {
  await connectDB();
  const normalized = email.toLowerCase().trim();

  let user = await User.findOne({ email: normalized });
  if (!user) {
    const client = await Client.findOne({ email: normalized });
    user = await User.create({
      email: normalized,
      name: name || client?.name || normalized.split("@")[0],
      role: "client",
      company: client?.company,
    });
  }
  if (user.role !== "client") return null;

  const clientDoc = await Client.findOne({ email: normalized });
  if (clientDoc && !clientDoc.userId) {
    clientDoc.userId = user._id as mongoose.Types.ObjectId;
    await clientDoc.save();
  }

  return { user, clientId: clientDoc ? String(clientDoc._id) : undefined };
}