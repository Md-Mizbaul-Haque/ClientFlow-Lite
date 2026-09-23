# 0001. Self-host fonts with next/font instead of a Google Fonts <link>

Date: 2026-09-14
Status: Accepted

## Context

The root layout loaded Manrope and Inter from a third-party Google Fonts
stylesheet in `<head>`. That was chosen so CSS compilation never depended on a
network fetch, but it carried three costs on the marketing surface: a
render-blocking cross-origin stylesheet plus DNS/TLS handshake on the critical
path, no build-time subsetting, and a font swap with no metrics-matched
fallback — which produced visible layout shift as the fallback was replaced.

## Decision

Load both families through `next/font/google`, expose them as `--font-manrope`
and `--font-inter` on `<html>`, and consume them through the Tailwind
`--font-sans` token. `next/font` downloads and self-hosts the files at build
time, emits size-adjusted fallback metrics, and inlines the `@font-face` rules,
so nothing is fetched from a third party at runtime.

## Consequences

- No render-blocking third-party request; fonts are served same-origin and cached.
- Fallback metrics match the real faces, so the font swap no longer shifts layout.
- Builds now require network access to fetch the font files. This is the one
  regression: CI and local builds must not run fully offline.
- `--font-sans` must reference the generated CSS variables rather than the
  literal family names, because `next/font` hashes them.

## Alternatives rejected

- Keep the `<link>` tag: fails the critical-path and layout-shift requirements.
- `next/font/local` with committed `.woff2` binaries: identical runtime benefits
  and no build-time network dependency, but it stores font binaries in git and
  requires manual subsetting. Revisit if offline builds become a requirement.
