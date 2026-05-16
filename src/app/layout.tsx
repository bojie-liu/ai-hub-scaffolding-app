import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";
import { AppProvider } from "@/contexts/AppProvider";
import { ScrollRootProvider } from "@/contexts/ScrollRootContext";
import { TokenInitializer } from "@/components/TokenInitializer";
import Navbar from "@/components/common/Navbar";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI in Software Engineering - Lesson Plan",
  description: "Interactive lesson plan for modern software development with AI-enhanced workflows",
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
          <ScrollRootProvider>
            <Suspense>
              <TokenInitializer />
            </Suspense>
            <Navbar />
            {children}
          </ScrollRootProvider>
          <Toaster />
        </AppProvider>
      </body>
    </html>
  );
}
