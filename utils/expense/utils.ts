import { Expense } from '@/stores/expense/store';
import { startOfMonth, endOfMonth, startOfYear, endOfYear, format } from 'date-fns';

export const calculateMonthlyTotal = (expenses: Expense[]): number => {
  const now = new Date();
  const start = startOfMonth(now);
  const end = endOfMonth(now);

  return expenses
    .filter((expense) => {
      const expenseDate = new Date(expense.date);
      return expenseDate >= start && expenseDate <= end;
    })
    .reduce((sum, expense) => sum + expense.amount, 0);
};

export const calculateYearlyTotal = (expenses: Expense[]): number => {
  const now = new Date();
  const start = startOfYear(now);
  const end = endOfYear(now);

  return expenses
    .filter((expense) => {
      const expenseDate = new Date(expense.date);
      return expenseDate >= start && expenseDate <= end;
    })
    .reduce((sum, expense) => sum + expense.amount, 0);
};

export const getExpensesByMonth = (
  expenses: Expense[]
): Record<string, { total: number; count: number }> => {
  return expenses.reduce(
    (acc, expense) => {
      const month = format(new Date(expense.date), 'yyyy-MM');
      if (!acc[month]) {
        acc[month] = { total: 0, count: 0 };
      }
      acc[month].total += expense.amount;
      acc[month].count += 1;
      return acc;
    },
    {} as Record<string, { total: number; count: number }>
  );
};

export const getCategoryPercentages = (
  expensesByCategory: Record<string, number>
): Record<string, number> => {
  const total = Object.values(expensesByCategory).reduce((sum, amount) => sum + amount, 0);

  if (total === 0) return {};

  return Object.entries(expensesByCategory).reduce(
    (acc, [category, amount]) => {
      acc[category] = (amount / total) * 100;
      return acc;
    },
    {} as Record<string, number>
  );
};

export const getTopCategories = (
  expensesByCategory: Record<string, number>,
  limit: number = 5
): Array<{ category: string; amount: number }> => {
  return Object.entries(expensesByCategory)
    .map(([category, amount]) => ({ category, amount }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, limit);
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

export const getAverageDailyExpense = (expenses: Expense[]): number => {
  if (expenses.length === 0) return 0;

  const dates = new Set(expenses.map((e) => e.date));
  const totalAmount = expenses.reduce((sum, e) => sum + e.amount, 0);

  return totalAmount / dates.size;
};
