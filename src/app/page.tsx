// import Link from "next/link";

// import { LatestPost } from "@/app/_components/post";
// import { auth } from "@/server/auth";
// import { api, HydrateClient } from "@/trpc/server";

// export default async function Home() {
//   const hello = await api.post.hello({ text: "from tRPC" });
//   const session = await auth();

//   if (session?.user) {
//     void api.post.getLatest.prefetch();
//   }

//   return (
//     <HydrateClient>
//       <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
//         <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
//           <h1 className="text-5xl font-extrabold tracking-tight sm:text-[5rem]">
//             Create <span className="text-[hsl(280,100%,70%)]">T3</span> App
//           </h1>
//           <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-8">
//             <Link
//               className="flex max-w-xs flex-col gap-4 rounded-xl bg-white/10 p-4 hover:bg-white/20"
//               href="https://create.t3.gg/en/usage/first-steps"
//               target="_blank"
//             >
//               <h3 className="text-2xl font-bold">First Steps →</h3>
//               <div className="text-lg">
//                 Just the basics - Everything you need to know to set up your
//                 database and authentication.
//               </div>
//             </Link>
//             <Link
//               className="flex max-w-xs flex-col gap-4 rounded-xl bg-white/10 p-4 hover:bg-white/20"
//               href="https://create.t3.gg/en/introduction"
//               target="_blank"
//             >
//               <h3 className="text-2xl font-bold">Documentation →</h3>
//               <div className="text-lg">
//                 Learn more about Create T3 App, the libraries it uses, and how
//                 to deploy it.
//               </div>
//             </Link>
//           </div>
//           <div className="flex flex-col items-center gap-2">
//             <p className="text-2xl text-white">
//               {hello ? hello.greeting : "Loading tRPC query..."}
//             </p>

//             <div className="flex flex-col items-center justify-center gap-4">
//               <p className="text-center text-2xl text-white">
//                 {session && <span>Logged in as {session.user?.name}</span>}
//               </p>
//               <Link
//                 href={session ? "/api/auth/signout" : "/api/auth/signin"}
//                 className="rounded-full bg-white/10 px-10 py-3 font-semibold no-underline transition hover:bg-white/20"
//               >
//                 {session ? "Sign out" : "Sign in"}
//               </Link>
//             </div>
//           </div>

//           {session?.user && <LatestPost />}
//         </div>
//       </main>
//     </HydrateClient>
//   );
// }

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { api } from "@/trpc/server";

export default async function HomePage() {
  const products = await api.product.getAll();
  console.log(products, "products");
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
              <Card key={product.id} className="overflow-hidden">
                <img
                  src={`https://placeholder.pagebee.io/api/plain/400/300`}
                  alt={product.name}
                  className="h-48 w-full object-cover"
                />
                <CardContent className="p-6">
                  <h3 className="mb-2 text-xl font-semibold">{product.name}</h3>
                  <p className="mb-4 text-gray-600">{product.description}</p>
                  <p className="text-brand-600 text-xl font-bold">
                    ₹{product.price}
                  </p>
                </CardContent>
                <CardFooter className="p-6 pt-0">
                  <Button className="w-full">Add to Cart</Button>
                </CardFooter>
              </Card>
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
                href={`/products?category=${category.id}`}
              >
                <Card className="transition-shadow hover:shadow-lg">
                  <img
                    src={`https://placeholder.pagebee.io/api/plain/200/200`}
                    alt={category.name}
                    className="h-32 w-full rounded-t-lg object-cover"
                  />
                  <CardContent className="p-4">
                    <h3 className="text-center text-lg font-semibold">
                      {category.name}
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

// Data for the components
const featuredProducts = [
  {
    id: 1,
    name: "Mango Thokku",
    description: "Spicy and tangy mango pickle made with fresh raw mangoes",
    price: 199,
    image: "/mango-pickle.jpg",
  },
  {
    id: 2,
    name: "Lemon Pickle",
    description: "Traditional lemon pickle with aromatic spices",
    price: 149,
    image: "/lemon-pickle.jpg",
  },
  {
    id: 3,
    name: "Mixed Vegetable Pickle",
    description: "Assorted vegetables pickled in traditional spices",
    price: 179,
    image: "/mixed-pickle.jpg",
  },
];

const categories = [
  { id: "mango", name: "Mango Varieties" },
  { id: "citrus", name: "Lemon & Citrus" },
  { id: "mixed", name: "Mixed Vegetables" },
  { id: "seasonal", name: "Seasonal Specials" },
];
