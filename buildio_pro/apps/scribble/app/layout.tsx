import type { Metadata } from "next";

import { Providers } from "@/components/providers";
import { Toaster } from "@workspace/ui/components/sonner";
import { Navbar } from "@/components/navbar";

import "./globals.css";
import { SimpleFooter } from "@workspace/ui/components/footer";

export const metadata: Metadata = {
  title: "Scribble",
  description: "Build something epic. Scribble",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="apple-mobile-web-app-title" content="Scribble" />
      </head>
      <body className="font-sans antialiased">
        <Providers>
          <Navbar />
          <main className="min-h-[(calc(100vh-20rem))]">{children}</main>
          <SimpleFooter />
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
