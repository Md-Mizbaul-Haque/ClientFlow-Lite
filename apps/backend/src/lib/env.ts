import { z } from "zod";

// Values that ship in .env.example or get pasted from docs. A production deploy
// that still carries one of these is a misconfiguration, not a style issue.
const PLACEHOLDER_SECRETS = new Set(["change-me", "changeme", "secret", "jwt-secret", "test"]);

const EnvSchema = z
  .object({
    PORT: z.coerce.number().int().positive().default(5000),
    CORS_ORIGIN: z.string().default("http://localhost:3000"),
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
    DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
    // 32 bytes: HS256 security is bounded by the key's entropy, so a short secret
    // is brute-forceable offline from a single captured token.
    JWT_SECRET: z.string().min(32, "JWT_SECRET must be at least 32 characters"),
    // Separate secret for refresh tokens — compromising access token secret
    // does not compromise refresh tokens.
    REFRESH_TOKEN_SECRET: z.string().min(32, "REFRESH_TOKEN_SECRET must be at least 32 characters"),
  })
  .superRefine((value, ctx) => {
    if (value.NODE_ENV !== "production") return;
    if (PLACEHOLDER_SECRETS.has(value.JWT_SECRET.toLowerCase())) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["JWT_SECRET"],
        message: "JWT_SECRET must be replaced before running in production",
      });
    }
    if (PLACEHOLDER_SECRETS.has(value.REFRESH_TOKEN_SECRET.toLowerCase())) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["REFRESH_TOKEN_SECRET"],
        message: "REFRESH_TOKEN_SECRET must be replaced before running in production",
      });
    }
    if (value.CORS_ORIGIN.includes("localhost")) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["CORS_ORIGIN"],
        message: "CORS_ORIGIN must point at the deployed frontend in production",
      });
    }
  });

const parsed = EnvSchema.safeParse(process.env);
if (!parsed.success) {
  const details = parsed.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`).join("; ");
  throw new Error(`Invalid environment configuration — ${details}`);
}

export const env = parsed.data;
export type Env = z.infer<typeof EnvSchema>;
