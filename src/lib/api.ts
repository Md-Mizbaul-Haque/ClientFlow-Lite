import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { DatabaseNotConfiguredError } from "./db";

export function apiError(message: string, status = 400, headers?: Record<string, string>) {
  return NextResponse.json({ error: message }, { status, headers });
}

export function apiForbidden() {
  return apiError("You don't have permission to do that", 403);
}

export function apiUnauthorized() {
  return apiError("Not authenticated", 401);
}

export function handleApiError(err: unknown) {
  if (err instanceof DatabaseNotConfiguredError) {
    return apiError(
      "Database is not configured yet. Add MONGODB_URI to .env and run `npm run seed`.",
      503
    );
  }
  if (err instanceof ZodError) {
    const first = err.issues[0];
    return apiError(first ? `${first.path.join(".")}: ${first.message}` : "Invalid input", 422);
  }
  console.error("[api]", err);
  return apiError("Something went wrong", 500);
}

export function ok<T>(data: T, init?: ResponseInit) {
  return NextResponse.json(data, init);
}