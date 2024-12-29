// src/app/layout.tsx
import { CartProvider } from "@/components/global/CartProvider";
import ClientNavbar from "@/components/global/ClientNavbar";
import { Toaster } from "@/components/ui/toaster";
import "@/styles/globals.css";
import { GeistSans } from "geist/font/sans";
import { type Metadata } from "next";
import { Providers } from "./providers";
import { TRPCReactProvider } from "@/trpc/react";
import { Tooltip } from "@radix-ui/react-tooltip";
import { TooltipProvider } from "@/components/ui/tooltip";

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
    <html lang="en" className={GeistSans.variable} suppressHydrationWarning>
      <Providers>
        <body>
          <ClientNavbar />
          <main className="min-h-screen">
            <TRPCReactProvider>
              <CartProvider>
                <TooltipProvider>
                  {children}
                  <Toaster />
                </TooltipProvider>
              </CartProvider>
            </TRPCReactProvider>
          </main>
        </body>
      </Providers>
    </html>
  );
}
