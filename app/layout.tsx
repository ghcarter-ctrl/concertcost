import type { Metadata } from "next";
import { Fraunces, Outfit } from "next/font/google";
import { ThemeInitScript } from "@/components/ThemeSelector";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Concert Cost Tracker",
  description: "Track concert spending and fun — see which shows were worth every dollar.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${outfit.variable} ${fraunces.variable} h-full`}>
      <head>
        <ThemeInitScript />
      </head>
      <body className="min-h-full antialiased">{children}</body>
    </html>
  );
}
