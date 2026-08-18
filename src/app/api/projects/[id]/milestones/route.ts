import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { connectDB, isDatabaseConfigured } from "@/lib/db";
import { Milestone, Project } from "@/lib/models";
import { apiError, apiUnauthorized, handleApiError, ok } from "@/lib/api";
import { milestoneCreateSchema } from "@/lib/validators";
import { broadcast } from "@/lib/realtime";
import { REALTIME_EVENTS } from "@/lib/realtime-events";

export async function POST(req: NextRequest, ctx: RouteContext<"/api/projects/[id]/milestones">) {
  try {
    const admin = await requireAdmin();
    if (!admin) return apiUnauthorized();
    const { id } = await ctx.params;

    const body = await req.json();
    const parsed = milestoneCreateSchema.safeParse(body);
    if (!parsed.success) {
      return apiError(parsed.error.issues[0]?.message ?? "Invalid input", 422);
    }

    if (!isDatabaseConfigured()) return apiError("Database is not configured yet.", 503);
    await connectDB();

    const project = await Project.findById(id);
    if (!project) return apiError("Project not found", 404);

    const count = await Milestone.countDocuments({ projectId: id });
    const { dueDate, ...rest } = parsed.data;
    const milestone = await Milestone.create({
      ...rest,
      projectId: id,
      order: count,
      dueDate: dueDate ?? undefined,
    });

    broadcast(REALTIME_EVENTS.MILESTONE_UPDATED, String(milestone._id), { status: milestone.status });
    return ok({ milestone: { ...milestone.toObject({ versionKey: false }), id: String(milestone._id) } });
  } catch (err) {
    return handleApiError(err);
  }
}