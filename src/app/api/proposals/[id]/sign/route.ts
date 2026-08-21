import { NextRequest } from "next/server";
import { requireClientWithClientId } from "@/lib/auth";
import { connectDB, isDatabaseConfigured } from "@/lib/db";
import { Proposal } from "@/lib/models";
import { apiError, apiForbidden, apiUnauthorized, handleApiError, ok } from "@/lib/api";
import { signSchema } from "@/lib/validators";
import { broadcast } from "@/lib/realtime";
import { REALTIME_EVENTS } from "@/lib/realtime-events";

export async function POST(req: NextRequest, ctx: RouteContext<"/api/proposals/[id]/sign">) {
  try {
    const session = await requireClientWithClientId();
    if (!session) return apiUnauthorized();
    const { id } = await ctx.params;

    const body = await req.json();
    const parsed = signSchema.safeParse(body);
    if (!parsed.success) {
      return apiError(parsed.error.issues[0]?.message ?? "Invalid input", 422);
    }

    if (!isDatabaseConfigured()) return apiError("Database is not configured yet.", 503);
    await connectDB();

    const proposal = await Proposal.findById(id);
    if (!proposal) return apiError("Proposal not found", 404);

    if (String(proposal.clientId) !== session.clientId) {
      return apiForbidden();
    }
    if (proposal.status === "draft") {
      return apiError("This proposal hasn't been sent to you yet", 409);
    }
    if (proposal.status === "accepted") {
      return apiError("This proposal is already signed", 409);
    }

    proposal.status = "accepted";
    proposal.signature = {
      name: parsed.data.name,
      dataUrl: parsed.data.dataUrl,
      ip: req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || undefined,
      signedAt: new Date(),
    };
    await proposal.save();

    broadcast(REALTIME_EVENTS.PROPOSAL_SIGNED, String(proposal._id), { name: parsed.data.name });
    return ok({ success: true });
  } catch (err) {
    return handleApiError(err);
  }
}