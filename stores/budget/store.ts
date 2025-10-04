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

  constructor() {
    makeAutoObservable(this);
  }

  setBudget(budget: Budget | null) {
    this.budget = budget;
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
}

export const budgetStore = new BudgetStore();
