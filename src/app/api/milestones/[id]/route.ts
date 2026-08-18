import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { connectDB, isDatabaseConfigured } from "@/lib/db";
import { Deliverable, Milestone } from "@/lib/models";
import { apiError, apiUnauthorized, handleApiError, ok } from "@/lib/api";
import { milestoneCreateSchema } from "@/lib/validators";
import { broadcast } from "@/lib/realtime";
import { REALTIME_EVENTS } from "@/lib/realtime-events";

export async function PATCH(req: NextRequest, ctx: RouteContext<"/api/milestones/[id]">) {
  try {
    const admin = await requireAdmin();
    if (!admin) return apiUnauthorized();
    const { id } = await ctx.params;

    const body = await req.json();
    const parsed = milestoneCreateSchema.partial().safeParse(body);
    if (!parsed.success) {
      return apiError(parsed.error.issues[0]?.message ?? "Invalid input", 422);
    }

    if (!isDatabaseConfigured()) return apiError("Database is not configured yet.", 503);
    await connectDB();

    const milestone = await Milestone.findById(id);
    if (!milestone) return apiError("Milestone not found", 404);

    Object.assign(milestone, parsed.data);
    await milestone.save();

    broadcast(REALTIME_EVENTS.MILESTONE_UPDATED, String(milestone._id), { status: milestone.status });
    return ok({ milestone: { ...milestone.toObject({ versionKey: false }), id: String(milestone._id) } });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function DELETE(_req: NextRequest, ctx: RouteContext<"/api/milestones/[id]">) {
  try {
    const admin = await requireAdmin();
    if (!admin) return apiUnauthorized();
    const { id } = await ctx.params;

    if (!isDatabaseConfigured()) return apiError("Database is not configured yet.", 503);
    await connectDB();

    const milestone = await Milestone.findById(id);
    if (!milestone) return apiError("Milestone not found", 404);

    await Promise.all([
      milestone.deleteOne(),
      Deliverable.deleteMany({ milestoneId: id }),
    ]);
    return ok({ success: true });
  } catch (err) {
    return handleApiError(err);
  }
}