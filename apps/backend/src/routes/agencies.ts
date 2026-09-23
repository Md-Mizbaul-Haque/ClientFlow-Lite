import { UpdateAgencySchema } from "@repo/types";
import { Router } from "express";
import type { NextFunction, Request, Response } from "express";

import { prisma } from "../lib/prisma.js";
import { logger } from "../lib/logger.js";
import { getAuth, requireAuth } from "../middleware/auth.js";

const router = Router();

function firstIssueMessage(error: { issues: Array<{ message: string }> }): string {
  return error.issues[0]?.message ?? "Invalid request";
}

// PATCH /api/agencies/me — save the agency profile collected in onboarding.
router.patch("/me", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = UpdateAgencySchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ status: "error", message: firstIssueMessage(parsed.error) });
      return;
    }
    const auth = getAuth(req);
    const data = parsed.data;
    await prisma.agency.update({
      where: { id: auth.agencyId },
      data: {
        ...(data.website !== undefined ? { website: data.website } : {}),
        ...(data.serviceType !== undefined ? { serviceType: data.serviceType } : {}),
        ...(data.serviceDetail !== undefined ? { serviceDetail: data.serviceDetail } : {}),
        ...(data.teamSize !== undefined ? { teamSize: data.teamSize } : {}),
        ...(data.logoKey !== undefined ? { logoKey: data.logoKey } : {}),
      },
    });
    logger.info("agencies.profile_updated", { agencyId: auth.agencyId });
    res.json({ status: "ok" });
  } catch (err) {
    next(err);
  }
});

export default router;
