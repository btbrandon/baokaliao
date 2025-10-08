// Food to Try Types

export interface FoodToTry {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  cuisine: string;
  location?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  google_place_id?: string;
  tiktok_url?: string;
  video_url?: string;
  image_url?: string;
  status: 'to_try' | 'visited' | 'skipped';
  created_at: string;
  updated_at?: string;
}

export interface CreateFoodToTryInput {
  name: string;
  description?: string;
  cuisine: string;
  location?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  google_place_id?: string;
  tiktok_url?: string;
  video_url?: string;
  image_url?: string;
  status?: 'to_try' | 'visited' | 'skipped';
}

export interface FoodToTryFilters {
  cuisine?: string;
  location?: string;
  searchQuery?: string;
  sortBy?: 'date' | 'name' | 'cuisine';
  sortOrder?: 'asc' | 'desc';
}
