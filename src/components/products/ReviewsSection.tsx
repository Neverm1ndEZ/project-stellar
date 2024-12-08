// components/products/ReviewsSection.tsx
"use client";

import { Star, ThumbsUp } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Product, Review } from "@/types/product";
import { useState } from "react";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

interface ReviewsSectionProps {
	product: Product;
}

function RatingStars({ rating }: { rating: number }) {
	return (
		<div className="flex gap-0.5">
			{[1, 2, 3, 4, 5].map((star) => (
				<Star
					key={star}
					className={`h-4 w-4 ${
						star <= rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
					}`}
				/>
			))}
		</div>
	);
}

function RatingDistribution({
	distribution,
}: {
	distribution: Record<number, number>;
}) {
	const total = Object.values(distribution).reduce(
		(acc, curr) => acc + curr,
		0,
	);

	return (
		<div className="space-y-2">
			{[5, 4, 3, 2, 1].map((rating) => (
				<div key={rating} className="flex items-center gap-2">
					<span className="w-8 text-sm">{rating} star</span>
					<Progress
						value={(distribution[rating] / total) * 100}
						className="h-2"
					/>
					<span className="w-12 text-sm text-gray-500">
						{distribution[rating]}
					</span>
				</div>
			))}
		</div>
	);
}

function ReviewCard({ review }: { review: Review }) {
	const [isHelpful, setIsHelpful] = useState(false);

	return (
		<div className="border rounded-lg p-4 space-y-3">
			<div className="flex items-start justify-between">
				<div className="flex gap-3">
					{review.userImage && (
						<img
							src={review.userImage}
							alt={review.userName}
							className="w-10 h-10 rounded-full"
						/>
					)}
					<div>
						<h4 className="font-medium">{review.userName}</h4>
						<RatingStars rating={review.rating} />
					</div>
				</div>
				{review.verified && (
					<span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
						Verified Purchase
					</span>
				)}
			</div>

			<p className="text-gray-600">{review.comment}</p>

			{review.images && (
				<div className="flex gap-2 mt-2">
					{review.images.map((image, index) => (
						<img
							key={index}
							src={image}
							alt={`Review image ${index + 1}`}
							className="w-20 h-20 object-cover rounded"
						/>
					))}
				</div>
			)}

			<div className="flex items-center justify-between text-sm text-gray-500">
				<span>{new Date(review.date).toLocaleDateString()}</span>
				<Button
					variant="ghost"
					size="sm"
					className="text-gray-500 hover:text-brand-600"
					onClick={() => setIsHelpful(!isHelpful)}
				>
					<ThumbsUp
						className={`h-4 w-4 mr-1 ${isHelpful ? "fill-brand-600" : ""}`}
					/>
					Helpful ({review.helpful + (isHelpful ? 1 : 0)})
				</Button>
			</div>
		</div>
	);
}

export function ReviewsSection({ product }: ReviewsSectionProps) {
	const [reviewSort, setReviewSort] = useState<"recent" | "helpful">("helpful");

	return (
		<div className="space-y-6">
			<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
				{/* Rating Summary */}
				<div className="space-y-4">
					<div className="text-center md:text-left">
						<div className="text-5xl font-bold text-brand-600">
							{product.rating.average}
						</div>
						<RatingStars rating={product.rating.average} />
						<div className="text-sm text-gray-500 mt-1">
							{product.rating.count} reviews
						</div>
					</div>
					<RatingDistribution distribution={product.rating.distribution} />
				</div>

				{/* Sort and Filter */}
				<div className="space-y-4">
					<div className="flex justify-between items-center">
						<h3 className="font-medium">Customer Reviews</h3>
						<Select
							value={reviewSort}
							onValueChange={(value) =>
								setReviewSort(value as "recent" | "helpful")
							}
						>
							<SelectTrigger className="w-36">
								<SelectValue placeholder="Sort by" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="helpful">Most Helpful</SelectItem>
								<SelectItem value="recent">Most Recent</SelectItem>
							</SelectContent>
						</Select>
					</div>
				</div>
			</div>

			{/* Reviews List */}
			<div className="space-y-4">
				{product.reviews.map((review) => (
					<ReviewCard key={review.id} review={review} />
				))}
			</div>
		</div>
	);
}
