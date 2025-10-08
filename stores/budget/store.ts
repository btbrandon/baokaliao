import { makeAutoObservable } from 'mobx';

export interface BudgetAllocation {
  category: string;
  percentage: number;
  amount: number;
  color: string;
}

export interface Budget {
  id: string;
  user_id: string;
  month: number;
  year: number;
  monthly_income: number;
  expenses_percentage: number;
  investments_percentage: number;
  savings_percentage: number;
  other_percentage: number;
  is_recurring: boolean;
  created_at: string;
  updated_at?: string;
}

export class BudgetStore {
  budget: Budget | null = null;
  loading: boolean = false;
  error: string | null = null;
  loaded: boolean = false; // Track if data has been fetched
  loadedMonth: string | null = null; // Track which month was loaded (format: YYYY-MM)

  constructor() {
    makeAutoObservable(this);
  }

  setBudget(budget: Budget | null) {
    this.budget = budget;
    if (budget) {
      this.loaded = true;
      this.loadedMonth = `${budget.year}-${String(budget.month).padStart(2, '0')}`;
    } else {
      this.loaded = true; // Mark as loaded even if null (no budget for this month)
    }
  }

  // Fetch budget with caching
  async fetchBudget(month: number, year: number, force = false) {
    const monthKey = `${year}-${String(month).padStart(2, '0')}`;

    // Skip fetch if already loaded for this month and not forced
    if (this.loaded && this.loadedMonth === monthKey && !force) {
      return;
    }

    this.setLoading(true);
    this.setError(null);

    try {
      const response = await fetch(`/api/budget?month=${month}&year=${year}`);
      if (response.ok) {
        const data = await response.json();
        this.setBudget(data);
      } else if (response.status === 404) {
        this.setBudget(null);
      } else {
        console.error('Unexpected error fetching budget:', response.status);
        this.setError('Failed to fetch budget');
      }
    } catch (error) {
      console.error('Error fetching budget:', error);
      this.setError('Failed to fetch budget');
    } finally {
      this.setLoading(false);
    }
  }

  // Force refresh from database
  async refresh(month: number, year: number) {
    return this.fetchBudget(month, year, true);
  }

  setLoading(loading: boolean) {
    this.loading = loading;
  }

  setError(error: string | null) {
    this.error = error;
  }

  get monthlyIncome() {
    return this.budget?.monthly_income || 0;
  }

  get allocations(): BudgetAllocation[] {
    if (!this.budget) return [];

    const income = this.budget.monthly_income;
    return [
      {
        category: 'Expenses',
        percentage: this.budget.expenses_percentage,
        amount: (income * this.budget.expenses_percentage) / 100,
        color: '#ef4444',
      },
      {
        category: 'Investments',
        percentage: this.budget.investments_percentage,
        amount: (income * this.budget.investments_percentage) / 100,
        color: '#10b981',
      },
      {
        category: 'Savings',
        percentage: this.budget.savings_percentage,
        amount: (income * this.budget.savings_percentage) / 100,
        color: '#3b82f6',
      },
      {
        category: 'Other',
        percentage: this.budget.other_percentage,
        amount: (income * this.budget.other_percentage) / 100,
        color: '#8b5cf6',
      },
    ];
  }

  get totalPercentage() {
    if (!this.budget) return 0;
    return (
      this.budget.expenses_percentage +
      this.budget.investments_percentage +
      this.budget.savings_percentage +
      this.budget.other_percentage
    );
  }

  get isValid() {
    return this.totalPercentage === 100;
  }

  get remainingIncome() {
    return this.monthlyIncome - this.allocations.reduce((sum, a) => sum + a.amount, 0);
  }

  // Clear all data (e.g., on logout)
  clear() {
    this.budget = null;
    this.loaded = false;
    this.loadedMonth = null;
    this.loading = false;
    this.error = null;
  }
}

export const budgetStore = new BudgetStore();
