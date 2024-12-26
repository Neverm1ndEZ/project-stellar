// app/(user)/users/[id]/wishlist/page.tsx
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import { ShoppingCart, Trash2 } from "lucide-react";

export default function WishlistPage({ params }: { params: { id: string } }) {
  // In a real app, this would be fetched from your backend
  const mockWishlist = [
    {
      id: 1,
      name: "Mango Pickle",
      price: 1250,
      image: "/api/placeholder/400/300",
      inStock: true,
      shortDesc: "Traditional South Indian mango pickle made with raw mangoes",
    },
    {
      id: 2,
      name: "Lemon Pickle",
      price: 1800,
      image: "/api/placeholder/400/300",
      inStock: false,
      shortDesc: "Tangy lemon pickle made with fresh citrus fruits",
    },
  ];

  const WishlistItem = ({ item }: { item: (typeof mockWishlist)[0] }) => (
    <Card className="overflow-hidden">
      <div className="flex flex-col md:flex-row">
        <div className="relative h-48 w-full md:h-auto md:w-48">
          <Image
            src={item.image}
            alt={item.name}
            fill
            className="object-cover"
          />
        </div>
        <CardContent className="flex flex-1 flex-col justify-between p-6">
          <div>
            <h3 className="mb-2 text-xl font-semibold">{item.name}</h3>
            <p className="mb-4 text-gray-600">{item.shortDesc}</p>
            <p className="text-xl font-bold text-red-600">₹{item.price}</p>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button className="flex-1" disabled={!item.inStock}>
              <ShoppingCart className="mr-2 h-4 w-4" />
              {item.inStock ? "Add to Cart" : "Out of Stock"}
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="text-red-600 hover:bg-red-50 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </div>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Your Wishlist</h1>
        <p className="text-gray-500">Items you&apos;ve saved for later</p>
      </div>

      {mockWishlist.length > 0 ? (
        <div className="space-y-4">
          {mockWishlist.map((item) => (
            <WishlistItem key={item.id} item={item} />
          ))}
        </div>
      ) : (
        <Card className="p-8 text-center">
          <p className="text-gray-500">Your wishlist is empty</p>
          <Button className="mt-4">Browse Products</Button>
        </Card>
      )}
    </div>
  );
}
