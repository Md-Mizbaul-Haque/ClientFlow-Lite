import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import healthRouter from "./routes/health.js";
import { errorHandler, notFoundHandler } from "./middleware/error.js";

const app = express();
const port = Number(process.env.PORT ?? 5000);

app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN ?? "http://localhost:3000", credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

app.get("/", (_req, res) => {
  res.json({ name: "@repo/backend", status: "ok", docs: "/api/health" });
});

app.use("/api/health", healthRouter);

// 404 + error handler must be last
app.use(notFoundHandler);
app.use(errorHandler);

app.listen(port, () => {
  console.log(`[backend] listening at http://localhost:${port}`);
});

export default app;
