import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { connectDB, isDatabaseConfigured } from "@/lib/db";
import { Client, Invoice, nextNumber } from "@/lib/models";
import { apiError, apiUnauthorized, handleApiError, ok } from "@/lib/api";
import { invoiceCreateSchema } from "@/lib/validators";
import { broadcast } from "@/lib/realtime";
import { REALTIME_EVENTS } from "@/lib/realtime-events";

export async function GET() {
  try {
    const admin = await requireAdmin();
    if (!admin) return apiUnauthorized();

    if (!isDatabaseConfigured()) return apiError("Database is not configured yet.", 503);
    await connectDB();

    const invoices = await Invoice.find()
      .sort({ createdAt: -1 })
      .populate("clientId", "name company email")
      .populate("projectId", "name")
      .lean();

    return ok(
      invoices.map((inv) => ({
        ...inv,
        id: String(inv._id),
        client: inv.clientId,
        project: inv.projectId,
        clientId: String(inv.clientId),
        projectId: inv.projectId ? String(inv.projectId) : undefined,
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
    const parsed = invoiceCreateSchema.safeParse(body);
    if (!parsed.success) {
      return apiError(parsed.error.issues[0]?.message ?? "Invalid input", 422);
    }

    if (!isDatabaseConfigured()) return apiError("Database is not configured yet.", 503);
    await connectDB();

    const client = await Client.findById(parsed.data.clientId);
    if (!client) return apiError("Client not found", 404);

    const { projectId, proposalId, dueDate, ...rest } = parsed.data;
    const invoice = await Invoice.create({
      ...rest,
      clientId: client._id,
      projectId: projectId || undefined,
      proposalId: proposalId || undefined,
      dueDate: dueDate ?? undefined,
      number: await nextNumber("INV", new Date().getFullYear()),
      status: "draft",
    });

    broadcast(REALTIME_EVENTS.INVOICE_UPDATED, String(invoice._id), {});
    return ok({ invoice: { ...invoice.toObject({ versionKey: false }), id: String(invoice._id) } });
  } catch (err) {
    return handleApiError(err);
  }
}