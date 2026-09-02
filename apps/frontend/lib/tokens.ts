/**
 * Design Tokens — Client Portal (Community) Figma
 * Source: https://www.figma.com/design/JOvro48pHVwL7FEeOW6i3r/Client-Portal--Community-
 * Extracted: fills, text styles, grids, effects from Figma API (185 styles, 4051 text nodes)
 * Keep this file as the single source of truth — Tailwind and CSS variables are derived from here.
 */

export const colors = {
  // Primary (blue) — dominant in Figma (005EB8 x951, 2B79C4 x193, 6BA2D6 x117, E5ECF6 x89, F3F9FF x98)
  primary: {
    DEFAULT: "#005EB8",
    hover: "#004A94",
    light: "#6BA2D6",
    soft: "#E5ECF6",
    softer: "#F3F9FF",
    deep: "#2B79C4",
  },
  // Neutrals / Greys — from fills (FFFFFF 3306, 323B49 2423, F1F2F4 1173, A0AEC0 1172, CBD5E0 944, E9EAEC 266, F8F8F8 201)
  neutral: {
    white: "#FFFFFF",
    50: "#F8F8F8",
    100: "#F1F2F4",
    200: "#E9EAEC",
    300: "#CBD5E0",
    400: "#A0AEC0",
    500: "#687588",
    600: "#66768E",
    700: "#323B49",
    800: "#212B36",
    900: "#111827",
    black: "#000000",
  },
  // Text
  text: {
    primary: "#111827",
    secondary: "#687588",
    tertiary: "#66768E",
    inverse: "#FFFFFF",
  },
  // Semantic
  error: {
    DEFAULT: "#B12330",
    light: "#E03137",
    soft: "#FEE2E2",
  },
  success: {
    DEFAULT: "#0FAA72",
    deep: "#037F56",
  },
  // Borders / dividers
  border: {
    DEFAULT: "#E9EAEC",
    light: "#F1F2F4",
    strong: "#CBD5E0",
  },
  // Backgrounds
  bg: {
    page: "#FFFFFF",
    subtle: "#FAFAFA",
    input: "#F8F8F8",
  },
} as const;

export const typography = {
  fontFamily: {
    sans: ["Manrope", "Inter", "system-ui", "sans-serif"],
    display: ["Manrope", "sans-serif"],
  },
  // From 4051 text nodes: Manrope 500 14px (1106), 500 12px (530), 400 14px (341), 700 18px (81), 700 20px (45)
  // line-height % from Figma: 117.13% ≈ 1.17, 100% = 1, 109.8% ≈ 1.1
  sizes: {
    xs: "12px",
    sm: "14px",
    base: "16px",
    lg: "18px",
    xl: "20px",
  },
  weights: {
    regular: "400",
    medium: "500",
    semibold: "600",
    bold: "700",
  },
  lineHeight: {
    tight: "1.0",
    normal: "1.17",
    relaxed: "1.46",
  },
} as const;

export const spacing = {
  // Figma uses 8pt-ish: field 480x88, input 480x56, button 480x56, divider 183x1, onboarding 720x1024
  // Tailwind default (4px) maps well — use 4, 8, 12, 16, 24, 32
  radius: {
    sm: "6px",
    DEFAULT: "8px",
    md: "12px",
    lg: "16px",
    full: "9999px",
  },
  shadow: {
    xs: "0 1px 2px rgba(16,24,40,0.05)",
    sm: "0 1px 3px rgba(16,24,40,0.1), 0 1px 2px rgba(16,24,40,0.06)",
    lg: "0 10px 15px rgba(16,24,40,0.1), 0 4px 6px rgba(16,24,40,0.05)",
  },
  container: {
    max: "1440px",
    form: "480px",
    content: "720px",
  },
  grid: {
    desktop: "12 columns @ 1440px",
    tablet: "12 columns @ 1024px / 6 @ 768px",
    mobile: "4 columns @ 375px",
  },
} as const;

export const layout = {
  // Main auth layout: 1440x1024 split 720+720 (Onboarding | Sign in)
  // Inside sign-in: Content 480x702 centered in 720, form 480x358, field 480x88, input 480x56
  auth: {
    split: "720px + 720px",
    contentWidth: "480px",
    inputHeight: "56px",
    buttonHeight: "56px",
    fieldGap: "22px",
  },
} as const;
