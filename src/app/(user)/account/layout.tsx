// app/(user)/account/layout.tsx
import { Button } from "@/components/ui/button";
import { auth } from "@/server/auth";
import {
  Bell,
  CreditCard,
  Heart,
  Home,
  Layers,
  MapPin,
  Package,
  ShoppingBag,
  ShoppingCart,
  Store,
  User,
} from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { type ReactNode } from "react";

interface AccountLayoutProps {
  children: ReactNode;
}

// Navigation items for better organization
const mainNavigationItems = [
  { name: "Home", href: "/", icon: Home },
  { name: "Products", href: "/products", icon: Store },
  { name: "Cart", href: "/cart", icon: ShoppingCart },
];

const accountNavigationItems = [
  { name: "Profile", href: "/account/profile", icon: User },
  { name: "Orders", href: "/account/orders", icon: Package },
  { name: "Wishlist", href: "/account/wishlist", icon: Heart },
  { name: "Addresses", href: "/account/addresses", icon: MapPin },
  { name: "Payments", href: "/account/payments", icon: CreditCard },
  { name: "Subscriptions", href: "/account/subscriptions", icon: Layers },
  { name: "Incidents", href: "/account/incidents", icon: Bell },
];

export default async function AccountLayout({ children }: AccountLayoutProps) {
  const session = await auth();

  // Protect all account routes
  if (!session?.user) {
    redirect("/login?from=/account");
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar Navigation */}
      <aside className="fixed left-0 top-0 z-30 h-screen w-64 border-r border-gray-200 bg-white">
        {/* Logo/Brand Section */}
        <div className="border-b border-gray-200 p-4">
          <Link href="/" className="flex items-center space-x-2">
            <ShoppingBag className="h-6 w-6 text-red-600" />
            <span className="text-lg font-bold text-red-800">
              Amamma&apos;s Kitchen
            </span>
          </Link>
        </div>

        <div className="space-y-6 p-4">
          {/* Main Navigation Section */}
          <div>
            <h2 className="mb-2 px-2 text-sm font-semibold text-gray-500">
              Main Navigation
            </h2>
            <nav className="space-y-1">
              {mainNavigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link key={item.href} href={item.href}>
                    <Button
                      variant="ghost"
                      className="w-full justify-start hover:bg-red-50 hover:text-red-600"
                    >
                      <Icon className="mr-2 h-4 w-4" />
                      {item.name}
                    </Button>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Account Management Section */}
          <div>
            <h2 className="mb-2 px-2 text-sm font-semibold text-gray-500">
              Account Management
            </h2>
            <nav className="space-y-1">
              {accountNavigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link key={item.href} href={item.href}>
                    <Button
                      variant="ghost"
                      className="w-full justify-start hover:bg-red-50 hover:text-red-600"
                    >
                      <Icon className="mr-2 h-4 w-4" />
                      {item.name}
                    </Button>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="ml-64 flex-1 p-8">
        <main className="mx-auto max-w-4xl">{children}</main>
      </div>
    </div>
  );
}
