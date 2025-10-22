import type { Metadata } from "next";

import { Providers } from "@/components/providers";

import "@workspace/ui/globals.css";

export const metadata: Metadata = {
  title: "Buildio.pro",
  description: "Build something epic. Buildio.pro",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="apple-mobile-web-app-title" content="buildio.pro" />
      </head>
      <body
        className={`${fontSans.variable} ${fontMono.variable} font-sans antialiased `}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
