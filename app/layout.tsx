import type { Metadata } from "next";
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

// UPGRADED SEO METADATA
export const metadata: Metadata = {
  title: "Interactive 3D Product Viewer | Portfolio Showcase",
  description:
    "Experience products in real-time 3D. Built with Next.js, React Three Fiber, and Framer Motion.",
  keywords: [
    "3D Product Viewer",
    "Three.js",
    "Next.js",
    "Frontend Developer Portfolio",
    "React 3D",
  ],
  authors: [{ name: "Your Name" }],
  openGraph: {
    title: "Interactive 3D Product Viewer",
    description: "Experience premium products in stunning, interactive 3D.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Interactive 3D Product Viewer",
    description: "Experience premium products in stunning, interactive 3D.",
  },
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
