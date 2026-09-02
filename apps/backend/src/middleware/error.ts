import type { Request, Response, NextFunction } from "express";

export function notFoundHandler(_req: Request, res: Response) {
  res.status(404).json({ status: "error", message: "Not Found" });
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  console.error("[backend:error]", err);
  const message = err instanceof Error ? err.message : "Internal Server Error";
  res.status(500).json({ status: "error", message });
}
