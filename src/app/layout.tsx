import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Providers from "@/components/Providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
	title: "Amamma's Kitchen - South Indian Pickles",
	description:
		"Traditional South Indian pickles made with love. Discover authentic South Indian pickles made with traditional recipes and finest ingredients.",
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en">
			<body className={inter.className}>
				<Providers>
					<Navbar />
					<main className="min-h-screen">{children}</main>
				</Providers>
			</body>
		</html>
	);
}
