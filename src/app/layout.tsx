import "@/styles/globals.css";

import { GeistSans } from "geist/font/sans";
import { type Metadata } from "next";

import { TRPCReactProvider } from "@/trpc/react";
import Navbar from "@/components/global/Navbar";

export const metadata: Metadata = {
  title: "Amamma's Kitchen - South Indian Pickles",
  description:
    "Traditional South Indian pickles made with love. Discover authentic South Indian pickles made with traditional recipes and finest ingredients.",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${GeistSans.variable}`}
      suppressHydrationWarning
    >
      <body className="bg-[#242424]">
        <TRPCReactProvider>
          <Navbar />
          <main className="min-h-screen">{children}</main>
        </TRPCReactProvider>
      </body>
    </html>
  );
}
