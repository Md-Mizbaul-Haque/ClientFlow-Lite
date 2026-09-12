import { AuthResponseSchema, LoginSchema, MeResponseSchema, RegisterSchema } from "@repo/types";
import { Router } from "express";
import type { NextFunction, Request, Response } from "express";

import { signAuthToken } from "../lib/jwt.js";
import { logger } from "../lib/logger.js";
import { comparePassword, exceedsBcryptLimit, getDecoyPasswordHash, hashPassword } from "../lib/password.js";
import { prisma } from "../lib/prisma.js";
import { getAuth, requireAuth } from "../middleware/auth.js";
import { loginLimiter, registerLimiter } from "../middleware/rate-limit.js";

const router = Router();

function firstIssueMessage(error: { issues: Array<{ message: string }> }): string {
  return error.issues[0]?.message ?? "Invalid request";
}

/** P2002 is Prisma's unique-constraint violation. Matched structurally so a
 *  generated-client path change can't turn a 409 into a 500. */
function isUniqueConstraintError(err: unknown): boolean {
  return typeof err === "object" && err !== null && (err as { code?: unknown }).code === "P2002";
}

router.post("/register", registerLimiter, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = RegisterSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ status: "error", message: firstIssueMessage(parsed.error) });
      return;
    }
    const data = parsed.data;

    if (exceedsBcryptLimit(data.password)) {
      res.status(400).json({ status: "error", message: "Password must be 72 characters or fewer" });
      return;
    }

    const passwordHash = await hashPassword(data.password);

    let created: { agency: { id: string; name: string }; user: { id: string; email: string } };
    try {
      // No pre-flight email check: two concurrent requests both pass it and the
      // loser still hits the unique index. Let the database be the arbiter and
      // translate its violation into a clean 409.
      created = await prisma.$transaction(async (tx) => {
        const agency = await tx.agency.create({
          data: {
            name: data.agencyName,
            website: data.website ? data.website : null,
            serviceType: data.serviceType,
            serviceDetail: data.serviceDetail ? data.serviceDetail : null,
            teamSize: data.teamSize,
          },
        });
        const user = await tx.user.create({
          data: {
            agencyId: agency.id,
            email: data.email,
            passwordHash,
          },
        });
        return { agency, user };
      });
    } catch (err) {
      if (isUniqueConstraintError(err)) {
        res.status(409).json({ status: "error", message: "Email already registered" });
        return;
      }
      throw err;
    }

    const token = signAuthToken(created.user.id, created.agency.id);
    logger.info("auth.register_succeeded", { userId: created.user.id, agencyId: created.agency.id });
    // Guarantee the wire contract — a bug here must 500, never ship a malformed body.
    res.status(201).json(
      AuthResponseSchema.parse({
        status: "ok",
        token,
        user: {
          id: created.user.id,
          agencyId: created.agency.id,
          agencyName: created.agency.name,
          email: created.user.email,
        },
      }),
    );
  } catch (err) {
    next(err);
  }
});

router.post("/login", loginLimiter, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = LoginSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ status: "error", message: firstIssueMessage(parsed.error) });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { email: parsed.data.email },
      include: { agency: true },
    });

    // Always run a bcrypt compare. Short-circuiting on a missing user makes
    // "unknown email" ~100ms faster than "wrong password", which is enough to
    // enumerate registered accounts from the browser.
    const hash = user?.passwordHash ?? (await getDecoyPasswordHash());
    const passwordOk = await comparePassword(parsed.data.password, hash);

    if (!user || !passwordOk) {
      logger.warn("auth.login_failed", { email: parsed.data.email, ip: req.ip });
      res.status(401).json({ status: "error", message: "Invalid email or password" });
      return;
    }

    const token = signAuthToken(user.id, user.agencyId);
    logger.info("auth.login_succeeded", { userId: user.id, agencyId: user.agencyId });
    res.json(
      AuthResponseSchema.parse({
        status: "ok",
        token,
        user: { id: user.id, agencyId: user.agencyId, agencyName: user.agency.name, email: user.email },
      }),
    );
  } catch (err) {
    next(err);
  }
});

// The frontend's session check after a reload. Re-reads the user instead of
// trusting the token alone, so a deleted account cannot keep browsing the portal
// until its 7-day token expires.
router.get("/me", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId, agencyId } = getAuth(req);
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { agency: true },
    });
    if (!user || user.agencyId !== agencyId) {
      res.status(401).json({ status: "error", message: "Your session has expired. Please log in again." });
      return;
    }
    res.json(
      MeResponseSchema.parse({
        status: "ok",
        user: { id: user.id, agencyId: user.agencyId, agencyName: user.agency.name, email: user.email },
      }),
    );
  } catch (err) {
    next(err);
  }
});

export default router;
