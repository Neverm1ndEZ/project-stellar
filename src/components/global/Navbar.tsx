"use client";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useCart } from "@/store/cart";
import { Menu, ShoppingCart, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

// Component to visually hide elements while keeping them accessible to screen readers
const VisuallyHidden = ({ children }) => (
  <span className="absolute -m-px h-px w-px overflow-hidden whitespace-nowrap border-0 p-0">
    {children}
  </span>
);

export default function Navbar() {
  const cartItems = useCart((state) => state.items);
  const cartItemCount = cartItems.reduce(
    (total, item) => total + item.quantity,
    0,
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto px-4">
        <div className="flex h-20 items-center justify-between">
          {/* Mobile Menu with Accessible Sheet Dialog */}
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                className="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden"
                aria-label="Open navigation menu"
              >
                <Menu className="h-6 w-6 text-red-800" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 bg-white p-0">
              <SheetHeader>
                <SheetTitle className="px-6 pt-4 text-red-800">
                  Navigation Menu
                </SheetTitle>
              </SheetHeader>
              <div className="flex flex-col space-y-4 p-6">
                <SheetClose asChild>
                  <Link
                    href="/products"
                    className="flex items-center space-x-2 text-lg font-medium text-red-800 hover:text-red-600"
                  >
                    Products
                  </Link>
                </SheetClose>
                <SheetClose asChild>
                  <Link
                    href="/about"
                    className="flex items-center space-x-2 text-lg font-medium text-red-800 hover:text-red-600"
                  >
                    About
                  </Link>
                </SheetClose>
                <SheetClose asChild>
                  <Link
                    href="/contact"
                    className="flex items-center space-x-2 text-lg font-medium text-red-800 hover:text-red-600"
                  >
                    Contact
                  </Link>
                </SheetClose>
              </div>
            </SheetContent>
          </Sheet>

          {/* Logo and Brand */}
          <Link
            href="/"
            className="flex items-center space-x-2"
            aria-label="Amma's Kitchen - Return to homepage"
          >
            <Image
              src="/logo.png"
              alt="Amma's Kitchen Logo"
              width={50}
              height={50}
              className="h-12 w-auto"
            />
            <div className="flex flex-col">
              <span className="text-xl font-bold text-red-800">
                Amamma&apos;s Kitchen
              </span>
              <span className="text-xs text-green-700">South India Pickle</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav
            className="hidden items-center space-x-8 md:flex"
            aria-label="Main navigation"
          >
            <Link
              href="/products"
              className="text-base font-medium text-red-800 decoration-2 underline-offset-4 transition-colors hover:text-red-600 hover:underline"
            >
              Products
            </Link>
            <Link
              href="/about"
              className="text-base font-medium text-red-800 decoration-2 underline-offset-4 transition-colors hover:text-red-600 hover:underline"
            >
              About
            </Link>
            <Link
              href="/contact"
              className="text-base font-medium text-red-800 decoration-2 underline-offset-4 transition-colors hover:text-red-600 hover:underline"
            >
              Contact
            </Link>
          </nav>

          {/* Cart and User Actions */}
          <div className="flex items-center space-x-4">
            <Link href="/cart">
              <Button
                variant="ghost"
                size="icon"
                className="relative hover:bg-red-50"
                aria-label={`Shopping cart with ${cartItemCount} items`}
              >
                <ShoppingCart className="h-5 w-5 text-red-800" />
                {cartItemCount > 0 && (
                  <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-green-600 text-xs text-white">
                    {cartItemCount}
                  </span>
                )}
              </Button>
            </Link>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="hover:bg-red-50"
                  aria-label="User account menu"
                >
                  <User className="h-5 w-5 text-red-800" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 bg-white">
                <DropdownMenuLabel className="text-red-800">
                  Account Options
                </DropdownMenuLabel>
                <DropdownMenuItem asChild>
                  <Link
                    href="/login"
                    className="flex w-full items-center text-red-800 hover:text-red-600"
                  >
                    Login
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link
                    href="/register"
                    className="flex w-full items-center text-red-800 hover:text-red-600"
                  >
                    Register
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}
