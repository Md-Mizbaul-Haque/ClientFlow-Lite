import { z } from "zod";
import { Router } from "express";
import type { NextFunction, Request, Response } from "express";

import { extensionFor, presignedLogoUpload } from "../lib/s3.js";
import { logger } from "../lib/logger.js";
import { getAuth, requireAuth } from "../middleware/auth.js";
import { authedWriteLimiter } from "../middleware/rate-limit.js";

const router = Router();

const MAX_LOGO_BYTES = 2 * 1024 * 1024;

const LogoRequestSchema = z.object({
  contentType: z.string(),
  size: z.number().int().positive().max(MAX_LOGO_BYTES, "Logo must be 2MB or smaller"),
});

// POST /api/uploads/logo — mint a presigned PUT URL for an agency logo.
// The browser uploads straight to the bucket; the key is saved via
// PATCH /api/agencies/me.
router.post("/logo", requireAuth, authedWriteLimiter, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = LogoRequestSchema.safeParse(req.body);
    if (!parsed.success || !extensionFor(parsed.data.contentType)) {
      res.status(400).json({ status: "error", message: "Only PNG, JPEG, or SVG logos up to 2MB are accepted" });
      return;
    }
    const auth = getAuth(req);
    const result = await presignedLogoUpload(auth.agencyId, parsed.data.contentType);
    logger.info("uploads.logo_url_issued", { agencyId: auth.agencyId, key: result.key });
    res.json({ status: "ok", ...result });
  } catch (err) {
    next(err);
  }
});

export default router;
