import { NextRequest } from "next/server";
import { requireClient, clientForSession } from "@/lib/auth";
import { connectDB, isDatabaseConfigured } from "@/lib/db";
import { Proposal } from "@/lib/models";
import { apiError, apiForbidden, apiUnauthorized, handleApiError, ok } from "@/lib/api";
import { broadcast } from "@/lib/realtime";
import { REALTIME_EVENTS } from "@/lib/realtime-events";

export async function POST(_req: NextRequest, ctx: RouteContext<"/api/proposals/[id]/decline">) {
  try {
    const session = await requireClient();
    if (!session) return apiUnauthorized();
    const { id } = await ctx.params;

    if (!isDatabaseConfigured()) return apiError("Database is not configured yet.", 503);
    await connectDB();

    const clientId = await clientForSession(session);
    const proposal = await Proposal.findById(id);
    if (!proposal) return apiError("Proposal not found", 404);

    if (clientId && String(proposal.clientId) !== clientId) {
      return apiForbidden();
    }
    if (proposal.status === "accepted") {
      return apiError("This proposal is already signed", 409);
    }
    if (proposal.status === "draft") {
      return apiError("This proposal hasn't been sent to you yet", 409);
    }

    proposal.status = "declined";
    await proposal.save();

    broadcast(REALTIME_EVENTS.PROPOSAL_UPDATED, String(proposal._id), { status: "declined" });
    return ok({ success: true });
  } catch (err) {
    return handleApiError(err);
  }
}