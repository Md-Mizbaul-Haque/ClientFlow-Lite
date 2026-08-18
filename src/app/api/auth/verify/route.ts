import { NextRequest } from "next/server";
import { signIn } from "@/auth";
import { peekMagicToken } from "@/lib/magic-token";

export async function GET(req: NextRequest) {
  try {
    const token = req.nextUrl.searchParams.get("token");
    if (!token) {
      return Response.redirect(new URL("/auth/magic-link?error=invalid", req.url));
    }

    const email = await peekMagicToken(token);
    if (!email) {
      return Response.redirect(new URL("/auth/magic-link?error=expired", req.url));
    }

    const res = await signIn("credentials", { token, redirect: false });
    if (!res || res.error) {
      return Response.redirect(new URL("/auth/magic-link?error=no-client", req.url));
    }

    return Response.redirect(new URL("/portal", req.url));
  } catch (err) {
    console.error("[verify]", err);
    return Response.redirect(new URL("/auth/magic-link?error=expired", req.url));
  }
}