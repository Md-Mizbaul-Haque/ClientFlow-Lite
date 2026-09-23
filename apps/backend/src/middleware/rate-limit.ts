import { rateLimit } from "express-rate-limit";

// Brute-force guard: 10 logins per 10 minutes per IP is generous for humans,
// useless for password spraying. Counts only failed logins below.
export const loginLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  // Successful logins reset the count — only failures burn budget.
  skipSuccessfulRequests: true,
  message: { status: "error", message: "Too many login attempts. Please try again in a few minutes." },
});

// Registration spam guard: 20 accounts per hour per IP.
export const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 20,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { status: "error", message: "Too many accounts created. Please try again later." },
});

// Refresh token brute-force guard: 30 requests per 15 minutes per IP.
export const refreshLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { status: "error", message: "Too many refresh attempts. Please try again later." },
});

// Authenticated write guard: 100 requests per 15 minutes per IP. Covers
// agency profile writes and logo URL minting — without it one authed
// client could loop presigned-URL minting into an S3 cost vector.
export const authedWriteLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { status: "error", message: "Too many requests. Please try again later." },
});
