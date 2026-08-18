import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { connectDB, isDatabaseConfigured } from "@/lib/db";
import { Client, Milestone, Project } from "@/lib/models";
import { apiError, apiUnauthorized, handleApiError, ok } from "@/lib/api";
import { projectCreateSchema } from "@/lib/validators";
import { broadcast } from "@/lib/realtime";
import { REALTIME_EVENTS } from "@/lib/realtime-events";

export async function GET() {
  try {
    const admin = await requireAdmin();
    if (!admin) return apiUnauthorized();

    if (!isDatabaseConfigured()) return apiError("Database is not configured yet.", 503);
    await connectDB();

    const projects = await Project.find()
      .sort({ updatedAt: -1 })
      .populate("clientId", "name company email")
      .populate("proposalId", "number title")
      .lean();

    const milestoneCounts = await Milestone.aggregate([
      { $match: { projectId: { $in: projects.map((p) => p._id) } } },
      { $group: { _id: "$projectId", count: { $sum: 1 } } },
    ]);
    const countMap = Object.fromEntries(milestoneCounts.map((m) => [String(m._id), m.count]));

    return ok(
      projects.map((p) => ({
        ...p,
        id: String(p._id),
        client: p.clientId,
        proposal: p.proposalId,
        clientId: String(p.clientId),
        proposalId: p.proposalId ? String(p.proposalId) : undefined,
        milestoneCount: countMap[String(p._id)] ?? 0,
      }))
    );
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdmin();
    if (!admin) return apiUnauthorized();

    const body = await req.json();
    const parsed = projectCreateSchema.safeParse(body);
    if (!parsed.success) {
      return apiError(parsed.error.issues[0]?.message ?? "Invalid input", 422);
    }

    if (!isDatabaseConfigured()) return apiError("Database is not configured yet.", 503);
    await connectDB();

    const client = await Client.findById(parsed.data.clientId);
    if (!client) return apiError("Client not found", 404);

    const { proposalId, startDate, dueDate, ...rest } = parsed.data;
    const project = await Project.create({
      ...rest,
      clientId: client._id,
      proposalId: proposalId || undefined,
      startDate: startDate ?? undefined,
      dueDate: dueDate ?? undefined,
    });

    broadcast(REALTIME_EVENTS.PROJECT_UPDATED, String(project._id), { status: project.status });
    return ok({ project: { ...project.toObject({ versionKey: false }), id: String(project._id) } });
  } catch (err) {
    return handleApiError(err);
  }
}