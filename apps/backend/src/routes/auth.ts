import { AuthResponseSchema, LoginSchema, RegisterSchema } from "@repo/types";
import { Router } from "express";
import type { NextFunction, Request, Response } from "express";

import { signAuthToken } from "../lib/jwt.js";
import { comparePassword, hashPassword } from "../lib/password.js";
import { prisma } from "../lib/prisma.js";

const router = Router();

function firstIssueMessage(error: { issues: Array<{ message: string }> }): string {
  return error.issues[0]?.message ?? "Invalid request";
}

router.post("/register", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = RegisterSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ status: "error", message: firstIssueMessage(parsed.error) });
      return;
    }
    const data = parsed.data;

    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) {
      res.status(409).json({ status: "error", message: "Email already registered" });
      return;
    }

    const passwordHash = await hashPassword(data.password);

    const { agency, user } = await prisma.$transaction(async (tx) => {
      const createdAgency = await tx.agency.create({
        data: {
          name: data.agencyName,
          website: data.website ? data.website : null,
          serviceType: data.serviceType,
          serviceDetail: data.serviceDetail ? data.serviceDetail : null,
          teamSize: data.teamSize,
        },
      });
      const createdUser = await tx.user.create({
        data: {
          agencyId: createdAgency.id,
          email: data.email,
          passwordHash,
        },
      });
      return { agency: createdAgency, user: createdUser };
    });

    const token = signAuthToken(user.id, agency.id);
    // Guarantee the wire contract — a bug here must 500, never ship a malformed body.
    res.status(201).json(
      AuthResponseSchema.parse({
        status: "ok",
        token,
        user: { id: user.id, agencyName: agency.name, email: user.email },
      }),
    );
  } catch (err) {
    next(err);
  }
});

router.post("/login", async (req: Request, res: Response, next: NextFunction) => {
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
    const passwordOk = user ? await comparePassword(parsed.data.password, user.passwordHash) : false;
    if (!user || !passwordOk) {
      res.status(401).json({ status: "error", message: "Invalid email or password" });
      return;
    }

    const token = signAuthToken(user.id, user.agencyId);
    res.json(
      AuthResponseSchema.parse({
        status: "ok",
        token,
        user: { id: user.id, agencyName: user.agency.name, email: user.email },
      }),
    );
  } catch (err) {
    next(err);
  }
});

export default router;
