import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { connectDB, isDatabaseConfigured } from "@/lib/db";
import { Client, Invoice, Project, Proposal } from "@/lib/models";
import { apiError, apiUnauthorized, handleApiError, ok } from "@/lib/api";
import { clientCreateSchema } from "@/lib/validators";

export async function GET() {
  try {
    const admin = await requireAdmin();
    if (!admin) return apiUnauthorized();

    if (!isDatabaseConfigured()) {
      return apiError(
        "Database is not configured yet. Add MONGODB_URI to .env and run `npm run seed`.",
        503
      );
    }
    await connectDB();

    const clients = await Client.find().sort({ createdAt: -1 }).lean();
    const clientIds = clients.map((c) => c._id);

    const [proposals, projects, invoices] = await Promise.all([
      Proposal.aggregate([
        { $match: { clientId: { $in: clientIds } } },
        { $group: { _id: "$clientId", count: { $sum: 1 } } },
      ]),
      Project.aggregate([
        { $match: { clientId: { $in: clientIds } } },
        { $group: { _id: "$clientId", count: { $sum: 1 } } },
      ]),
      Invoice.aggregate([
        { $match: { clientId: { $in: clientIds } } },
        { $group: { _id: "$clientId", count: { $sum: 1 } } },
      ]),
    ]);

    const proposalCount = Object.fromEntries(proposals.map((p) => [String(p._id), p.count]));
    const projectCount = Object.fromEntries(projects.map((p) => [String(p._id), p.count]));
    const invoiceCount = Object.fromEntries(invoices.map((p) => [String(p._id), p.count]));

    return ok(
      clients.map((c) => ({
        ...c,
        id: String(c._id),
        proposalCount: proposalCount[String(c._id)] ?? 0,
        projectCount: projectCount[String(c._id)] ?? 0,
        invoiceCount: invoiceCount[String(c._id)] ?? 0,
        hasAccount: Boolean(c.userId),
      }))
    );
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdmin();
    if (!admin) return apiUnauthorized();

    const body = await req.json();
    const parsed = clientCreateSchema.safeParse(body);
    if (!parsed.success) {
      return apiError(parsed.error.issues[0]?.message ?? "Invalid input", 422);
    }

    if (!isDatabaseConfigured()) {
      return apiError("Database is not configured yet.", 503);
    }
    await connectDB();

    const existing = await Client.findOne({ email: parsed.data.email.toLowerCase().trim() });
    if (existing) {
      return apiError("A client with this email already exists", 409);
    }

    const client = await Client.create({
      ...parsed.data,
      email: parsed.data.email.toLowerCase().trim(),
    });
    return ok({ client: { ...client.toObject({ versionKey: false }), id: String(client._id) } });
  } catch (err) {
    return handleApiError(err);
  }
}