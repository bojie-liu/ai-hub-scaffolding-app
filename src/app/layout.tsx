import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";
import { AppProvider } from "@/contexts/AppProvider";
import { ScrollRootProvider } from "@/contexts/ScrollRootContext";
import { TokenInitializer } from "@/components/TokenInitializer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Constructivism Lesson Plan",
  description: "3-Hour Lesson Plan: Cognitive and Social Constructivism Theory - Introduction to Educational Psychology",
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
            {children}
          </ScrollRootProvider>
        </AppProvider>
      </body>
    </html>
  );
}
