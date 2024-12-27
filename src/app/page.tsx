import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { api } from "@/trpc/server";
import Image from "next/image";
import Link from "next/link";
import { ProductCard } from "./_components/ProductCard";

export default async function HomePage() {
  const featuredProducts = await api.product.getAllProducts();
  const categories = await api.product.getAllCategories();

  console.log({ featuredProducts, categories });

  return (
    <div className="flex min-h-screen flex-col">
      {/* Hero Section */}
      <section className="from-brand-50 bg-gradient-to-b to-white px-4 py-20 md:py-32">
        <div className="container mx-auto text-center">
          <h1 className="mb-6 text-4xl font-bold text-gray-900 md:text-6xl">
            Authentic South Indian
            <span className="text-brand-600 block">Homemade Pickles</span>
          </h1>
          <p className="mx-auto mb-8 max-w-2xl text-xl text-gray-600">
            Discover the authentic taste of traditional South Indian pickles,
            handcrafted with love using age-old family recipes.
          </p>
          <Link href="/products">
            <Button size="lg" className="text-lg">
              Explore Our Pickles
            </Button>
          </Link>
        </div>
      </section>

      {/* Featured Products */}
      <section className="px-4 py-16">
        <div className="container mx-auto">
          <h2 className="mb-12 text-center text-3xl font-bold">
            Featured Products
          </h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="bg-gray-50 px-4 py-16">
        <div className="container mx-auto">
          <h2 className="mb-12 text-center text-3xl font-bold">
            Browse by Category
          </h2>
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/products?category=${category.name}`}
              >
                <Card className="transition-shadow hover:shadow-lg">
                  <Image
                    src={`https://placeholder.pagebee.io/api/plain/200/200`}
                    alt={category.name}
                    className="h-32 w-full rounded-t-lg object-cover"
                    height={128}
                    width={128}
                  />
                  <CardContent className="p-4">
                    <h3 className="text-center text-lg font-semibold">
                      {category.description}
                    </h3>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
