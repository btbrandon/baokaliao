import { FoodReview, CreateFoodReviewInput } from '@/types';

export const fetchFoodReviews = async (): Promise<FoodReview[]> => {
  const response = await fetch('/api/food-reviews');
  if (!response.ok) throw new Error('Failed to fetch food reviews');
  return response.json();
};

export const getFoodReview = async (id: string): Promise<FoodReview> => {
  const response = await fetch(`/api/food-reviews/${id}`);
  if (!response.ok) throw new Error('Failed to fetch food review');
  return response.json();
};

export const createFoodReview = async (input: CreateFoodReviewInput): Promise<FoodReview> => {
  const response = await fetch('/api/food-reviews', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!response.ok) throw new Error('Failed to create food review');
  return response.json();
};

export const updateFoodReview = async (
  id: string,
  updates: Partial<CreateFoodReviewInput>
): Promise<FoodReview> => {
  const response = await fetch(`/api/food-reviews/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  if (!response.ok) throw new Error('Failed to update food review');
  return response.json();
};

export const deleteFoodReview = async (id: string): Promise<void> => {
  const response = await fetch(`/api/food-reviews/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Failed to delete food review');
};

export const addDishToReview = async (
  reviewId: string,
  dish: CreateFoodReviewInput['dishes'][0]
) => {
  const response = await fetch(`/api/food-reviews/${reviewId}/dishes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dish),
  });
  if (!response.ok) throw new Error('Failed to add dish');
  return response.json();
};

export const addPhotosToReview = async (reviewId: string, photoUrls: string[]): Promise<void> => {
  const response = await fetch(`/api/food-reviews/${reviewId}/photos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ photoUrls }),
  });
  if (!response.ok) throw new Error('Failed to add photos');
};
