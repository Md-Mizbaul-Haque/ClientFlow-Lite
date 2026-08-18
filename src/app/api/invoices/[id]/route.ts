import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { connectDB, isDatabaseConfigured } from "@/lib/db";
import { Invoice } from "@/lib/models";
import { apiError, apiUnauthorized, handleApiError, ok } from "@/lib/api";
import { invoiceCreateSchema } from "@/lib/validators";
import { broadcast } from "@/lib/realtime";
import { REALTIME_EVENTS } from "@/lib/realtime-events";

export async function PATCH(req: NextRequest, ctx: RouteContext<"/api/invoices/[id]">) {
  try {
    const admin = await requireAdmin();
    if (!admin) return apiUnauthorized();
    const { id } = await ctx.params;

    const body = await req.json();
    const parsed = invoiceCreateSchema.partial().safeParse(body);
    if (!parsed.success) {
      return apiError(parsed.error.issues[0]?.message ?? "Invalid input", 422);
    }

    if (!isDatabaseConfigured()) return apiError("Database is not configured yet.", 503);
    await connectDB();

    const invoice = await Invoice.findById(id);
    if (!invoice) return apiError("Invoice not found", 404);
    if (invoice.status === "paid") {
      return apiError("Paid invoices cannot be edited", 409);
    }

    const { projectId, proposalId, dueDate, ...rest } = parsed.data;
    Object.assign(invoice, rest, {
      projectId: projectId || invoice.projectId,
      proposalId: proposalId || invoice.proposalId,
      dueDate: dueDate === undefined ? invoice.dueDate : dueDate ?? null,
    });
    await invoice.save();

    broadcast(REALTIME_EVENTS.INVOICE_UPDATED, String(invoice._id), {});
    return ok({ invoice: { ...invoice.toObject({ versionKey: false }), id: String(invoice._id) } });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function DELETE(_req: NextRequest, ctx: RouteContext<"/api/invoices/[id]">) {
  try {
    const admin = await requireAdmin();
    if (!admin) return apiUnauthorized();
    const { id } = await ctx.params;

    if (!isDatabaseConfigured()) return apiError("Database is not configured yet.", 503);
    await connectDB();

    const invoice = await Invoice.findById(id);
    if (!invoice) return apiError("Invoice not found", 404);

    await invoice.deleteOne();
    return ok({ success: true });
  } catch (err) {
    return handleApiError(err);
  }
}