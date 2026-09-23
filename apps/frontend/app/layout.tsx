import type { Metadata } from "next";
import { Inter, Manrope } from "next/font/google";
import NextTopLoader from "nextjs-toploader";
import "./globals.css";

// Self-hosted at build time by next/font: files ship same-origin (no
// render-blocking third-party stylesheet) and the generated fallback metrics
// remove the font-swap layout shift the previous <link> tags caused.
// See docs/adr/0001-self-host-fonts-with-next-font.md.
const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-manrope",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  title: "ClientFlow Lite — Client Portal for Agencies",
  description: "Onboard clients, manage requests, and get paid from your own branded portal.",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "16x16 32x32 48x48" },
      { url: "/logo.png", sizes: "1254x1254", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
  openGraph: {
    title: "ClientFlow Lite",
    description: "White-label client portal for agencies.",
    images: ["/logo.png"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${manrope.variable} ${inter.variable}`} suppressHydrationWarning>
      <body className="antialiased">
        {/* Pre-paint `.js` flag for scroll reveals (see components/site/reveal.tsx).
            Plain inline script: executes during parsing, before hydration, so
            resting states never flash on load. */}
        <script dangerouslySetInnerHTML={{ __html: 'document.documentElement.classList.add("js")' }} />
        <NextTopLoader
          color="#6BA2D6"
          height={3}
          showSpinner={false}
          showForHashAnchor={false}
          shadow="0 0 10px #6BA2D6,0 0 5px #6BA2D6"
        />
        {children}
      </body>
    </html>
  );
}
