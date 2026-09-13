import { Router } from "express";
import type { NextFunction, Request, Response } from "express";

import { requireAuth } from "../middleware/auth.js";
import { prisma } from "../lib/prisma.js";
import { logger } from "../lib/logger.js";

const router = Router();

// GET /api/notifications — list + unread count. Cursor-based pagination keeps
// memory stable when an agency has tens of thousands of notifications.
router.get("/", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const auth = req.auth as { userId: string; agencyId: string };
    const { cursor, limit = 20 } = req.query as { cursor?: string; limit?: string };

    const take = Math.min(Math.max(1, Number(limit) || 20), 100);

    const notifications = await prisma.notification.findMany({
      where: { userId: auth.userId },
      orderBy: { createdAt: "desc" },
      take,
      ...(cursor ? { cursor: { id: cursor } } : {}),
    });

    const unreadCount = await prisma.notification.count({
      where: { userId: auth.userId, read: false },
    });

    res.json({
      notifications: notifications.map((n) => ({
        id: n.id,
        type: n.type as "info" | "warning" | "success" | "error",
        title: n.title,
        body: n.body,
        link: n.link ?? undefined,
        read: n.read,
        createdAt: n.createdAt.toISOString(),
      })),
      unreadCount,
      nextCursor: notifications.length === take ? notifications[notifications.length - 1]?.id ?? null : null,
    });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/notifications/read — mark one or all as read
router.patch("/read", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const auth = req.auth as { userId: string; agencyId: string };
    const { id } = req.body as { id?: string };

    if (id) {
      await prisma.notification.updateMany({
        where: { id, userId: auth.userId },
        data: { read: true },
      });
    } else {
      await prisma.notification.updateMany({
        where: { userId: auth.userId, read: false },
        data: { read: true },
      });
    }

    logger.info("notifications.read", { userId: auth.userId, markAll: !id });
    res.json({ status: "ok" });
  } catch (err) {
    next(err);
  }
});

export default router;
