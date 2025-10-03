import { makeAutoObservable, runInAction } from 'mobx';

export interface Expense {
  id: string;
  user_id: string;
  amount: number;
  description: string;
  category: string;
  date: string;
  created_at: string;
}

export class ExpensesStore {
  expenses: Expense[] = [];
  loading: boolean = false;
  error: string | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  setExpenses(expenses: Expense[]) {
    this.expenses = expenses;
  }

  addExpense(expense: Expense) {
    this.expenses.unshift(expense);
  }

  updateExpense(id: string, updates: Partial<Expense>) {
    const index = this.expenses.findIndex((e) => e.id === id);
    if (index !== -1) {
      this.expenses[index] = { ...this.expenses[index], ...updates };
    }
  }

  deleteExpense(id: string) {
    this.expenses = this.expenses.filter((e) => e.id !== id);
  }

  setLoading(loading: boolean) {
    this.loading = loading;
  }

  setError(error: string | null) {
    this.error = error;
  }

  get totalExpenses() {
    return this.expenses.reduce((sum, expense) => sum + expense.amount, 0);
  }

  get expensesByCategory() {
    return this.expenses.reduce(
      (acc, expense) => {
        if (!acc[expense.category]) {
          acc[expense.category] = 0;
        }
        acc[expense.category] += expense.amount;
        return acc;
      },
      {} as Record<string, number>
    );
  }

  get recentExpenses() {
    return this.expenses.slice(0, 10);
  }
}

export const expensesStore = new ExpensesStore();
