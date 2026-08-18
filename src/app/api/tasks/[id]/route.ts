import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { connectDB, isDatabaseConfigured } from "@/lib/db";
import { Task } from "@/lib/models";
import { apiError, apiUnauthorized, handleApiError, ok } from "@/lib/api";
import { taskCreateSchema } from "@/lib/validators";
import { broadcast } from "@/lib/realtime";
import { REALTIME_EVENTS } from "@/lib/realtime-events";

export async function PATCH(req: NextRequest, ctx: RouteContext<"/api/tasks/[id]">) {
  try {
    const admin = await requireAdmin();
    if (!admin) return apiUnauthorized();
    const { id } = await ctx.params;

    const body = await req.json();
    const parsed = taskCreateSchema.partial().safeParse(body);
    if (!parsed.success) {
      return apiError(parsed.error.issues[0]?.message ?? "Invalid input", 422);
    }

    if (!isDatabaseConfigured()) return apiError("Database is not configured yet.", 503);
    await connectDB();

    const task = await Task.findById(id);
    if (!task) return apiError("Task not found", 404);

    Object.assign(task, parsed.data);
    await task.save();

    broadcast(REALTIME_EVENTS.TASK_UPDATED, String(task._id), {});
    return ok({ task: { ...task.toObject({ versionKey: false }), id: String(task._id) } });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function DELETE(_req: NextRequest, ctx: RouteContext<"/api/tasks/[id]">) {
  try {
    const admin = await requireAdmin();
    if (!admin) return apiUnauthorized();
    const { id } = await ctx.params;

    if (!isDatabaseConfigured()) return apiError("Database is not configured yet.", 503);
    await connectDB();

    const task = await Task.findById(id);
    if (!task) return apiError("Task not found", 404);

    await task.deleteOne();
    return ok({ success: true });
  } catch (err) {
    return handleApiError(err);
  }
}