export interface User {
  id: string;
  email: string;
  created_at: string;
}

export interface Expense {
  id: string;
  user_id: string;
  amount: number;
  description: string;
  category: string;
  date: string;
  created_at: string;
  updated_at?: string;
}

export interface Category {
  id: string;
  name: string;
  icon?: string;
  color?: string;
}

export interface ExpenseSummary {
  total: number;
  count: number;
  average: number;
  byCategory: Record<string, number>;
  byMonth: Record<string, { total: number; count: number }>;
}

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

export interface DialogProps {
  open: boolean;
  onClose: () => void;
}

export interface FoodReview {
  id: string;
  user_id: string;
  place_name: string;
  place_address?: string;
  latitude?: number;
  longitude?: number;
  google_place_id?: string;
  overall_rating: number;
  notes?: string;
  visit_date: string;
  expense_id?: string;
  bill_adjustments?: BillAdjustments;
  created_at: string;
  updated_at: string;
  dishes?: Dish[];
  ratings?: ReviewRating[];
  photos?: ReviewPhoto[];
}

export interface Dish {
  id: string;
  review_id: string;
  name: string;
  price: number;
  notes?: string;
  rating?: number;
  expense_id?: string;
  created_at: string;
}

export interface ReviewRating {
  id: string;
  review_id: string;
  category: string;
  rating: number;
}

export interface ReviewPhoto {
  id: string;
  review_id: string;
  user_id: string;
  url: string;
  caption?: string;
  created_at: string;
}

export interface CreateFoodReviewInput {
  place_name: string;
  place_address?: string;
  latitude?: number;
  longitude?: number;
  google_place_id?: string;
  overall_rating: number;
  notes?: string;
  visit_date: string;
  dishes: CreateDishInput[];
  ratings: CreateRatingInput[];
  photos?: string[];
  bill_adjustments?: BillAdjustments;
}

export interface BillAdjustments {
  apply_gst: boolean;
  apply_service_charge: boolean;
  split_bill: boolean;
  number_of_people: number;
}

export interface CreateDishInput {
  name: string;
  price: number;
  notes?: string;
  rating?: number;
  create_expense?: boolean;
}

export interface CreateRatingInput {
  category: string;
  rating: number;
}

// Re-export food-to-try types
export * from './food-to-try';
