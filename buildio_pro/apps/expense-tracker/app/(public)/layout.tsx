import React from "react";

import { Footer } from "@/components/molecules/footer";
import Navbar from "@/components/organisms/navigation/simple-nav";

export default function Layout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <Navbar />
      <main className="min-h-[calc(100dvh-20dvh)]">{children}</main>
      <Footer />
    </>
  );
}
