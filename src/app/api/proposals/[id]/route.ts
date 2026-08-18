import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { connectDB, isDatabaseConfigured } from "@/lib/db";
import { Check, Client, Proposal } from "@/lib/models";
import { apiError, apiUnauthorized, handleApiError, ok } from "@/lib/api";
import { proposalUpdateSchema } from "@/lib/validators";

export async function GET(_req: NextRequest, ctx: RouteContext<"/api/proposals/[id]">) {
  try {
    const admin = await requireAdmin();
    if (!admin) return apiUnauthorized();
    const { id } = await ctx.params;

    if (!isDatabaseConfigured()) return apiError("Database is not configured yet.", 503);
    await connectDB();

    const proposal = await Proposal.findById(id).populate("clientId", "name company email phone").lean();
    if (!proposal) return apiError("Proposal not found", 404);

    const checks = await Check.find({ proposalId: id }).lean();

    return ok({
      ...proposal,
      id: String(proposal._id),
      client: proposal.clientId,
      clientId: String(proposal.clientId),
      checks: checks.map((c) => ({
        itemIndex: c.itemIndex,
        checkedAt: c.checkedAt,
      })),
    });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function PATCH(req: NextRequest, ctx: RouteContext<"/api/proposals/[id]">) {
  try {
    const admin = await requireAdmin();
    if (!admin) return apiUnauthorized();
    const { id } = await ctx.params;

    const body = await req.json();
    const parsed = proposalUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return apiError(parsed.error.issues[0]?.message ?? "Invalid input", 422);
    }

    if (!isDatabaseConfigured()) return apiError("Database is not configured yet.", 503);
    await connectDB();

    const proposal = await Proposal.findById(id);
    if (!proposal) return apiError("Proposal not found", 404);
    if (proposal.status !== "draft") {
      return apiError("Only draft proposals can be edited", 409);
    }

    if (parsed.data.clientId) {
      const client = await Client.findById(parsed.data.clientId);
      if (!client) return apiError("Client not found", 404);
    }

    Object.assign(proposal, parsed.data);
    await proposal.save();

    return ok({ proposal: { ...proposal.toObject({ versionKey: false }), id: String(proposal._id) } });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function DELETE(_req: NextRequest, ctx: RouteContext<"/api/proposals/[id]">) {
  try {
    const admin = await requireAdmin();
    if (!admin) return apiUnauthorized();
    const { id } = await ctx.params;

    if (!isDatabaseConfigured()) return apiError("Database is not configured yet.", 503);
    await connectDB();

    const proposal = await Proposal.findById(id);
    if (!proposal) return apiError("Proposal not found", 404);

    await Promise.all([proposal.deleteOne(), Check.deleteMany({ proposalId: id })]);
    return ok({ success: true });
  } catch (err) {
    return handleApiError(err);
  }
}