import { makeAutoObservable } from 'mobx';

export interface Category {
  id: string;
  name: string;
  icon?: string;
  color?: string;
}

export class CategoriesStore {
  categories: Category[] = [
    { id: '1', name: 'Food & Dining', icon: '🍔', color: '#FF6B6B' },
    { id: '2', name: 'Transportation', icon: '🚗', color: '#4ECDC4' },
    { id: '3', name: 'Shopping', icon: '🛍️', color: '#95E1D3' },
    { id: '4', name: 'Entertainment', icon: '🎬', color: '#F38181' },
    { id: '5', name: 'Bills & Utilities', icon: '💡', color: '#AA96DA' },
    { id: '6', name: 'Healthcare', icon: '🏥', color: '#FCBAD3' },
    { id: '7', name: 'Education', icon: '📚', color: '#A8D8EA' },
    { id: '8', name: 'Other', icon: '📦', color: '#C7CEEA' },
  ];

  constructor() {
    makeAutoObservable(this);
  }

  addCategory(category: Category) {
    this.categories.push(category);
  }

  getCategoryById(id: string) {
    return this.categories.find((c) => c.id === id);
  }

  getCategoryByName(name: string) {
    return this.categories.find((c) => c.name === name);
  }
}

export const categoriesStore = new CategoriesStore();
