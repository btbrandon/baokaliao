import { makeAutoObservable, runInAction } from 'mobx';

export interface Expense {
  id: string;
  user_id: string;
  amount: number;
  description: string;
  category: string;
  date: string;
  notes?: string | null;
  receipt_url?: string | null;
  is_recurring?: boolean;
  recurring_day?: number | null;
  created_at: string;
  updated_at?: string;
}

export class ExpensesStore {
  expenses: Expense[] = [];
  loading: boolean = false;
  error: string | null = null;
  selectedMonth: Date = new Date(); // Track selected month

  constructor() {
    makeAutoObservable(this);
  }

  setSelectedMonth(date: Date) {
    this.selectedMonth = date;
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
    return this.filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  }

  get filteredExpenses() {
    const year = this.selectedMonth.getFullYear();
    const month = this.selectedMonth.getMonth();

    return this.expenses.filter((expense) => {
      const expenseDate = new Date(expense.date);
      return expenseDate.getFullYear() === year && expenseDate.getMonth() === month;
    });
  }

  get expensesByCategory() {
    return this.filteredExpenses.reduce(
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
    return this.filteredExpenses.slice(0, 10);
  }
}

export const expensesStore = new ExpensesStore();
