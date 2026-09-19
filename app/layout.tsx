import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000");

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Interactive 3D Product Viewer | Portfolio Showcase",
  description:
    "Explore products in real-time 3D — drag to rotate, switch between models, and add to cart. Built with Next.js, Three.js, DRACO-compressed GLB assets, and Framer Motion.",
  keywords: [
    "3D Product Viewer",
    "Three.js",
    "GLB",
    "DRACO",
    "Next.js",
    "React",
    "WebGL",
    "Frontend Developer Portfolio",
  ],
  authors: [{ name: "Bello Muhammed", url: "https://bello-muhammed.vercel.app/" }],
  creator: "Bello Muhammed",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Interactive 3D Product Viewer",
    description:
      "Real-time WebGL product viewing with DRACO-compressed GLB models, built on Next.js and Three.js.",
    type: "website",
    locale: "en_US",
    siteName: "3D Product Showcase",
  },
  twitter: {
    card: "summary_large_image",
    title: "Interactive 3D Product Viewer",
    description:
      "Real-time WebGL product viewing with DRACO-compressed GLB models, built on Next.js and Three.js.",
  },
};

export const viewport: Viewport = {
  themeColor: "#4f46e5",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased overflow-x-hidden`}
      >
        {children}
      </body>
    </html>
  );
}