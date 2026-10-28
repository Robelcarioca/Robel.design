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

export const metadata: Metadata = {
  title: "design robel — Designer & Web Developer",
  description: "Graphic design, UI/UX, web development, presentations and event production by design robel.",
  icons: {
    icon: "/brand/robel.jpg",
    shortcut: "/brand/robel.jpg",
    apple: "/brand/robel.jpg",
  },
  openGraph: {
    title: "design robel — Designer & Web Developer",
    description: "Graphic design, UI/UX, web development, presentations and event production by design robel.",
    type: "website",
    url: "https://instagram.com/robelcario",
    images: [{ url: "/brand/robel.jpg" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "design robel — Designer & Web Developer",
    description: "Graphic design, UI/UX, web development, presentations and event production by design robel.",
    creator: "@Robelcario",
    images: ["/brand/robel.jpg"],
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
