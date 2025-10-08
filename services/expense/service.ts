import { prisma } from '@/lib/prisma';
import { Expense } from '@/stores/expense/store';

const mapExpense = (e: any): Expense => ({
  id: e.id,
  user_id: e.userId,
  amount: e.amount.toNumber(),
  description: e.description,
  category: e.category,
  date: e.date.toISOString().split('T')[0],
  notes: e.notes,
  receipt_url: e.receiptUrl,
  is_recurring: e.isRecurring,
  recurring_day: e.recurringDay,
  created_at: e.createdAt.toISOString(),
  updated_at: e.updatedAt.toISOString(),
});

export const expenseService = {
  async fetchExpenses(userId: string): Promise<Expense[]> {
    const expenses = await prisma.expense.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
    });

    return expenses.map(mapExpense);
  },

  async createExpense(expense: Omit<Expense, 'id' | 'created_at'>): Promise<Expense> {
    console.log('expenseService.createExpense called with:', expense);

    try {
      const created = await prisma.expense.create({
        data: {
          userId: expense.user_id,
          amount: expense.amount,
          description: expense.description,
          category: expense.category,
          date: new Date(expense.date),
          notes: expense.notes ?? null,
          receiptUrl: expense.receipt_url ?? null,
          isRecurring: expense.is_recurring ?? false,
          recurringDay: expense.recurring_day ?? null,
        },
      });

      console.log('Expense created successfully:', created.id);
      return mapExpense(created);
    } catch (error) {
      console.error('Prisma createExpense error:', error);
      throw error;
    }
  },

  async updateExpense(id: string, updates: Partial<Expense>): Promise<Expense> {
    const data: any = {};
    if (updates.amount !== undefined) data.amount = updates.amount;
    if (updates.description !== undefined) data.description = updates.description;
    if (updates.category !== undefined) data.category = updates.category;
    if (updates.date !== undefined) data.date = new Date(updates.date);
    if (updates.notes !== undefined) data.notes = updates.notes;
    if (updates.receipt_url !== undefined) data.receiptUrl = updates.receipt_url;
    if (updates.is_recurring !== undefined) data.isRecurring = updates.is_recurring;
    if (updates.recurring_day !== undefined) data.recurringDay = updates.recurring_day;

    const updated = await prisma.expense.update({
      where: { id },
      data,
    });

    return mapExpense(updated);
  },

  async deleteExpense(id: string): Promise<void> {
    await prisma.expense.delete({
      where: { id },
    });
  },

  async getExpensesByDateRange(
    userId: string,
    startDate: string,
    endDate: string
  ): Promise<Expense[]> {
    const expenses = await prisma.expense.findMany({
      where: {
        userId,
        date: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
      },
      orderBy: { date: 'desc' },
    });

    return expenses.map(mapExpense);
  },

  async getExpensesByCategory(userId: string, category: string): Promise<Expense[]> {
    const expenses = await prisma.expense.findMany({
      where: {
        userId,
        category,
      },
      orderBy: { date: 'desc' },
    });

    return expenses.map(mapExpense);
  },
};
