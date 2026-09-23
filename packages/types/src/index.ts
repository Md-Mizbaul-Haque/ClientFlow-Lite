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

// Auth — signup takes account info only; the agency profile is collected
// later in onboarding and saved via UpdateAgencySchema.

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
  serviceType: ServiceTypeSchema.optional(),
  serviceDetail: z.string().trim().max(100).optional(),
  teamSize: TeamSizeSchema.optional(),
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

export const UpdateAgencySchema = z
  .object({
    website: z.string().trim().max(255).optional(),
    serviceType: ServiceTypeSchema.optional(),
    serviceDetail: z.string().trim().max(100).optional(),
    teamSize: TeamSizeSchema.optional(),
    logoKey: z.string().trim().min(1).max(500).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.serviceType === "Other (specify)" && !data.serviceDetail) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["serviceDetail"],
        message: "Describe your agency type",
      });
    }
  });

export type UpdateAgencyInput = z.infer<typeof UpdateAgencySchema>;

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
  accessToken: z.string(),
  user: AuthUserSchema,
});

export type AuthResponse = z.infer<typeof AuthResponseSchema>;

// Returned by POST /api/auth/refresh
export const RefreshResponseSchema = z.object({
  status: z.literal("ok"),
  accessToken: z.string(),
});

export type RefreshResponse = z.infer<typeof RefreshResponseSchema>;

// Returned by POST /api/auth/logout
export const LogoutResponseSchema = z.object({
  status: z.literal("ok"),
});

export type LogoutResponse = z.infer<typeof LogoutResponseSchema>;

// Returned by GET /api/auth/me — the client's source of truth for "am I still
// signed in, and who am I?" after a page reload.
export const MeResponseSchema = z.object({
  status: z.literal("ok"),
  user: AuthUserSchema,
});

export type MeResponse = z.infer<typeof MeResponseSchema>;

// Search — POST /api/search
export const SearchResultSchema = z.object({
  type: z.enum(["request", "client", "invoice"]),
  id: z.string(),
  title: z.string(),
  subtitle: z.string(),
  url: z.string(),
});

export type SearchResult = z.infer<typeof SearchResultSchema>;

export const SearchResponseSchema = z.object({
  results: z.array(SearchResultSchema),
});

type SearchResponse = z.infer<typeof SearchResponseSchema>;

// Notifications — GET /api/notifications, PATCH /api/notifications/read
export const NotificationSchema = z.object({
  id: z.string(),
  type: z.enum(["info", "warning", "success", "error"]),
  title: z.string(),
  body: z.string(),
  link: z.string().optional(),
  read: z.boolean(),
  createdAt: z.string(),
});

export type Notification = z.infer<typeof NotificationSchema>;

export const NotificationsListSchema = z.object({
  notifications: z.array(NotificationSchema),
  unreadCount: z.number(),
  nextCursor: z.string().nullable(),
});

export type NotificationsList = z.infer<typeof NotificationsListSchema>;


