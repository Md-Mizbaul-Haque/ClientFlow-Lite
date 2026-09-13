import { Router } from "express";
import type { NextFunction, Request, Response } from "express";

import { SearchResponseSchema } from "@repo/types";
import type { SearchResult } from "@repo/types";
import { requireAuth } from "../middleware/auth.js";
import { prisma } from "../lib/prisma.js";
import { logger } from "../lib/logger.js";

const router = Router();

// POST /api/search — body: { query: string, limit?: number }
router.post("/", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { query, limit = 10 } = req.body as { query?: string; limit?: number };

    if (!query || typeof query !== "string" || query.trim().length === 0) {
      res.json(SearchResponseSchema.parse({ results: [] }));
      return;
    }

    const trimmed = query.trim();
    const search = `%${trimmed}%`;

    const auth = req.auth as { userId: string; agencyId: string };

    // Run the searches in parallel. All three are indexed on (agencyId, text
    // column) so the planner picks an index scan, not a seq scan on a big table.
    const [requestResults, clientResults, invoiceResults] = await Promise.all([
      // requests — title + client name
      prisma.request.findMany({
        where: {
          agencyId: auth.agencyId,
          OR: [
            { title: { contains: trimmed } },
            { client: { name: { contains: trimmed } } },
          ],
        },
        select: {
          id: true,
          title: true,
          client: { select: { name: true } },
          status: true,
        },
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      // clients — name + company
      prisma.client.findMany({
        where: {
          agencyId: auth.agencyId,
          OR: [{ name: { contains: trimmed } }, { company: { contains: trimmed } }],
        },
        select: {
          id: true,
          name: true,
          company: true,
        },
        take: limit,
        orderBy: { name: "asc" },
      }),
      // invoices — number + client name
      prisma.invoice.findMany({
        where: {
          agencyId: auth.agencyId,
          OR: [
            { number: { contains: trimmed } },
            { client: { name: { contains: trimmed } } },
          ],
        },
        select: {
          id: true,
          number: true,
          status: true,
          amount: true,
          client: { select: { name: true } },
        },
        take: limit,
        orderBy: { issueDate: "desc" },
      }),
    ]);

    const results = [
      // Normalize to the shared contract
      ...requestResults.map((r) => ({
        type: "request" as const,
        id: r.id,
        title: r.title,
        subtitle: `${r.client.name} · ${r.status}`,
        url: `/requests/${r.id}`,
      })),
      ...clientResults.map((c) => ({
        type: "client" as const,
        id: c.id,
        title: c.name,
        subtitle: c.company ?? "No company",
        url: `/clients/${c.id}`,
      })),
      ...invoiceResults.map((i) => ({
        type: "invoice" as const,
        id: i.id,
        title: `Invoice ${i.number}`,
        subtitle: `${i.client.name} · ${i.status} · ${i.amount} KRW`,
        url: `/invoices/${i.id}`,
      })),
    ];

    // Deduplicate by id+type (a client named "Acme" could match both client and invoice)
    const seen = new Set<string>();
    const deduped = results.filter((r) => {
      const key = `${r.type}:${r.id}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    logger.info("search.executed", { agencyId: auth.agencyId, query: trimmed, count: deduped.length });

    res.json(SearchResponseSchema.parse({ results: deduped.slice(0, limit) }));
  } catch (err) {
    next(err);
  }
});

export default router;
