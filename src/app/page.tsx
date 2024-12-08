import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

export default function HomePage() {
	return (
		<div className="flex flex-col min-h-screen">
			{/* Hero Section */}
			<section className="px-4 py-20 md:py-32 bg-gradient-to-b from-brand-50 to-white">
				<div className="container mx-auto text-center">
					<h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
						Authentic South Indian
						<span className="text-brand-600 block">Homemade Pickles</span>
					</h1>
					<p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
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
			<section className="py-16 px-4">
				<div className="container mx-auto">
					<h2 className="text-3xl font-bold text-center mb-12">
						Featured Products
					</h2>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
						{featuredProducts.map((product) => (
							<Card key={product.id} className="overflow-hidden">
								<img
									src={`https://placeholder.pagebee.io/api/plain/400/300`}
									alt={product.name}
									className="w-full h-48 object-cover"
								/>
								<CardContent className="p-6">
									<h3 className="text-xl font-semibold mb-2">{product.name}</h3>
									<p className="text-gray-600 mb-4">{product.description}</p>
									<p className="text-brand-600 font-bold text-xl">
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
			<section className="py-16 px-4 bg-gray-50">
				<div className="container mx-auto">
					<h2 className="text-3xl font-bold text-center mb-12">
						Browse by Category
					</h2>
					<div className="grid grid-cols-2 md:grid-cols-4 gap-6">
						{categories.map((category) => (
							<Link
								key={category.id}
								href={`/products?category=${category.id}`}
							>
								<Card className="hover:shadow-lg transition-shadow">
									<img
										src={`https://placeholder.pagebee.io/api/plain/200/200`}
										alt={category.name}
										className="w-full h-32 object-cover rounded-t-lg"
									/>
									<CardContent className="p-4">
										<h3 className="text-lg font-semibold text-center">
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
