// src/components/global/ClientNavbar.tsx
"use client";

import { usePathname } from "next/navigation";
import Navbar from "./Navbar";

// List of routes where navbar should not be shown
const noNavbarRoutes = ["/login", "/register", "/verify-phone"];

// Function to check if the current path is a user profile route
const isUserProfileRoute = (pathname: string) => {
  return pathname.startsWith("/account/") && pathname.includes("/");
};

export default function ClientNavbar() {
  const pathname = usePathname();

  // Check if current route should show navbar
  if (noNavbarRoutes.includes(pathname) || isUserProfileRoute(pathname)) {
    return null;
  }

  return <Navbar />;
}
