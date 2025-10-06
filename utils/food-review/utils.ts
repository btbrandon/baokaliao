import { CreateFoodReviewInput, CreateDishInput, CreateRatingInput } from '@/types';

export const createFoodReviewInput = (
  placeName: string,
  placeAddress: string,
  overallRating: number,
  visitDate: string,
  options?: {
    latitude?: number;
    longitude?: number;
    googlePlaceId?: string;
    notes?: string;
    dishes?: CreateDishInput[];
    ratings?: CreateRatingInput[];
    photos?: string[];
  }
): CreateFoodReviewInput => {
  return {
    place_name: placeName,
    place_address: placeAddress,
    overall_rating: overallRating,
    visit_date: visitDate,
    latitude: options?.latitude,
    longitude: options?.longitude,
    google_place_id: options?.googlePlaceId,
    notes: options?.notes,
    dishes: options?.dishes || [],
    ratings: options?.ratings || [],
    photos: options?.photos,
  };
};

export const createDishInput = (
  name: string,
  price: number,
  options?: {
    notes?: string;
    rating?: number;
    createExpense?: boolean;
  }
): CreateDishInput => {
  return {
    name,
    price,
    notes: options?.notes,
    rating: options?.rating,
    create_expense: options?.createExpense || false,
  };
};

export const createRatingInput = (category: string, rating: number): CreateRatingInput => {
  return {
    category,
    rating,
  };
};

export const DEFAULT_RATING_CATEGORIES = [
  'Food Quality',
  'Service',
  'Ambiance',
  'Value for Money',
  'Cleanliness',
];

export const validateRating = (rating: number): boolean => {
  return rating >= 0 && rating <= 5 && rating % 0.5 === 0;
};

export const calculateAverageRating = (ratings: { rating: number }[]): number => {
  if (ratings.length === 0) return 0;
  const sum = ratings.reduce((acc, r) => acc + r.rating, 0);
  return Math.round((sum / ratings.length) * 2) / 2;
};

export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price);
};

export const getTotalDishesPrice = (dishes: { price: number }[]): number => {
  return dishes.reduce((acc, dish) => acc + dish.price, 0);
};
