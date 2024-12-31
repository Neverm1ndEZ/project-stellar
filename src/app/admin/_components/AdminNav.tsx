// src/app/admin/_components/AdminNav.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Package,
  Users,
  Settings,
  ChevronDown,
  Menu,
  X,
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const navigation = [
  {
    name: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    name: "Products",
    href: "/admin/products",
    icon: Package,
    children: [
      { name: "All Products", href: "/admin/products" },
      { name: "Add New", href: "/admin/products/new" },
      { name: "Categories", href: "/admin/products/categories" },
    ],
  },
  {
    name: "Users",
    href: "/admin/users",
    icon: Users,
  },
  {
    name: "Settings",
    href: "/admin/settings",
    icon: Settings,
  },
];

export function AdminNav() {
  const [openMobile, setOpenMobile] = useState(false);
  const [openItems, setOpenItems] = useState<string[]>([]);
  const pathname = usePathname();

  const toggleItem = (name: string) => {
    setOpenItems((prev) =>
      prev.includes(name)
        ? prev.filter((item) => item !== name)
        : [...prev, name],
    );
  };

  const NavItem = ({
    item,
    mobile = false,
  }: {
    item: (typeof navigation)[0];
    mobile?: boolean;
  }) => {
    const active = pathname === item.href;
    const hasChildren = item.children?.length;
    const isOpen = openItems.includes(item.name);

    return (
      <div>
        <div
          className={cn(
            "group flex items-center gap-x-3 rounded-md px-3 py-2 text-sm font-medium",
            active
              ? "text-brand-600 bg-gray-50"
              : "hover:text-brand-600 text-gray-700 hover:bg-gray-50",
            mobile ? "w-full" : "",
          )}
          role="button"
          onClick={() => hasChildren && toggleItem(item.name)}
        >
          <item.icon
            className={cn(
              "h-5 w-5 shrink-0",
              active
                ? "text-brand-600"
                : "group-hover:text-brand-600 text-gray-400",
            )}
          />
          <span className="flex-1">{item.name}</span>
          {hasChildren && (
            <ChevronDown
              className={cn(
                "h-4 w-4 text-gray-400 transition-transform",
                isOpen && "rotate-180",
              )}
            />
          )}
        </div>

        {hasChildren && isOpen && (
          <div className="ml-8 mt-1 space-y-1">
            {item?.children?.map((child) => (
              <Link
                key={child.href}
                href={child.href}
                className={cn(
                  "block rounded-md px-3 py-2 text-sm font-medium",
                  pathname === child.href
                    ? "text-brand-600 bg-gray-50"
                    : "hover:text-brand-600 text-gray-700 hover:bg-gray-50",
                )}
              >
                {child.name}
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Desktop Navigation
  const DesktopNav = () => (
    <nav className="hidden space-y-1 md:block">
      {navigation.map((item) => (
        <NavItem key={item.name} item={item} />
      ))}
    </nav>
  );

  // Mobile Navigation
  const MobileNav = () => (
    <Sheet open={openMobile} onOpenChange={setOpenMobile}>
      <SheetTrigger asChild>
        <Button variant="ghost" className="md:hidden" size="icon">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Open navigation menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72">
        <nav className="space-y-1">
          {navigation.map((item) => (
            <NavItem key={item.name} item={item} mobile />
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  );

  return (
    <>
      <MobileNav />
      <DesktopNav />
    </>
  );
}
