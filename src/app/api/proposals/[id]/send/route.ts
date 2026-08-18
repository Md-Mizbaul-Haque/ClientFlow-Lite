import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { connectDB, isDatabaseConfigured } from "@/lib/db";
import { Proposal } from "@/lib/models";
import { apiError, apiUnauthorized, handleApiError, ok } from "@/lib/api";
import { broadcast } from "@/lib/realtime";
import { REALTIME_EVENTS } from "@/lib/realtime-events";

export async function POST(_req: NextRequest, ctx: RouteContext<"/api/proposals/[id]/send">) {
  try {
    const admin = await requireAdmin();
    if (!admin) return apiUnauthorized();
    const { id } = await ctx.params;

    if (!isDatabaseConfigured()) return apiError("Database is not configured yet.", 503);
    await connectDB();

    const proposal = await Proposal.findById(id);
    if (!proposal) return apiError("Proposal not found", 404);
    if (proposal.status !== "draft") {
      return apiError("This proposal has already been sent", 409);
    }

    proposal.status = "sent";
    proposal.sentAt = new Date();
    await proposal.save();

    broadcast(REALTIME_EVENTS.PROPOSAL_UPDATED, String(proposal._id), { status: "sent" });
    return ok({ success: true });
  } catch (err) {
    return handleApiError(err);
  }
}