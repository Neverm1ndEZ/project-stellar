import React, { useState } from "react";
import { Star, ThumbsUp } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Type definitions based on your schema
interface Review {
  id: number;
  productId: number;
  userId: string;
  rating: number;
  title: string;
  detailedReview: string | null;
  createdAt: Date;
  updatedAt: Date;
  // Additional fields for UI
  user?: {
    name: string;
    image?: string;
  };
  helpful?: number;
  verified?: boolean;
}

interface ReviewSectionProps {
  productId: number;
  currentUserId?: string | null;
  hasOrderHistory?: boolean;
}

// Helper components
const RatingStars = ({ rating, onRatingChange, interactive = false }) => {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-5 w-5 ${
            star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
          } ${interactive ? "cursor-pointer" : ""}`}
          onClick={() => interactive && onRatingChange?.(star)}
        />
      ))}
    </div>
  );
};

const ReviewForm = ({ productId, currentUserId, onReviewSubmitted }) => {
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState("");
  const [review, setReview] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Here you would typically make an API call to submit the review
    const newReview = {
      productId,
      userId: currentUserId,
      rating,
      title,
      detailedReview: review,
      createdAt: new Date(),
      user: {
        name: "Current User", // This would come from your auth system
      },
      helpful: 0,
      verified: true,
    };

    onReviewSubmitted(newReview);
    // Reset form
    setRating(0);
    setTitle("");
    setReview("");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Write a Review</CardTitle>
        <CardDescription>
          Share your thoughts about this product with other customers
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Overall Rating</Label>
            <RatingStars
              rating={rating}
              onRatingChange={setRating}
              interactive
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Review Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Summarize your experience"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="review">Your Review</Label>
            <Textarea
              id="review"
              value={review}
              onChange={(e) => setReview(e.target.value)}
              placeholder="What did you like or dislike about this product?"
              required
            />
          </div>

          <Button type="submit" disabled={rating === 0}>
            Submit Review
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

// Main component
export function EnhancedReviewSection({
  productId,
  currentUserId,
  hasOrderHistory,
}: ReviewSectionProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [sortBy, setSortBy] = useState<"recent" | "helpful">("helpful");

  // Calculate review statistics
  const averageRating = reviews.length
    ? reviews.reduce((acc, rev) => acc + rev.rating, 0) / reviews.length
    : 0;

  const distribution = reviews.reduce(
    (acc, rev) => {
      acc[rev.rating] = (acc[rev.rating] || 0) + 1;
      return acc;
    },
    {} as Record<number, number>,
  );

  const handleNewReview = (review: Review) => {
    setReviews([review, ...reviews]);
  };

  const toggleHelpful = (reviewId: number) => {
    setReviews(
      reviews.map((review) =>
        review.id === reviewId
          ? { ...review, helpful: (review.helpful || 0) + 1 }
          : review,
      ),
    );
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        {/* Rating Summary */}
        <div className="space-y-4">
          <div className="text-center md:text-left">
            <div className="text-brand-600 text-5xl font-bold">
              {averageRating.toFixed(1)}
            </div>
            <RatingStars rating={Math.round(averageRating)} />
            <div className="mt-1 text-sm text-gray-500">
              {reviews.length} reviews
            </div>
          </div>

          {/* Rating Distribution */}
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((rating) => (
              <div key={rating} className="flex items-center gap-2">
                <span className="w-8 text-sm">{rating} star</span>
                <Progress
                  value={((distribution[rating] || 0) / reviews.length) * 100}
                  className="h-2"
                />
                <span className="w-12 text-sm text-gray-500">
                  {distribution[rating] || 0}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Review Form or Auth Message */}
        <div>
          {currentUserId ? (
            hasOrderHistory ? (
              <ReviewForm
                productId={productId}
                currentUserId={currentUserId}
                onReviewSubmitted={handleNewReview}
              />
            ) : (
              <Alert>
                <AlertTitle>Purchase Required</AlertTitle>
                <AlertDescription>
                  Only verified purchasers can leave a review for this product.
                </AlertDescription>
              </Alert>
            )
          ) : (
            <Alert>
              <AlertTitle>Sign in Required</AlertTitle>
              <AlertDescription>
                Please sign in to leave a review for this product.
              </AlertDescription>
            </Alert>
          )}
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold">Customer Reviews</h3>
          <Select
            value={sortBy}
            onValueChange={(value: any) => setSortBy(value)}
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

        <div className="space-y-4">
          {reviews
            .sort((a, b) =>
              sortBy === "recent"
                ? new Date(b.createdAt).getTime() -
                  new Date(a.createdAt).getTime()
                : (b.helpful || 0) - (a.helpful || 0),
            )
            .map((review) => (
              <Card key={review.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex gap-3">
                      <div>
                        <h4 className="font-medium">{review.user?.name}</h4>
                        <RatingStars rating={review.rating} />
                      </div>
                    </div>
                    {review.verified && (
                      <span className="rounded bg-green-50 px-2 py-1 text-xs text-green-600">
                        Verified Purchase
                      </span>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <h5 className="mb-2 font-medium">{review.title}</h5>
                  <p className="text-gray-600">{review.detailedReview}</p>
                </CardContent>
                <CardFooter className="flex items-center justify-between text-sm text-gray-500">
                  <span>{new Date(review.createdAt).toLocaleDateString()}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="hover:text-brand-600 text-gray-500"
                    onClick={() => toggleHelpful(review.id)}
                  >
                    <ThumbsUp className="mr-1 h-4 w-4" />
                    Helpful ({review.helpful || 0})
                  </Button>
                </CardFooter>
              </Card>
            ))}
        </div>
      </div>
    </div>
  );
}

export default EnhancedReviewSection;
