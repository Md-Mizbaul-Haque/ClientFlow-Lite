import { NextRequest } from "next/server";
import { requireAdmin, requireClientWithClientId } from "@/lib/auth";
import { connectDB, isDatabaseConfigured } from "@/lib/db";
import { Deliverable, Project } from "@/lib/models";
import { apiError, apiForbidden, apiUnauthorized, handleApiError, ok } from "@/lib/api";
import { broadcast } from "@/lib/realtime";
import { REALTIME_EVENTS } from "@/lib/realtime-events";
import { randomBytes } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import { join } from "path";

const UPLOAD_DIR = join(process.cwd(), "uploads");

const ALLOWED_MIME = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/zip",
  "application/octet-stream",
  "text/plain",
  "text/csv",
  "image/png",
  "image/jpeg",
  "image/gif",
  "image/webp",
  "image/svg+xml",
  "video/mp4",
  "video/quicktime",
]);

const MAX_SIZE = 25 * 1024 * 1024; // 25MB

export async function POST(req: NextRequest, ctx: RouteContext<"/api/projects/[id]/deliverables">) {
  try {
    const session = (await requireAdmin()) ?? (await requireClientWithClientId());
    if (!session) return apiUnauthorized();
    const { id } = await ctx.params;

    if (!isDatabaseConfigured()) return apiError("Database is not configured yet.", 503);
    await connectDB();

    const project = await Project.findById(id);
    if (!project) return apiError("Project not found", 404);

    if (session.role === "client") {
      if (String(project.clientId) !== session.clientId) {
        return apiForbidden();
      }
    }

    const form = await req.formData();
    const file = form.get("file");
    const milestoneId = String(form.get("milestoneId") ?? "");

    if (!(file instanceof File) || file.size === 0) {
      return apiError("No file provided", 422);
    }
    if (file.size > MAX_SIZE) {
      return apiError("File exceeds the 25MB limit", 413);
    }
    if (file.type && !ALLOWED_MIME.has(file.type)) {
      return apiError("This file type is not allowed", 415);
    }

    const safeName = file.name.replace(/[^\w.\-() ]+/g, "_").slice(0, 160);
    const storedName = `${Date.now()}-${randomBytes(4).toString("hex")}-${safeName}`;
    const dir = join(UPLOAD_DIR, String(project._id));
    await mkdir(dir, { recursive: true });
    await writeFile(join(dir, storedName), Buffer.from(await file.arrayBuffer()));

    const deliverable = await Deliverable.create({
      projectId: project._id,
      milestoneId: milestoneId || undefined,
      fileName: safeName,
      storedPath: `${project._id}/${storedName}`,
      size: file.size,
      mime: file.type || "application/octet-stream",
      uploadedBy: session.id,
      uploadedByName: session.name,
    });

    broadcast(REALTIME_EVENTS.DELIVERABLE_CREATED, String(deliverable._id), {
      fileName: safeName,
    });

    return ok({
      deliverable: {
        ...deliverable.toObject({ versionKey: false }),
        id: String(deliverable._id),
        downloadUrl: `/api/deliverables/${deliverable._id}`,
      },
    });
  } catch (err) {
    return handleApiError(err);
  }
}