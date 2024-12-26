// src/app/layout.tsx
import "@/styles/globals.css";
import { GeistSans } from "geist/font/sans";
import { type Metadata } from "next";
import { TRPCReactProvider } from "@/trpc/react";
import ClientNavbar from "@/components/global/ClientNavbar";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "Amamma's Kitchen - South Indian Pickles",
  description:
    "Traditional South Indian pickles made with love. Discover authentic South Indian pickles made with traditional recipes and finest ingredients.",
  icons: [{ rel: "icon", url: "/logo.png" }],
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
      <Providers>
        <TRPCReactProvider>
          <body>
            <ClientNavbar />
            <main className="min-h-screen">{children}</main>
          </body>
        </TRPCReactProvider>
      </Providers>
    </html>
  );
}
