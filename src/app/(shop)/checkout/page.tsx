// src/app/(shop)/checkout/page.tsx
import { redirect } from "next/navigation";
import { CheckoutClient } from "./_components/CheckoutClient";
import { api } from "@/trpc/server";

export default async function CheckoutPage() {
  // Fetch addresses server-side to avoid client waterfall
  const addresses = await api.address.getUserAddresses();

  return <CheckoutClient initialAddresses={addresses} />;
}
