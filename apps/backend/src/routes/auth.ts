import crypto from "node:crypto";

import { AuthResponseSchema, LoginSchema, MeResponseSchema, RegisterSchema } from "@repo/types";
import { Router } from "express";
import type { NextFunction, Request, Response } from "express";

import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../lib/jwt.js";
import { logger } from "../lib/logger.js";
import { comparePassword, exceedsBcryptLimit, getDecoyPasswordHash, hashPassword } from "../lib/password.js";
import { prisma } from "../lib/prisma.js";
import { allocateSubdomain } from "../lib/slug.js";
import { getAuth, requireAuth } from "../middleware/auth.js";
import { loginLimiter, refreshLimiter, registerLimiter } from "../middleware/rate-limit.js";

const router = Router();

const REFRESH_TOKEN_MAX_AGE = 7 * 24 * 60 * 60; // 7 days in seconds
const REFRESH_TOKEN_NAME = "refresh_token";

function firstIssueMessage(error: { issues: Array<{ message: string }> }): string {
  return error.issues[0]?.message ?? "Invalid request";
}

/** P2002 is Prisma's unique-constraint violation. Matched structurally so a
 *  generated-client path change can't turn a 409 into a 500. */
function isUniqueConstraintError(err: unknown): boolean {
  return typeof err === "object" && err !== null && (err as { code?: unknown }).code === "P2002";
}

/** P2002 against the subdomain key — a lost allocation race, worth one retry. */
function isSubdomainConflict(err: unknown): boolean {
  if (typeof err !== "object" || err === null) return false;
  const { code, meta } = err as { code?: unknown; meta?: { target?: unknown } };
  return code === "P2002" && Array.isArray(meta?.target) && meta.target.includes("subdomain");
}

function setRefreshCookie(res: Response, token: string, remember: boolean): void {
  res.cookie(REFRESH_TOKEN_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/api/auth/refresh",
    ...(remember ? { maxAge: REFRESH_TOKEN_MAX_AGE * 1000 } : {}),
  });
}

async function issueTokens(res: Response, userId: string, agencyId: string, remember: boolean): Promise<string> {
  const accessToken = signAccessToken(userId, agencyId);
  const tokenId = crypto.randomUUID();
  const refreshToken = signRefreshToken(userId, tokenId);

  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_MAX_AGE * 1000);

  await prisma.refreshToken.create({
    data: { userId, token: tokenId, expiresAt },
  });

  setRefreshCookie(res, refreshToken, remember);
  return accessToken;
}

router.post("/register", registerLimiter, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = RegisterSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ status: "error", message: firstIssueMessage(parsed.error) });
      return;
    }
    const data = parsed.data;
    const remember = req.body.remember === true;

    if (exceedsBcryptLimit(data.password)) {
      res.status(400).json({ status: "error", message: "Password must be 72 characters or fewer" });
      return;
    }

    const passwordHash = await hashPassword(data.password);

    let created: { agency: { id: string; name: string; subdomain: string }; user: { id: string; email: string } };
    // The subdomain pre-check can lose a race between check and insert. The
    // unique constraint is the real guarantee: on a subdomain conflict,
    // re-allocate (the taken name is now visible) and retry, a few times.
    for (let attempt = 1; ; attempt++) {
      try {
        created = await prisma.$transaction(
          async (tx) => {
            const subdomain = await allocateSubdomain(tx, data.agencyName);
            const agency = await tx.agency.create({
              data: {
                name: data.agencyName,
                subdomain,
                website: data.website ? data.website : null,
                serviceType: data.serviceType ?? null,
                serviceDetail: data.serviceDetail ? data.serviceDetail : null,
                teamSize: data.teamSize ?? null,
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
          },
          { maxWait: 10000, timeout: 20000 },
        );
        break;
      } catch (err) {
        if (isSubdomainConflict(err) && attempt < 3) continue;
        if (isUniqueConstraintError(err)) {
          res.status(409).json({ status: "error", message: "Email already registered" });
          return;
        }
        throw err;
      }
    }

    const accessToken = await issueTokens(res, created.user.id, created.agency.id, remember);
    logger.info("auth.register_succeeded", { userId: created.user.id, agencyId: created.agency.id });
    res.status(201).json(
      AuthResponseSchema.parse({
        status: "ok",
        accessToken,
        user: {
          id: created.user.id,
          agencyId: created.agency.id,
          agencyName: created.agency.name,
          subdomain: created.agency.subdomain,
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

    const remember = req.body.remember === true;

    // Workspace-scoped: the same email can belong to several agencies, so
    // the subdomain picks the tenant before the password is checked.
    const agency = await prisma.agency.findUnique({
      where: { subdomain: parsed.data.subdomain },
    });
    const user = agency
      ? await prisma.user.findFirst({
          where: { email: parsed.data.email, agencyId: agency.id },
          include: { agency: true },
        })
      : null;

    // Always run a bcrypt compare. Short-circuiting on a missing user makes
    // "unknown email" ~100ms faster than "wrong password", which is enough to
    // enumerate registered accounts from the browser.
    const hash = user?.passwordHash ?? (await getDecoyPasswordHash());
    const passwordOk = await comparePassword(parsed.data.password, hash);

    if (!user || !passwordOk) {
      logger.warn("auth.login_failed", { email: parsed.data.email, ip: req.ip });
      res.status(401).json({ status: "error", message: "Invalid workspace, email or password" });
      return;
    }

    const accessToken = await issueTokens(res, user.id, user.agencyId, remember);
    logger.info("auth.login_succeeded", { userId: user.id, agencyId: user.agencyId });
    res.json(
      AuthResponseSchema.parse({
        status: "ok",
        accessToken,
        user: { id: user.id, agencyId: user.agencyId, agencyName: user.agency.name, subdomain: user.agency.subdomain, email: user.email },
      }),
    );
  } catch (err) {
    next(err);
  }
});

router.post("/refresh", refreshLimiter, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies?.[REFRESH_TOKEN_NAME];
    if (!token) {
      res.status(401).json({ status: "error", message: "Refresh token required" });
      return;
    }

    let payload;
    try {
      payload = verifyRefreshToken(token);
    } catch {
      res.status(401).json({ status: "error", message: "Invalid refresh token" });
      return;
    }

    const stored = await prisma.refreshToken.findUnique({ where: { token: payload.tokenId } });
    if (!stored || stored.revokedAt || stored.expiresAt < new Date()) {
      res.status(401).json({ status: "error", message: "Refresh token revoked or expired" });
      return;
    }

    // Rotate: revoke old token, issue new pair
    await prisma.refreshToken.update({
      where: { token: payload.tokenId },
      data: { revokedAt: new Date() },
    });

    const user = await prisma.user.findUnique({ where: { id: payload.sub }, include: { agency: true } });
    if (!user) {
      res.status(401).json({ status: "error", message: "User not found" });
      return;
    }

    const newAccessToken = signAccessToken(user.id, user.agencyId);
    const newTokenId = crypto.randomUUID();
    const newRefreshToken = signRefreshToken(user.id, newTokenId);
    const expiresAt = new Date(Date.now() + REFRESH_TOKEN_MAX_AGE * 1000);

    await prisma.refreshToken.create({
      data: { userId: user.id, token: newTokenId, expiresAt },
    });

    // Detect if original cookie had maxAge (remember=true)
    const originalMaxAge = req.cookies?.[`${REFRESH_TOKEN_NAME}.maxAge`];
    const remember = originalMaxAge !== undefined;
    setRefreshCookie(res, newRefreshToken, remember);

    logger.info("auth.refresh_succeeded", { userId: user.id });
    res.json({ status: "ok", accessToken: newAccessToken });
  } catch (err) {
    next(err);
  }
});

router.post("/logout", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies?.[REFRESH_TOKEN_NAME];
    if (token) {
      try {
        const payload = verifyRefreshToken(token);
        await prisma.refreshToken.updateMany({
          where: { userId: payload.sub, revokedAt: null },
          data: { revokedAt: new Date() },
        });
      } catch {
        // Token invalid/expired — still clear the cookie
      }
    }

    res.clearCookie(REFRESH_TOKEN_NAME, { path: "/api/auth/refresh" });
    res.json({ status: "ok" });
  } catch (err) {
    next(err);
  }
});

// The frontend's session check after a reload. Re-reads the user instead of
// trusting the token alone, so a deleted account cannot keep browsing the portal
// until its token expires.
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
        user: { id: user.id, agencyId: user.agencyId, agencyName: user.agency.name, subdomain: user.agency.subdomain, email: user.email },
      }),
    );
  } catch (err) {
    next(err);
  }
});

export default router;
