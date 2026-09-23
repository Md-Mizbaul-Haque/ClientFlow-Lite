import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";

import { env } from "./lib/env.js";
import { errorHandler, notFoundHandler } from "./middleware/error.js";
import agenciesRouter from "./routes/agencies.js";
import authRouter from "./routes/auth.js";
import healthRouter from "./routes/health.js";
import searchRouter from "./routes/search.js";
import notificationsRouter from "./routes/notifications.js";
import uploadsRouter from "./routes/uploads.js";

export function createApp(): express.Express {
  const app = express();

  // Single proxy hop (Railway/Render style) so rate limiting sees the real client IP.
  app.set("trust proxy", 1);
  app.disable("x-powered-by");

  app.use(helmet());
  app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
  // Explicit limit: without it body-parser silently defaults to 100kb, which is
  // a surprise the day a payload legitimately grows.
  app.use(express.json({ limit: "100kb" }));
  app.use(express.urlencoded({ extended: true, limit: "100kb" }));
  app.use(cookieParser());
  // "combined" keeps method, status, referrer, and user agent in production logs.
  app.use(morgan(env.NODE_ENV === "production" ? "combined" : "dev"));

  app.get("/", (_req, res) => {
    res.json({ name: "@repo/backend", status: "ok", docs: "/api/health" });
  });

app.use("/api/health", healthRouter);
app.use("/api/agencies", agenciesRouter);
app.use("/api/auth", authRouter);
app.use("/api/search", searchRouter);
app.use("/api/notifications", notificationsRouter);
app.use("/api/uploads", uploadsRouter);

  // 404 + error handler must be last
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

export const app = createApp();
