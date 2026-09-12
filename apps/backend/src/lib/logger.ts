import { env } from "./env.js";

type Level = "info" | "warn" | "error";

/**
 * JSON lines in production so log aggregators can index fields; readable text
 * locally. Keep this dependency-free — a log shipper only needs valid JSON on
 * one line per event.
 */
function emit(level: Level, event: string, fields: Record<string, unknown> = {}): void {
  if (env.NODE_ENV === "production") {
    const line = JSON.stringify({ level, event, time: new Date().toISOString(), ...fields });
    if (level === "error") process.stderr.write(`${line}\n`);
    else process.stdout.write(`${line}\n`);
    return;
  }
  const detail = Object.entries(fields)
    .map(([key, value]) => `${key}=${String(value)}`)
    .join(" ");
  console.log(`[${level}] ${event}${detail ? ` ${detail}` : ""}`);
}

export const logger = {
  info: (event: string, fields?: Record<string, unknown>) => emit("info", event, fields),
  warn: (event: string, fields?: Record<string, unknown>) => emit("warn", event, fields),
  error: (event: string, fields?: Record<string, unknown>) => emit("error", event, fields),
};

/** Serializes an unknown thrown value without leaking it to the client. */
export function describeError(err: unknown): Record<string, unknown> {
  if (err instanceof Error) {
    return { name: err.name, message: err.message, stack: err.stack };
  }
  return { name: "UnknownError", message: String(err) };
}
