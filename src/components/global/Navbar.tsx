"use client";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
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
import { toast } from "@/hooks/use-toast";
import { useCart } from "@/store/cart";
import {
  Bell,
  CreditCard,
  Heart,
  Layers,
  LogOut,
  MapPin,
  Menu,
  Package,
  ShoppingCart,
  User,
} from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";

// Main navigation items that are shown to all users
const navigationItems = [
  { name: "Products", href: "/products" },
  { name: "Categories", href: "/categories" },
  { name: "Bulk Order", href: "/bulk-order" },
  { name: "Gifting", href: "/gifting" },
  { name: "Suggest Products", href: "/suggestions" },
];

// Define the type for menu items to ensure consistency
interface UserMenuItem {
  name: string;
  href: string;
  icon: React.ElementType;
  description: string;
}

export default function Navbar() {
  // Get authentication state and cart data
  const { data: session } = useSession();
  const cartItems = useCart((state) => state.items);
  const cartItemCount = cartItems.reduce(
    (total, item) => total + item.quantity,
    0,
  );

  // // Function to generate user-specific URLs by replacing the userId parameter
  // const getUserSpecificUrl = (baseRoute: string) => {
  //   if (!session?.user?.id) return "/login";
  //   return baseRoute.replace("[userId]", session.user.id);
  // };

  // User menu items with dynamic routes
  const userMenuItems: UserMenuItem[] = [
    {
      name: "Profile",
      href: "/account/profile", // Changed from /users/[userId]/profile
      icon: User,
      description: "View and edit your profile",
    },
    {
      name: "Orders",
      href: "/account/orders", // Changed from /users/[userId]/orders
      icon: Package,
      description: "Track your orders",
    },
    {
      name: "Wishlist",
      href: "/account/wishlist", // Changed from /users/[userId]/wishlist
      icon: Heart,
      description: "View saved items",
    },
    {
      name: "Addresses",
      href: "/account/addresses", // Changed from /users/[userId]/addresses
      icon: MapPin,
      description: "Manage delivery addresses",
    },
    {
      name: "Payment Methods",
      href: "/account/payments", // Changed from /users/[userId]/payments
      icon: CreditCard,
      description: "Manage payment options",
    },
    {
      name: "Subscriptions",
      href: "/account/subscriptions", // Changed from /users/[userId]/subscriptions
      icon: Layers,
      description: "Manage subscriptions",
    },
    {
      name: "Incidents",
      href: "/account/incidents", // Changed from /users/[userId]/incidents
      icon: Bell,
      description: "View reported issues",
    },
  ];

  // Reusable component for rendering menu items consistently
  // Modify the UserMenuItem component to better handle desktop styling
  const UserMenuItem = ({
    item,
    mobile = false,
  }: {
    item: UserMenuItem;
    mobile?: boolean;
  }) => {
    const href = item.href;

    // Base classes for both mobile and desktop
    const baseClasses = "flex items-center text-red-800 hover:text-red-600";

    // Mobile-specific classes
    const mobileClasses =
      "space-x-2 rounded-lg p-3 text-base font-medium transition-colors hover:bg-red-50/50 w-full";

    // Desktop-specific classes (made more consistent with mobile)
    const desktopClasses =
      "space-x-2 rounded-lg p-2 text-sm font-medium transition-colors hover:bg-red-50/50 w-full";

    const content = (
      <>
        <item.icon className={mobile ? "h-5 w-5" : "h-4 w-4"} />
        <span className="ml-2">{item.name}</span>
      </>
    );

    if (mobile) {
      return (
        <SheetClose asChild>
          <Link href={href} className={`${baseClasses} ${mobileClasses}`}>
            {content}
          </Link>
        </SheetClose>
      );
    }

    return (
      <Link href={href} className={`${baseClasses} ${desktopClasses}`}>
        {content}
      </Link>
    );
  };
  return (
    <header className="sticky top-0 z-50 w-full border-b border-red-100 bg-white/60 backdrop-blur-md backdrop-saturate-150 supports-[backdrop-filter]:bg-white/40">
      <div className="container mx-auto px-4">
        <div className="flex h-20 items-center justify-between">
          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                className="mr-2 px-0 text-base hover:bg-red-50/50 focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden"
                aria-label="Open navigation menu"
              >
                <Menu className="h-6 w-6 text-red-800" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="left"
              className="w-80 border-r border-red-100 bg-white/95 backdrop-blur-md backdrop-saturate-150"
            >
              <SheetHeader className="border-b border-red-100 pb-4">
                <SheetTitle className="text-red-800">
                  <Link href="/" className="flex items-center space-x-2">
                    <Image
                      src="/logo.png"
                      alt="Logo"
                      width={40}
                      height={40}
                      className="h-10 w-auto"
                      priority
                    />
                    <span className="text-lg font-bold">
                      Amamma&apos;s Kitchen
                    </span>
                  </Link>
                </SheetTitle>
              </SheetHeader>

              <div className="mt-4 flex flex-col space-y-1">
                {/* Main Navigation Items */}
                {navigationItems.map((item) => (
                  <SheetClose asChild key={item.href}>
                    <Link
                      href={item.href}
                      className="rounded-lg p-3 text-base font-medium text-red-800 transition-colors hover:bg-red-50/50"
                    >
                      {item.name}
                    </Link>
                  </SheetClose>
                ))}

                <div className="my-2 border-t border-red-100" />

                {/* User Menu Items */}
                {session ? (
                  <>
                    {userMenuItems.map((item) => (
                      <UserMenuItem key={item.href} item={item} mobile={true} />
                    ))}
                    <button
                      onClick={() =>
                        signOut()
                          .then(() => {
                            toast({
                              title: "Success",
                              description: "Successfully signed out",
                            });
                          })
                          .catch(() => {
                            toast({
                              title: "Error",
                              description: "Failed to sign out",
                            });
                          })
                      }
                      className="flex w-full items-center space-x-2 rounded-lg p-3 text-base font-medium text-red-800 transition-colors hover:bg-red-50/50"
                    >
                      <LogOut className="h-5 w-5" />
                      <span>Sign Out</span>
                    </button>
                  </>
                ) : (
                  <>
                    <SheetClose asChild>
                      <Link
                        href="/login"
                        className="flex w-full items-center rounded-lg p-3 text-base font-medium text-red-800 transition-colors hover:bg-red-50/50"
                      >
                        Login
                      </Link>
                    </SheetClose>
                    <SheetClose asChild>
                      <Link
                        href="/register"
                        className="flex w-full items-center rounded-lg p-3 text-base font-medium text-red-800 transition-colors hover:bg-red-50/50"
                      >
                        Register
                      </Link>
                    </SheetClose>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>

          {/* Logo */}
          <Link
            href="/"
            className="flex items-center space-x-2"
            aria-label="Amamma's Kitchen - Return to homepage"
          >
            <Image
              src="/logo.png"
              alt="Logo"
              width={50}
              height={50}
              className="h-12 w-auto"
              priority
            />
            <div className="flex flex-col">
              <span className="text-xl font-bold text-red-800">
                Amamma&apos;s Kitchen
              </span>
              <span className="text-xs text-green-700">South India Pickle</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden items-center space-x-6 md:flex">
            {navigationItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-base font-medium text-red-800 decoration-2 underline-offset-4 transition-colors hover:text-red-600 hover:underline"
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Cart and User Actions */}
          <div className="flex items-center space-x-4">
            <Link href="/cart">
              <Button
                variant="ghost"
                size="icon"
                className="relative hover:bg-red-50/50"
                aria-label={`Shopping cart with ${cartItemCount} items`}
              >
                <ShoppingCart className="h-5 w-5 text-red-800" />
                {cartItemCount > 0 && (
                  <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-green-600 text-xs font-medium text-white">
                    {cartItemCount}
                  </span>
                )}
              </Button>
            </Link>

            {/* User Dropdown Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="hover:bg-red-50/50"
                  aria-label="User account menu"
                >
                  <User className="h-5 w-5 text-red-800" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-64 bg-white/95 p-2 backdrop-blur-md backdrop-saturate-150"
              >
                <DropdownMenuLabel className="px-2 py-1.5 text-sm font-semibold text-red-800">
                  {session
                    ? `Welcome, ${session.user.name}`
                    : "Account Options"}
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="my-1" />
                {session ? (
                  <>
                    {userMenuItems.map((item) => (
                      <DropdownMenuItem key={item.href} asChild className="p-0">
                        <UserMenuItem item={item} />
                      </DropdownMenuItem>
                    ))}
                    <DropdownMenuSeparator className="my-1" />
                    <DropdownMenuItem asChild className="p-0">
                      <button
                        onClick={() =>
                          signOut()
                            .then(() => {
                              toast({
                                title: "Success",
                                description: "Successfully signed out",
                              });
                            })
                            .catch(() => {
                              toast({
                                title: "Error",
                                description: "Failed to sign out",
                              });
                            })
                        }
                        className="flex w-full items-center space-x-2 rounded-lg p-2 text-sm font-medium text-red-800 transition-colors hover:bg-red-50/50 hover:text-red-600"
                      >
                        <LogOut className="h-4 w-4" />
                        <span className="ml-2">Sign Out</span>
                      </button>
                    </DropdownMenuItem>
                  </>
                ) : (
                  <>
                    <DropdownMenuItem asChild>
                      <Link
                        href="/login"
                        className="flex w-full items-center space-x-2 text-red-800 hover:text-red-600"
                      >
                        <User className="h-4 w-4" />
                        <span>Login</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link
                        href="/register"
                        className="flex w-full items-center space-x-2 text-red-800 hover:text-red-600"
                      >
                        <User className="h-4 w-4" />
                        <span>Register</span>
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}
