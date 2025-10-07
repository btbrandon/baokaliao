import { makeAutoObservable, runInAction } from 'mobx';
import { FoodReview, CreateFoodReviewInput } from '@/types';

export class FoodReviewStore {
  reviews: FoodReview[] = [];
  selectedReview: FoodReview | null = null;
  loading = false;
  error: string | null = null;
  loaded = false; // Track if data has been fetched

  constructor() {
    makeAutoObservable(this);
  }

  async fetchReviews(force = false) {
    // Skip fetch if already loaded and not forced
    if (this.loaded && !force) {
      return;
    }

    this.loading = true;
    this.error = null;

    try {
      const response = await fetch('/api/food-reviews');
      if (!response.ok) throw new Error('Failed to fetch reviews');

      const data = await response.json();
      runInAction(() => {
        this.reviews = data;
        this.loaded = true;
        this.loading = false;
      });
    } catch (error) {
      runInAction(() => {
        this.error = error instanceof Error ? error.message : 'Unknown error';
        this.loading = false;
      });
    }
  }

  // Force refresh from database
  async refresh() {
    return this.fetchReviews(true);
  }

  async getReview(id: string, force = false) {
    // Check if review exists in cache
    if (!force) {
      const cachedReview = this.reviews.find((r) => r.id === id);
      if (cachedReview) {
        runInAction(() => {
          this.selectedReview = cachedReview;
        });
        return;
      }
    }

    this.loading = true;
    this.error = null;

    try {
      const response = await fetch(`/api/food-reviews/${id}`);
      if (!response.ok) throw new Error('Failed to fetch review');

      const data = await response.json();
      runInAction(() => {
        this.selectedReview = data;
        // Update cache if review exists
        const index = this.reviews.findIndex((r) => r.id === id);
        if (index !== -1) {
          this.reviews[index] = data;
        }
        this.loading = false;
      });
    } catch (error) {
      runInAction(() => {
        this.error = error instanceof Error ? error.message : 'Unknown error';
        this.loading = false;
      });
    }
  }

  async createReview(input: CreateFoodReviewInput) {
    this.loading = true;
    this.error = null;

    try {
      const response = await fetch('/api/food-reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });

      if (!response.ok) throw new Error('Failed to create review');

      const data = await response.json();
      runInAction(() => {
        this.reviews = [data, ...this.reviews];
        this.loading = false;
      });

      return data;
    } catch (error) {
      runInAction(() => {
        this.error = error instanceof Error ? error.message : 'Unknown error';
        this.loading = false;
      });
      throw error;
    }
  }

  async updateReview(id: string, updates: Partial<CreateFoodReviewInput>) {
    this.loading = true;
    this.error = null;

    try {
      const response = await fetch(`/api/food-reviews/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (!response.ok) throw new Error('Failed to update review');

      const data = await response.json();
      runInAction(() => {
        const index = this.reviews.findIndex((r) => r.id === id);
        if (index !== -1) {
          this.reviews[index] = data;
        }
        if (this.selectedReview?.id === id) {
          this.selectedReview = data;
        }
        this.loading = false;
      });

      return data;
    } catch (error) {
      runInAction(() => {
        this.error = error instanceof Error ? error.message : 'Unknown error';
        this.loading = false;
      });
      throw error;
    }
  }

  async deleteReview(id: string) {
    this.loading = true;
    this.error = null;

    try {
      const response = await fetch(`/api/food-reviews/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete review');

      runInAction(() => {
        this.reviews = this.reviews.filter((r) => r.id !== id);
        if (this.selectedReview?.id === id) {
          this.selectedReview = null;
        }
        this.loading = false;
      });
    } catch (error) {
      runInAction(() => {
        this.error = error instanceof Error ? error.message : 'Unknown error';
        this.loading = false;
      });
      throw error;
    }
  }

  async addDish(reviewId: string, dish: CreateFoodReviewInput['dishes'][0]) {
    try {
      const response = await fetch(`/api/food-reviews/${reviewId}/dishes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dish),
      });

      if (!response.ok) throw new Error('Failed to add dish');

      const data = await response.json();
      await this.getReview(reviewId);
      return data;
    } catch (error) {
      this.error = error instanceof Error ? error.message : 'Unknown error';
      throw error;
    }
  }

  async addPhotos(reviewId: string, photoUrls: string[]) {
    try {
      const response = await fetch(`/api/food-reviews/${reviewId}/photos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ photoUrls }),
      });

      if (!response.ok) throw new Error('Failed to add photos');

      await this.getReview(reviewId);
    } catch (error) {
      this.error = error instanceof Error ? error.message : 'Unknown error';
      throw error;
    }
  }

  clearError() {
    this.error = null;
  }

  // Clear all data (e.g., on logout)
  clear() {
    this.reviews = [];
    this.selectedReview = null;
    this.loaded = false;
    this.loading = false;
    this.error = null;
  }
}

export const foodReviewStore = new FoodReviewStore();
