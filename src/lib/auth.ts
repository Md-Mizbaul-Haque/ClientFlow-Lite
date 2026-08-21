import "server-only";
import { auth } from "@/auth";
import { connectDB, isDatabaseConfigured } from "./db";
import { Client } from "./models";
import { hashPassword, verifyPassword } from "./password";

export { hashPassword, verifyPassword };

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: "admin" | "client";
  clientId?: string;
  trialEndDate?: Date;
}

export async function getSession(): Promise<SessionUser | null> {
  const session = await auth();
  const user = session?.user;
  if (!user?.id) return null;
  return {
    id: user.id,
    email: user.email ?? "",
    name: user.name ?? "",
    role: user.role ?? "client",
    clientId: user.clientId,
    trialEndDate: user.trialEndDate,
  };
}

export async function requireAdmin(): Promise<SessionUser | null> {
  const session = await getSession();
  if (!session || session.role !== "admin") return null;
  if (session.trialEndDate && new Date() > new Date(session.trialEndDate)) {
    return null;
  }
  return session;
}

export async function requireClient() {
  const session = await getSession();
  if (!session || session.role !== "client") return null;
  return session;
}

export async function requireClientWithClientId(): Promise<SessionUser & { clientId: string } | null> {
  const session = await requireClient();
  if (!session) return null;
  const clientId = await clientForSession(session);
  if (!clientId) return null;
  return { ...session, clientId };
}

/** Resolve the client document a logged-in client belongs to. */
export async function clientForSession(session: SessionUser) {
  if (!isDatabaseConfigured()) return null;
  await connectDB();
  const client = await Client.findOne({ userId: session.id }).lean();
  return client ? String(client._id) : session.clientId || null;
}