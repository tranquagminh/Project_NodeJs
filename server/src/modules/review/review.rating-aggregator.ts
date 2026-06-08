export interface ReviewForAggregation {
  rating: number;
}

export interface RatingDistribution {
  1: number;
  2: number;
  3: number;
  4: number;
  5: number;
}

export interface RatingAggregation {
  avgRating: number;
  totalReviews: number;
  distribution: RatingDistribution;
}

export function aggregateRatings(reviews: ReviewForAggregation[]): RatingAggregation {
  const distribution: RatingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

  if (reviews.length === 0) {
    return { avgRating: 0, totalReviews: 0, distribution };
  }

  let sum = 0;
  for (const r of reviews) {
    const star = Math.min(5, Math.max(1, Math.round(r.rating))) as 1 | 2 | 3 | 4 | 5;
    distribution[star]++;
    sum += r.rating;
  }

  const avgRating = Math.round((sum / reviews.length) * 10) / 10;

  return { avgRating, totalReviews: reviews.length, distribution };
}

export function isEligibleForPointsReward(comment: string, images: string[]): boolean {
  return images.length >= 1 && comment.length >= 50;
}
