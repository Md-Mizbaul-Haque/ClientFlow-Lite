import type { Request, Response, NextFunction } from "express";

import { describeError, logger } from "../lib/logger.js";

interface BodyParserError {
  type?: string;
  status?: number;
}

export function notFoundHandler(_req: Request, res: Response) {
  res.status(404).json({ status: "error", message: "Not Found" });
}

/**
 * Last stop for every unhandled failure. Responses stay generic: an error string
 * from Prisma or the driver names tables, columns, and constraints, which is a
 * free map of the database for anyone probing the API. Details go to the log.
 */
export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction) {
  const { type, status } = (err ?? {}) as BodyParserError;

  if (type === "entity.parse.failed" || (status === 400 && err instanceof SyntaxError)) {
    res.status(400).json({ status: "error", message: "Request body is not valid JSON" });
    return;
  }
  if (type === "entity.too.large") {
    res.status(413).json({ status: "error", message: "Request body is too large" });
    return;
  }

  logger.error("unhandled_request_error", {
    method: req.method,
    path: req.path,
    ...describeError(err),
  });
  res.status(500).json({ status: "error", message: "Internal Server Error" });
}
