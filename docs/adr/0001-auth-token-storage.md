# 0001 — Stateless JWT in the Authorization header, stored client-side in Web Storage

Status: accepted (2026-09)

## Context

The portal needs authenticated access to backend data. The frontend (Vercel, Next.js) and backend
(Railway, Express) are deployed as separate origins, which the browser treats as cross-site. The
login flow already issued a JWT and stored a token in the browser, but nothing read it back: no
`Authorization` header was ever sent and `/dashboard`, `/requests`, `/invoices` rendered for
signed-out visitors.

We had to choose how the session travels on every request and where the browser keeps it.

## Decision

The backend issues a 7-day HS256 JWT (`sub`, `agencyId`). The frontend keeps it in Web Storage and
sends it on every request as `Authorization: Bearer <token>`. `GET /api/auth/me` re-reads the user
from the database and is the client's source of truth; a 401 from it clears the stored token and
bounces the visitor to `/login`. Storage location depends on the "Remember me" checkbox:
`localStorage` when checked, `sessionStorage` otherwise — never both.

Protected routes use `requireAuth` (`apps/backend/src/middleware/auth.ts`). The portal's
`<RequireAuth>` guard is a navigation gate only; every data endpoint must authorize on the server.

## Consequences

- No server-side session store, so any backend instance can verify any request — nothing to share
  between replicas, and no session table to garbage-collect.
- A token lives until it expires; deleting a user does not revoke existing tokens. `/me` closes the
  practical gap for the portal (it re-checks the database), but any *new* protected endpoint must do
  the same rather than trusting claims alone.
- XSS becomes token theft: `localStorage` is readable by any script on the origin. Mitigated by
  React's default escaping, no `dangerouslySetInnerHTML` in the portal, and a short expiry; not
  eliminated.
- Logout is client-side only — it discards the token, it does not invalidate it. Adding a
  token-version column to `User` would make revocation real without a session store.

## Alternatives rejected

**httpOnly cookie with `SameSite=Strict`.** Strongest XSS posture, but the apps sit on different
origins: a cross-site cookie needs `SameSite=None; Secure`, which current Safari and Chrome
third-party-cookie policies restrict, and it reopens CSRF (needing a double-submit token on every
mutating route). More moving parts to defend, and the failure mode is a silent inability to sign in.

**httpOnly cookie with a same-site frontend proxy (`/api/*` rewritten to the backend).** Would allow
`SameSite=Strict` and hide the token from JavaScript. Rejected for now because it puts every API call
through the Next.js runtime, adding a hop, a timeout budget, and a second place to get caching and
auth wrong. Worth revisiting if the two apps move to sibling subdomains — at that point the cookie
becomes same-site and this objection disappears.

**Opaque session IDs in Redis.** Enables instant revocation and sliding expiry, at the cost of
running and paying for another stateful dependency before there is a single paying tenant.
