import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import React from "react";

export default function Layout({ children }: { children: React.ReactNode }) {
	return (
		<>
			<Navbar />
			{children}
			<Footer />
		</>
	);
}
