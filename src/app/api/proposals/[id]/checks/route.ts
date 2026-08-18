import { NextRequest } from "next/server";
import { requireClient, clientForSession } from "@/lib/auth";
import { connectDB, isDatabaseConfigured } from "@/lib/db";
import { Check, Proposal } from "@/lib/models";
import { apiError, apiForbidden, apiUnauthorized, handleApiError, ok } from "@/lib/api";
import { broadcast } from "@/lib/realtime";
import { REALTIME_EVENTS } from "@/lib/realtime-events";

export async function POST(req: NextRequest, ctx: RouteContext<"/api/proposals/[id]/checks">) {
  try {
    const session = await requireClient();
    if (!session) return apiUnauthorized();
    const { id } = await ctx.params;

    const body = await req.json();
    const itemIndex = Number(body.itemIndex);
    if (!Number.isInteger(itemIndex) || itemIndex < 0) {
      return apiError("Invalid deliverable index", 422);
    }

    if (!isDatabaseConfigured()) return apiError("Database is not configured yet.", 503);
    await connectDB();

    const clientId = await clientForSession(session);
    const proposal = await Proposal.findById(id);
    if (!proposal) return apiError("Proposal not found", 404);

    if (clientId && String(proposal.clientId) !== clientId) {
      return apiForbidden();
    }
    if (itemIndex >= proposal.deliverables.length) {
      return apiError("Deliverable not found", 404);
    }

    const existing = await Check.findOne({ proposalId: id, itemIndex });
    if (existing) {
      await existing.deleteOne();
    } else {
      await Check.create({ proposalId: id, itemIndex, checkedAt: new Date() });
    }

    broadcast(REALTIME_EVENTS.PROPOSAL_CHECKED, String(proposal._id), { itemIndex });
    return ok({ checked: !existing });
  } catch (err) {
    return handleApiError(err);
  }
}