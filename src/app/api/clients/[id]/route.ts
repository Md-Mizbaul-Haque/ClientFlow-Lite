import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { connectDB, isDatabaseConfigured } from "@/lib/db";
import { Client, Invoice, Project, Proposal } from "@/lib/models";
import { apiError, apiUnauthorized, handleApiError, ok } from "@/lib/api";
import { clientUpdateSchema } from "@/lib/validators";

export async function PATCH(
  req: NextRequest,
  ctx: RouteContext<"/api/clients/[id]">
) {
  try {
    const admin = await requireAdmin();
    if (!admin) return apiUnauthorized();
    const { id } = await ctx.params;

    const body = await req.json();
    const parsed = clientUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return apiError(parsed.error.issues[0]?.message ?? "Invalid input", 422);
    }

    if (!isDatabaseConfigured()) return apiError("Database is not configured yet.", 503);
    await connectDB();

    const client = await Client.findById(id);
    if (!client) return apiError("Client not found", 404);

    if (parsed.data.email && parsed.data.email.toLowerCase() !== client.email) {
      const clash = await Client.findOne({ email: parsed.data.email.toLowerCase().trim() });
      if (clash && String(clash._id) !== id) {
        return apiError("Another client already uses this email", 409);
      }
    }

    Object.assign(client, {
      ...parsed.data,
      ...(parsed.data.email ? { email: parsed.data.email.toLowerCase().trim() } : {}),
    });
    await client.save();

    return ok({ client: { ...client.toObject({ versionKey: false }), id: String(client._id) } });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function DELETE(_req: NextRequest, ctx: RouteContext<"/api/clients/[id]">) {
  try {
    const admin = await requireAdmin();
    if (!admin) return apiUnauthorized();
    const { id } = await ctx.params;

    if (!isDatabaseConfigured()) return apiError("Database is not configured yet.", 503);
    await connectDB();

    const client = await Client.findById(id);
    if (!client) return apiError("Client not found", 404);

    const [proposals, projects, invoices] = await Promise.all([
      Proposal.countDocuments({ clientId: id }),
      Project.countDocuments({ clientId: id }),
      Invoice.countDocuments({ clientId: id }),
    ]);

    if (proposals > 0 || projects > 0 || invoices > 0) {
      return apiError(
        `This client has ${proposals} proposal(s), ${projects} project(s), and ${invoices} invoice(s). Delete those first.`,
        409
      );
    }

    await client.deleteOne();
    return ok({ success: true });
  } catch (err) {
    return handleApiError(err);
  }
}