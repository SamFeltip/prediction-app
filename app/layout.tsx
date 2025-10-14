import type React from "react";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/auth-provider";
import { CreateMarketButton } from "@/components/create-market-button";
import { UserNav } from "@/components/user-nav";
import { TrendingUp } from "lucide-react";
import Link from "next/link";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PredictHub - Binary Prediction Markets",
  description: "Create and bet on binary prediction markets",
  generator: "v0.app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="antialiased">
        <AuthProvider>
          <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="border-b border-border bg-card">
              <div className="container mx-auto flex items-center justify-between px-4 py-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-6 w-6 text-primary" />
                  <h1 className="text-xl font-bold text-foreground">
                    <Link href="/">PredictHub</Link>
                  </h1>
                </div>
                <div className="flex items-center gap-4">
                  <CreateMarketButton />
                  <UserNav />
                </div>
              </div>
            </header>

            {/* Main Content */}
            <main className="container mx-auto px-4 py-4">{children}</main>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
