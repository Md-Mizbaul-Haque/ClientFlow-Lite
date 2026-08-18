import { NextRequest } from "next/server";
import { requireAdmin, requireClient, clientForSession } from "@/lib/auth";
import { connectDB, isDatabaseConfigured } from "@/lib/db";
import { Deliverable, Project } from "@/lib/models";
import { apiError, apiForbidden, apiUnauthorized, handleApiError, ok } from "@/lib/api";
import { broadcast } from "@/lib/realtime";
import { REALTIME_EVENTS } from "@/lib/realtime-events";
import { unlink } from "fs/promises";
import { join } from "path";

const UPLOAD_DIR = join(process.cwd(), "uploads");

export async function GET(_req: NextRequest, ctx: RouteContext<"/api/deliverables/[id]">) {
  try {
    const session = (await requireAdmin()) ?? (await requireClient());
    if (!session) return apiUnauthorized();
    const { id } = await ctx.params;

    if (!isDatabaseConfigured()) return apiError("Database is not configured yet.", 503);
    await connectDB();

    const deliverable = await Deliverable.findById(id).lean();
    if (!deliverable) return apiError("File not found", 404);

    if (session.role === "client") {
      const project = await Project.findById(deliverable.projectId);
      const clientId = await clientForSession(session);
      if (!project || (clientId && String(project.clientId) !== clientId)) {
        return apiForbidden();
      }
    }

    const { createReadStream } = await import("fs");
    const filePath = join(UPLOAD_DIR, deliverable.storedPath);
    const stream = createReadStream(filePath);

    return new Response(stream as unknown as BodyInit, {
      headers: {
        "Content-Type": deliverable.mime,
        "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(deliverable.fileName)}`,
      },
    });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function DELETE(_req: NextRequest, ctx: RouteContext<"/api/deliverables/[id]">) {
  try {
    const admin = await requireAdmin();
    if (!admin) return apiUnauthorized();
    const { id } = await ctx.params;

    if (!isDatabaseConfigured()) return apiError("Database is not configured yet.", 503);
    await connectDB();

    const deliverable = await Deliverable.findById(id);
    if (!deliverable) return apiError("File not found", 404);

    const filePath = join(UPLOAD_DIR, deliverable.storedPath);
    await unlink(filePath).catch(() => {});
    await deliverable.deleteOne();

    broadcast(REALTIME_EVENTS.DELIVERABLE_DELETED, String(deliverable._id), {});
    return ok({ success: true });
  } catch (err) {
    return handleApiError(err);
  }
}