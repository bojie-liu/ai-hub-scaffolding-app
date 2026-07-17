import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";
import { AppProvider } from "@/contexts/AppProvider";
import { TokenGuard } from "@/components/TokenGuard";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI-Augmented Software Engineering",
  description: "University Lesson Plan: AI-Augmented Software Engineering & Pedagogical Integration — TPACK Framework + Peer Assessment",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AppProvider>
          <Suspense>
            <TokenGuard>{children}</TokenGuard>
          </Suspense>
        </AppProvider>
      </body>
    </html>
  );
}
