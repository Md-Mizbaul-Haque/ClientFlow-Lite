import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { connectDB, isDatabaseConfigured } from "@/lib/db";
import { Client, Proposal } from "@/lib/models";
import { nextNumber } from "@/lib/models";
import { apiError, apiUnauthorized, handleApiError, ok } from "@/lib/api";
import { proposalCreateSchema } from "@/lib/validators";

export async function GET() {
  try {
    const admin = await requireAdmin();
    if (!admin) return apiUnauthorized();

    if (!isDatabaseConfigured()) {
      return apiError("Database is not configured yet.", 503);
    }
    await connectDB();

    const proposals = await Proposal.find()
      .sort({ createdAt: -1 })
      .populate("clientId", "name company email")
      .lean();

    return ok(
      proposals.map((p) => ({
        ...p,
        id: String(p._id),
        client: p.clientId
          ? {
              id: String((p.clientId as { _id: unknown })._id ?? ""),
              name: (p.clientId as { name?: string }).name ?? "",
              company: (p.clientId as { company?: string }).company ?? "",
            }
          : null,
        clientId: String(p.clientId),
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
    const parsed = proposalCreateSchema.safeParse(body);
    if (!parsed.success) {
      return apiError(parsed.error.issues[0]?.message ?? "Invalid input", 422);
    }

    if (!isDatabaseConfigured()) {
      return apiError("Database is not configured yet.", 503);
    }
    await connectDB();

    const client = await Client.findById(parsed.data.clientId);
    if (!client) return apiError("Client not found", 404);

    const proposal = await Proposal.create({
      ...parsed.data,
      clientId: client._id,
      number: await nextNumber("PRP", new Date().getFullYear()),
      status: "draft",
    });

    return ok({ proposal: { ...proposal.toObject({ versionKey: false }), id: String(proposal._id) } });
  } catch (err) {
    return handleApiError(err);
  }
}