// Example Next.js route — proxies are not needed; frontend calls Express directly.
// Keeping this route as reference; prefer Express at :5000.
import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json({ status: "ok", source: "frontend", timestamp: new Date().toISOString() });
}
