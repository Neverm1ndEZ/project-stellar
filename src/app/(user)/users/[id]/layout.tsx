// app/(user)/users/[id]/layout.tsx
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

interface UserLayoutProps {
  children: ReactNode;
  params: {
    id: string;
  };
}

// Separate navigation items into categories for better organization
const mainNavigationItems = [
  { name: "Home", href: "/", icon: Home },
  { name: "Products", href: "/products", icon: Store },
  { name: "Cart", href: "/cart", icon: ShoppingCart },
];

const accountNavigationItems = [
  { name: "Profile", href: "profile", icon: User },
  { name: "Orders", href: "orders", icon: Package },
  { name: "Wishlist", href: "wishlist", icon: Heart },
  { name: "Addresses", href: "addresses", icon: MapPin },
  { name: "Payments", href: "payments", icon: CreditCard },
  { name: "Subscriptions", href: "subscriptions", icon: Layers },
  { name: "Incidents", href: "incidents", icon: Bell },
];

export default async function UserLayout({
  children,
  params,
}: UserLayoutProps) {
  const session = await auth();

  // If not logged in, redirect to login
  if (!session) {
    redirect("/login");
  }

  // If trying to access different user's profile
  if (session.user.id !== params.id) {
    redirect("/");
  }

  // Helper function to determine if a link should use the user's ID in the path
  const getHref = (item: { href: string }) => {
    // If the href starts with /, it's an absolute path
    return item.href.startsWith("/")
      ? item.href
      : `/users/${params.id}/${item.href}`;
  };

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
                  <Link key={item.href} href={getHref(item)}>
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
