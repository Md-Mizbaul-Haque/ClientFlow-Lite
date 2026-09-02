import { Router } from "express";
import { z } from "zod";

const router = Router();

const HealthResponse = z.object({
  status: z.literal("ok"),
  timestamp: z.string(),
  uptime: z.number(),
  service: z.literal("@repo/backend"),
});

router.get("/", (_req, res) => {
  const payload = {
    status: "ok" as const,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    service: "@repo/backend" as const,
  };
  // validate before sending — ensures shared contract
  const parsed = HealthResponse.parse(payload);
  res.json(parsed);
});

export default router;
