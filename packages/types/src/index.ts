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

// Auth — mirrors the 2-step signup UI (account info, then agency profile)

export const ServiceTypeSchema = z.enum([
  "Graphic Design Agency",
  "Webflow Agency",
  "Video Editing and Production Agency",
  "3D Rendering and Interior Design Agency",
  "Other (specify)",
]);

export type ServiceType = z.infer<typeof ServiceTypeSchema>;

export const TeamSizeSchema = z.enum(["1-5", "6-20", "21-50", "50+"]);

export type TeamSize = z.infer<typeof TeamSizeSchema>;

export const AccountInfoSchema = z.object({
  agencyName: z.string().trim().min(1, "Agency name is required").max(100),
  email: z.string().trim().toLowerCase().email("Enter a valid email").max(255),
  // Matches the signup hint: at least 8 characters, including a number.
  // The 72 cap is bcrypt's limit — it ignores bytes past it, so a longer
  // password would be accepted while only its first 72 bytes decide access.
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(72, "Password must be 72 characters or fewer")
    .regex(/[0-9]/, "Password must include a number"),
});

export type AccountInfo = z.infer<typeof AccountInfoSchema>;

export const RegisterSchema = AccountInfoSchema.extend({
  website: z.string().trim().max(255).optional(),
  serviceType: ServiceTypeSchema,
  serviceDetail: z.string().trim().max(100).optional(),
  teamSize: TeamSizeSchema,
}).superRefine((data, ctx) => {
    if (data.serviceType === "Other (specify)" && !data.serviceDetail) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["serviceDetail"],
        message: "Describe your agency type",
      });
    }
  });

export type RegisterInput = z.infer<typeof RegisterSchema>;

export const LoginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email").max(255),
  password: z.string().min(1, "Password is required").max(72, "Password must be 72 characters or fewer"),
});

export type LoginInput = z.infer<typeof LoginSchema>;

export const AuthUserSchema = z.object({
  id: z.string(),
  agencyId: z.string(),
  agencyName: z.string(),
  email: z.string(),
});

export type AuthUser = z.infer<typeof AuthUserSchema>;

export const AuthResponseSchema = z.object({
  status: z.literal("ok"),
  token: z.string(),
  user: AuthUserSchema,
});

export type AuthResponse = z.infer<typeof AuthResponseSchema>;

// Returned by GET /api/auth/me — the client's source of truth for "am I still
// signed in, and who am I?" after a page reload.
export const MeResponseSchema = z.object({
  status: z.literal("ok"),
  user: AuthUserSchema,
});

export type MeResponse = z.infer<typeof MeResponseSchema>;
