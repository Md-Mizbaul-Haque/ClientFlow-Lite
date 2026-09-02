import { z } from "zod";

// Shared API contracts — import in both frontend and backend

export const HealthResponseSchema = z.object({
  status: z.literal("ok"),
  timestamp: z.string(),
  uptime: z.number().optional(),
  service: z.union([z.literal("@repo/backend"), z.literal("frontend")]).optional(),
});

export type HealthResponse = z.infer<typeof HealthResponseSchema>;

export const ApiErrorSchema = z.object({
  status: z.literal("error"),
  message: z.string(),
});

export type ApiError = z.infer<typeof ApiErrorSchema>;
