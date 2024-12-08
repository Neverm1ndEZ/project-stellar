// app/(shop)/cart/page.tsx
"use client";

import { useCart } from "@/lib/store/cart";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Minus, Plus, Trash2 } from "lucide-react";
import Link from "next/link";

export default function CartPage() {
	const { items, removeItem, updateQuantity } = useCart();

	const subtotal = items.reduce(
		(total, item) => total + item.price * item.quantity,
		0,
	);
	const shipping = subtotal > 500 ? 0 : 50;
	const total = subtotal + shipping;

	if (items.length === 0) {
		return (
			<div className="container py-32 text-center">
				<h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
				<p className="text-gray-600 mb-8">
					Add some delicious pickles to your cart!
				</p>
				<Link href="/products">
					<Button>Browse Products</Button>
				</Link>
			</div>
		);
	}

	return (
		<div className="container py-8">
			<h1 className="text-2xl font-bold mb-8">Shopping Cart</h1>

			<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
				{/* Cart Items */}
				<div className="md:col-span-2 space-y-4">
					{items.map((item) => (
						<Card key={item.id}>
							<CardContent className="flex items-center p-4">
								<img
									src={`https://placeholder.pagebee.io/api/plain/100/100`}
									alt={item.name}
									className="w-24 h-24 object-cover rounded"
								/>
								<div className="ml-4 flex-grow">
									<h3 className="font-medium">{item.name}</h3>
									<p className="text-gray-600">Size: {item.size}</p>
									<p className="text-brand-600 font-bold">₹{item.price}</p>

									<div className="flex items-center mt-2">
										<Button
											variant="outline"
											size="icon"
											onClick={() =>
												updateQuantity(item.id, Math.max(1, item.quantity - 1))
											}
										>
											<Minus className="h-4 w-4" />
										</Button>
										<span className="mx-4 w-8 text-center">
											{item.quantity}
										</span>
										<Button
											variant="outline"
											size="icon"
											onClick={() => updateQuantity(item.id, item.quantity + 1)}
										>
											<Plus className="h-4 w-4" />
										</Button>
									</div>
								</div>
								<Button
									variant="ghost"
									size="icon"
									className="text-red-600"
									onClick={() => removeItem(item.id)}
								>
									<Trash2 className="h-4 w-4" />
								</Button>
							</CardContent>
						</Card>
					))}
				</div>

				{/* Order Summary */}
				<div>
					<Card>
						<CardHeader>
							<CardTitle>Order Summary</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="flex justify-between">
								<span>Subtotal</span>
								<span>₹{subtotal}</span>
							</div>
							<div className="flex justify-between">
								<span>Shipping</span>
								<span>{shipping === 0 ? "Free" : `₹${shipping}`}</span>
							</div>
							<div className="flex justify-between font-bold text-lg border-t pt-4">
								<span>Total</span>
								<span>₹{total}</span>
							</div>
						</CardContent>
						<CardFooter>
							<Button asChild className="w-full">
								<Link href="/checkout">Proceed to Checkout</Link>
							</Button>
						</CardFooter>
					</Card>

					<div className="mt-6 space-y-4">
						<div className="flex items-center text-gray-600 text-sm">
							<svg
								className="w-5 h-5 mr-2"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M5 13l4 4L19 7"
								/>
							</svg>
							Free shipping on orders above ₹500
						</div>
						<div className="flex items-center text-gray-600 text-sm">
							<svg
								className="w-5 h-5 mr-2"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
								/>
							</svg>
							Secure checkout process
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
