import { NextRequest } from "next/server";
import { requireAdmin, requireClientWithClientId } from "@/lib/auth";
import { connectDB, isDatabaseConfigured } from "@/lib/db";
import { Deliverable, Milestone, Project, Task } from "@/lib/models";
import { apiError, apiForbidden, apiUnauthorized, handleApiError, ok } from "@/lib/api";
import { projectUpdateSchema } from "@/lib/validators";
import { broadcast } from "@/lib/realtime";
import { REALTIME_EVENTS } from "@/lib/realtime-events";

export async function GET(_req: NextRequest, ctx: RouteContext<"/api/projects/[id]">) {
  try {
    const session = (await requireAdmin()) ?? (await requireClientWithClientId());
    if (!session) return apiUnauthorized();
    const { id } = await ctx.params;

    if (!isDatabaseConfigured()) return apiError("Database is not configured yet.", 503);
    await connectDB();

    const project = await Project.findById(id)
      .populate("clientId", "name company email")
      .populate("proposalId", "number title price currency")
      .lean();
    if (!project) return apiError("Project not found", 404);

    if (session.role === "client") {
      if (String(project.clientId) !== session.clientId) {
        return apiForbidden();
      }
    }

    const [milestones, tasks, deliverables] = await Promise.all([
      Milestone.find({ projectId: id }).sort({ order: 1, createdAt: 1 }).lean(),
      Task.find({ projectId: id }).sort({ dueDate: 1 }).lean(),
      Deliverable.find({ projectId: id }).sort({ createdAt: -1 }).lean(),
    ]);

    return ok({
      ...project,
      id: String(project._id),
      client: project.clientId,
      proposal: project.proposalId,
      clientId: String(project.clientId),
      proposalId: project.proposalId ? String(project.proposalId) : undefined,
      milestones: milestones.map((m) => ({ ...m, id: String(m._id) })),
      tasks: tasks.map((t) => ({ ...t, id: String(t._id) })),
      deliverables: deliverables.map((d) => ({
        ...d,
        id: String(d._id),
        downloadUrl: `/api/deliverables/${d._id}`,
      })),
    });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function PATCH(req: NextRequest, ctx: RouteContext<"/api/projects/[id]">) {
  try {
    const session = await requireAdmin();
    if (!session) return apiUnauthorized();
    const { id } = await ctx.params;

    const body = await req.json();
    const parsed = projectUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return apiError(parsed.error.issues[0]?.message ?? "Invalid input", 422);
    }

    if (!isDatabaseConfigured()) return apiError("Database is not configured yet.", 503);
    await connectDB();

    const project = await Project.findById(id);
    if (!project) return apiError("Project not found", 404);

    const { proposalId, startDate, dueDate, ...rest } = parsed.data;
    Object.assign(
      project,
      rest,
      {
        proposalId: proposalId || project.proposalId,
        startDate: startDate === undefined ? project.startDate : startDate ?? null,
        dueDate: dueDate === undefined ? project.dueDate : dueDate ?? null,
      }
    );
    await project.save();

    broadcast(REALTIME_EVENTS.PROJECT_UPDATED, String(project._id), { status: project.status });
    return ok({ project: { ...project.toObject({ versionKey: false }), id: String(project._id) } });
  } catch (err) {
    return handleApiError(err);
  }
}