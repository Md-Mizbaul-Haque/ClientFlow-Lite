import type { Metadata } from "next";
import NextTopLoader from "nextjs-toploader";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  title: "ClientFlow Lite — Client Portal for Agencies",
  description: "Onboard clients, manage requests, and get paid — from your own branded portal.",
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
    <html lang="en">
      <body className="antialiased">
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
