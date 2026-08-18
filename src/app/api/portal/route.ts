import { requireClient, clientForSession } from "@/lib/auth";
import { connectDB, isDatabaseConfigured } from "@/lib/db";
import { Check, Invoice, Milestone, Project, Proposal } from "@/lib/models";
import { apiError, apiUnauthorized, handleApiError, ok } from "@/lib/api";

export async function GET() {
  try {
    const session = await requireClient();
    if (!session) return apiUnauthorized();

    if (!isDatabaseConfigured()) {
      return apiError("Database is not configured yet.", 503);
    }
    await connectDB();

    const clientId = await clientForSession(session);
    if (!clientId) {
      return ok({ client: null, proposals: [], projects: [], invoices: [] });
    }

    const now = new Date();
    const [proposals, projects, invoices] = await Promise.all([
      Proposal.find({ clientId }).sort({ createdAt: -1 }).lean(),
      Project.find({ clientId }).sort({ updatedAt: -1 }).lean(),
      Invoice.find({ clientId }).sort({ createdAt: -1 }).lean(),
    ]);

    const milestoneAgg = await Milestone.aggregate([
      { $match: { projectId: { $in: projects.map((p) => p._id) } } },
      { $group: { _id: "$projectId", total: { $sum: 1 }, done: { $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] } } } },
    ]);
    const progressMap = Object.fromEntries(
      milestoneAgg.map((m) => [String(m._id), { total: m.total, done: m.done }])
    );

    const checkAgg = await Check.aggregate([
      { $match: { proposalId: { $in: proposals.map((p) => p._id) } } },
      { $group: { _id: "$proposalId", count: { $sum: 1 } } },
    ]);
    const checkMap = Object.fromEntries(checkAgg.map((c) => [String(c._id), c.count]));

    const overdueInvoices = invoices.filter((inv) => {
      if (inv.status === "paid" || inv.status === "draft") return false;
      const due = inv.dueDate ? new Date(inv.dueDate) : null;
      return due && due < now;
    });

    const pendingSignature = proposals.find((p) => p.status === "sent" && !p.signature);
    const activeProject = projects.find((p) => p.status !== "completed");
    const unpaidInvoice = invoices.find((inv) => inv.status === "sent" || inv.status === "overdue");

    return ok({
      client: null,
      proposals: proposals.map((p) => ({
        id: String(p._id),
        number: p.number,
        title: p.title,
        price: p.price,
        currency: p.currency,
        status: p.status,
        createdAt: p.createdAt,
        checkedCount: checkMap[String(p._id)] ?? 0,
        deliverableCount: p.deliverables.length,
      })),
      projects: projects.map((p) => ({
        id: String(p._id),
        name: p.name,
        description: p.description,
        status: p.status,
        dueDate: p.dueDate,
        progress: progressMap[String(p._id)] ?? { total: 0, done: 0 },
      })),
      invoices: invoices.map((inv) => ({
        id: String(inv._id),
        number: inv.number,
        amount: inv.amount,
        currency: inv.currency,
        type: inv.type,
        status: inv.status,
        dueDate: inv.dueDate,
      })),
      highlights: {
        needsSignature: pendingSignature
          ? { id: String(pendingSignature._id), number: pendingSignature.number, title: pendingSignature.title }
          : null,
        activeProject: activeProject
          ? { id: String(activeProject._id), name: activeProject.name, status: activeProject.status }
          : null,
        unpaidInvoice: unpaidInvoice ? { id: String(unpaidInvoice._id), number: unpaidInvoice.number } : null,
        overdueInvoiceCount: overdueInvoices.length,
      },
    });
  } catch (err) {
    return handleApiError(err);
  }
}