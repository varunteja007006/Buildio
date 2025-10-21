import "./globals.css";

import type { Metadata } from "next";

import { Providers } from "@/components/providers";

import { Footer } from "@/components/footer";
import { Toaster } from "@workspace/ui/components/sonner";
import { Navbar } from "@/components/navbar";

export const metadata: Metadata = {
  title: "Poker Planner",
  description: "Build something epic. Poker Planner",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="apple-mobile-web-app-title" content="Poker Planner" />
      </head>
      <body className={`font-sans antialiased`}>
        <Providers>
          <Navbar />
          <main className="min-h-screen">{children}</main>
          <Footer />
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
