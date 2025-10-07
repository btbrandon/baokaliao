import { makeAutoObservable, runInAction } from 'mobx';
import { FoodToTry, CreateFoodToTryInput, FoodToTryFilters } from '@/types/food-to-try';

export class FoodToTryStore {
  items: FoodToTry[] = [];
  selectedItem: FoodToTry | null = null;
  loading = false;
  error: string | null = null;
  loaded = false;
  filters: FoodToTryFilters = {};

  constructor() {
    makeAutoObservable(this);
  }

  setFilters(filters: FoodToTryFilters) {
    this.filters = filters;
  }

  setSelectedItem(item: FoodToTry | null) {
    this.selectedItem = item;
  }

  async fetchItems(force = false) {
    if (this.loaded && !force) {
      return;
    }

    this.loading = true;
    this.error = null;

    try {
      const response = await fetch('/api/food-to-try');
      if (!response.ok) throw new Error('Failed to fetch food to try');

      const data = await response.json();
      runInAction(() => {
        this.items = data;
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

  async refresh() {
    return this.fetchItems(true);
  }

  async getItem(id: string, force = false) {
    if (!force) {
      const cachedItem = this.items.find((item) => item.id === id);
      if (cachedItem) {
        runInAction(() => {
          this.selectedItem = cachedItem;
        });
        return;
      }
    }

    this.loading = true;
    this.error = null;

    try {
      const response = await fetch(`/api/food-to-try/${id}`);
      if (!response.ok) throw new Error('Failed to fetch item');

      const data = await response.json();
      runInAction(() => {
        this.selectedItem = data;
        const index = this.items.findIndex((item) => item.id === id);
        if (index !== -1) {
          this.items[index] = data;
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

  async createItem(input: CreateFoodToTryInput) {
    this.loading = true;
    this.error = null;

    try {
      const response = await fetch('/api/food-to-try', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });

      if (!response.ok) throw new Error('Failed to create item');

      const data = await response.json();
      runInAction(() => {
        this.items = [data, ...this.items];
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

  async updateItem(id: string, updates: Partial<CreateFoodToTryInput>) {
    this.loading = true;
    this.error = null;

    try {
      const response = await fetch(`/api/food-to-try/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (!response.ok) throw new Error('Failed to update item');

      const data = await response.json();
      runInAction(() => {
        const index = this.items.findIndex((item) => item.id === id);
        if (index !== -1) {
          this.items[index] = data;
        }
        if (this.selectedItem?.id === id) {
          this.selectedItem = data;
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

  async deleteItem(id: string) {
    this.loading = true;
    this.error = null;

    try {
      const response = await fetch(`/api/food-to-try/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete item');

      runInAction(() => {
        this.items = this.items.filter((item) => item.id !== id);
        if (this.selectedItem?.id === id) {
          this.selectedItem = null;
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

  get filteredItems() {
    let items = this.items;

    if (this.filters.cuisine) {
      items = items.filter((item) => item.cuisine === this.filters.cuisine);
    }

    if (this.filters.location) {
      // Filter by country (matches end of location string)
      items = items.filter((item) => {
        if (!item.location) return false;
        const parts = item.location.split(',').map((p) => p.trim());
        const country = parts[parts.length - 1];
        return country === this.filters.location;
      });
    }

    if (this.filters.searchQuery) {
      const query = this.filters.searchQuery.toLowerCase();
      items = items.filter(
        (item) =>
          item.name.toLowerCase().includes(query) ||
          item.description?.toLowerCase().includes(query) ||
          item.location?.toLowerCase().includes(query)
      );
    }

    // Apply sorting
    const sortBy = this.filters.sortBy || 'date';
    const sortOrder = this.filters.sortOrder || 'desc';

    items = [...items].sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'cuisine':
          comparison = a.cuisine.localeCompare(b.cuisine);
          break;
        case 'date':
        default:
          comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          break;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return items;
  }

  get uniqueCuisines() {
    return Array.from(new Set(this.items.map((item) => item.cuisine).filter(Boolean))).sort();
  }

  get uniqueLocations() {
    return Array.from(new Set(this.items.map((item) => item.location).filter(Boolean))).sort();
  }

  get uniqueCountries() {
    // Extract country from location
    const countries = this.items
      .map((item) => {
        if (!item.location) return null;
        // Split by comma and take the last part as country
        const parts = item.location.split(',').map((p) => p.trim());
        const lastPart = parts[parts.length - 1];
        // If last part looks like a postal code or address, try second to last
        if (lastPart && /^\d+$/.test(lastPart) && parts.length > 1) {
          return parts[parts.length - 2];
        }
        return lastPart;
      })
      .filter(Boolean);
    return Array.from(new Set(countries)).sort();
  }

  clearError() {
    this.error = null;
  }

  clear() {
    this.items = [];
    this.selectedItem = null;
    this.loaded = false;
    this.loading = false;
    this.error = null;
    this.filters = {};
  }
}

export const foodToTryStore = new FoodToTryStore();
