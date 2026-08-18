import { requireAdmin } from "@/lib/auth";
import { connectDB, isDatabaseConfigured } from "@/lib/db";
import { Client, Invoice, Project, Proposal, Task } from "@/lib/models";
import { apiError, apiUnauthorized, handleApiError, ok } from "@/lib/api";

export async function GET() {
  try {
    const admin = await requireAdmin();
    if (!admin) return apiUnauthorized();

    if (!isDatabaseConfigured()) {
      return apiError("Database is not configured yet. Add MONGODB_URI to .env and run `npm run seed`.", 503);
    }
    await connectDB();

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const currency = process.env.DEFAULT_CURRENCY || "USD";

    const [activeProjects, pendingProposals, allProjects, clients, recentInvoices, overdueTasks, monthlyRevenueAgg, revenuePerMonth] =
      await Promise.all([
        Project.countDocuments({ status: { $in: ["in_progress", "in_review"] } }),
        Proposal.countDocuments({ status: "sent" }),
        Project.find().select("status name clientId").populate("clientId", "name company").lean(),
        Client.countDocuments(),
        Invoice.find()
          .populate("clientId", "name company")
          .sort({ createdAt: -1 })
          .limit(6)
          .lean(),
        Task.find({ completed: false, dueDate: { $lt: now } })
          .populate("projectId", "name")
          .sort({ dueDate: 1 })
          .limit(10)
          .lean(),
        Invoice.aggregate([
          { $match: { status: "paid", paidAt: { $gte: monthStart } } },
          { $group: { _id: null, total: { $sum: "$amount" } } },
        ]),
        Invoice.aggregate([
          { $match: { paidAt: { $exists: true } } },
          {
            $group: {
              _id: { $year: "$paidAt", $month: "$paidAt" },
              total: { $sum: "$amount" },
            },
          },
          { $sort: { "_id.year": 1, "_id.month": 1 } },
        ]),
      ]);

    const monthlyRevenue = monthlyRevenueAgg.length ? monthlyRevenueAgg[0].total : 0;

    const last12: { label: string; total: number }[] = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const found = revenuePerMonth.find(
        (r) => r._id.year === d.getFullYear() && r._id.month === d.getMonth() + 1
      );
      last12.push({
        label: d.toLocaleDateString("en-US", { month: "short" }),
        total: found ? found.total : 0,
      });
    }

    const projectStatusCounts = {
      backlog: allProjects.filter((p) => p.status === "backlog").length,
      in_progress: allProjects.filter((p) => p.status === "in_progress").length,
      in_review: allProjects.filter((p) => p.status === "in_review").length,
      completed: allProjects.filter((p) => p.status === "completed").length,
    };

    return ok({
      stats: {
        activeProjects,
        pendingProposals,
        monthlyRevenue,
        currency,
        overdueTasks: overdueTasks.length,
        totalClients: clients,
      },
      revenueSeries: last12,
      projectStatusCounts,
      overdueTasks: overdueTasks.map((t) => ({
        id: String(t._id),
        title: t.title,
        dueDate: t.dueDate,
        project: t.projectId ? { id: String((t.projectId as { _id: unknown })._id), name: (t.projectId as { name?: string }).name ?? "" } : null,
      })),
      recentInvoices: recentInvoices.map((inv) => ({
        id: String(inv._id),
        number: inv.number,
        amount: inv.amount,
        currency: inv.currency,
        status: inv.status,
        client: inv.clientId ? { name: (inv.clientId as { name?: string }).name ?? "" } : null,
      })),
    });
  } catch (err) {
    return handleApiError(err);
  }
}