import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { connectDB, isDatabaseConfigured } from "@/lib/db";
import { Project, Task } from "@/lib/models";
import { apiError, apiUnauthorized, handleApiError, ok } from "@/lib/api";
import { taskCreateSchema } from "@/lib/validators";
import { broadcast } from "@/lib/realtime";
import { REALTIME_EVENTS } from "@/lib/realtime-events";

export async function POST(req: NextRequest, ctx: RouteContext<"/api/projects/[id]/tasks">) {
  try {
    const admin = await requireAdmin();
    if (!admin) return apiUnauthorized();
    const { id } = await ctx.params;

    const body = await req.json();
    const parsed = taskCreateSchema.safeParse(body);
    if (!parsed.success) {
      return apiError(parsed.error.issues[0]?.message ?? "Invalid input", 422);
    }

    if (!isDatabaseConfigured()) return apiError("Database is not configured yet.", 503);
    await connectDB();

    const project = await Project.findById(id);
    if (!project) return apiError("Project not found", 404);

    const { dueDate, ...rest } = parsed.data;
    const task = await Task.create({
      ...rest,
      projectId: id,
      dueDate: dueDate ?? undefined,
    });

    broadcast(REALTIME_EVENTS.TASK_UPDATED, String(task._id), {});
    return ok({ task: { ...task.toObject({ versionKey: false }), id: String(task._id) } });
  } catch (err) {
    return handleApiError(err);
  }
}