import type { Metadata, Viewport } from "next";
import { Fraunces, Montserrat } from "next/font/google";
import { Toaster } from "sonner";
import { SITE_IMAGES } from "@/lib/site-images";
import { getSiteUrl } from "@/lib/site-url";
import "./globals.css";

const display = Fraunces({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-fraunces",
  display: "swap",
});

const sans = Montserrat({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-montserrat",
  display: "swap",
});

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Manuella Sole Footwear — Step Into Your Style",
    template: "%s | Manuella Sole Footwear",
  },
  description:
    "Discover premium footwear for men and women. Considered silhouettes, refined materials and personal service. Order directly on WhatsApp.",
  keywords: [
    "footwear Ghana",
    "shoes Accra",
    "women's heels",
    "men's shoes",
    "leather boots",
    "loafers",
    "formal shoes",
    "Manuella Sole",
  ],
  openGraph: {
    type: "website",
    locale: "en_GH",
    siteName: "Manuella Sole Footwear",
    title: "Manuella Sole Footwear — Step Into Your Style",
    description:
      "Premium footwear for men and women. Explore the collection and order directly on WhatsApp.",
    url: siteUrl,
    images: [{ url: SITE_IMAGES.og, width: 1200, height: 630, alt: "Manuella Sole Footwear" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Manuella Sole Footwear — Step Into Your Style",
    description: "Premium footwear for men and women, ordered directly on WhatsApp.",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#faf6ee",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable}`} data-scroll-behavior="smooth">
      <body className="min-h-screen antialiased">
        {children}
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: "#121916",
              color: "#faf6ee",
              border: "1px solid rgba(200, 163, 95, 0.35)",
              borderRadius: "10px",
              boxShadow: "0 16px 40px -12px rgba(0, 0, 0, 0.45)",
              fontSize: "13px",
            },
          }}
        />
      </body>
    </html>
  );
}
