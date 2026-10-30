import type { Metadata } from "next";
import { Inter } from "next/font/google";

import "../index.css";
import Providers from "@/components/providers";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://robel-design-21sv.vercel.app");

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "design robel — Designer & Web Developer",
  description: "Graphic design, UI/UX, web development, presentations and event production by design robel.",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    title: "design robel — Designer & Web Developer",
    description: "Graphic design, UI/UX, web development, presentations and event production by design robel.",
    type: "website",
    url: SITE_URL,
    siteName: "design robel",
    images: [
      {
        url: "https://pyomtbydcmylvtivtfxz.supabase.co/storage/v1/object/public/uploads/works/Nike/nike_05_landscape.jpg",
        width: 1200,
        height: 630,
        alt: "design robel — Featured Works & Projects",
        type: "image/jpeg",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "design robel — Designer & Web Developer",
    description: "Graphic design, UI/UX, web development, presentations and event production by design robel.",
    creator: "@design_robel",
    images: [
      "https://pyomtbydcmylvtivtfxz.supabase.co/storage/v1/object/public/uploads/works/Nike/nike_05_landscape.jpg",
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <body
        className={`${inter.variable} font-sans antialiased bg-[#EBEBEB] text-[#161616] min-h-screen`}
      >
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
