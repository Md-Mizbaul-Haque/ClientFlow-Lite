import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "../../packages/ui/src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#005EB8",
          hover: "#004A94",
          light: "#6BA2D6",
          soft: "#E6EFF8",
          softer: "#F3F9FF",
          deep: "#2B79C4",
        },
        neutral: {
          50: "#FAFAFA",
          100: "#F8F8F8",
          200: "#F1F2F4",
          300: "#E9EAEC",
          400: "#CBD5E0",
          500: "#A0AEC0",
          600: "#687588",
          700: "#66768E",
          800: "#323B49",
          900: "#111827",
        },
        error: { DEFAULT: "#B12330", light: "#E03137" },
        success: { DEFAULT: "#0FAA72", deep: "#037F56" },
        border: { DEFAULT: "#E9EAEC", light: "#F1F2F4", strong: "#CBD5E0" },
      },
      fontFamily: {
        sans: ["Manrope", "Inter", "system-ui", "sans-serif"],
      },
      borderRadius: {
        sm: "6px",
        DEFAULT: "8px",
        md: "10px",
        lg: "12px",
        xl: "16px",
        "2xl": "20px",
      },
      boxShadow: {
        xs: "0 1px 2px rgba(16,24,40,0.05)",
        sm: "0 1px 3px rgba(16,24,40,0.1), 0 1px 2px rgba(16,24,40,0.06)",
        lg: "0 10px 15px rgba(16,24,40,0.1), 0 4px 6px rgba(16,24,40,0.05)",
      },
      maxWidth: {
        form: "480px",
        content: "720px",
      },
    },
  },
};

export default config;
