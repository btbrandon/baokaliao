import { prisma } from '@/lib/prisma';

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
  updated_at: string;
}

export const budgetService = {
  async fetchBudgetByMonth(userId: string, month: number, year: number): Promise<Budget | null> {
    const budget = await prisma.budget.findUnique({
      where: {
        userId_month_year: {
          userId,
          month,
          year,
        },
      },
    });

    if (!budget) return null;

    return {
      id: budget.id,
      user_id: budget.userId,
      month: budget.month,
      year: budget.year,
      monthly_income: budget.monthlyIncome.toNumber(),
      expenses_percentage: budget.expensesPercentage.toNumber(),
      investments_percentage: budget.investmentsPercentage.toNumber(),
      savings_percentage: budget.savingsPercentage.toNumber(),
      other_percentage: budget.otherPercentage.toNumber(),
      is_recurring: budget.isRecurring,
      created_at: budget.createdAt.toISOString(),
      updated_at: budget.updatedAt.toISOString(),
    };
  },

  async fetchCurrentMonthBudget(userId: string): Promise<Budget | null> {
    const now = new Date();
    const month = now.getMonth() + 1; // 1-12
    const year = now.getFullYear();
    return this.fetchBudgetByMonth(userId, month, year);
  },

  async fetchBudgetsByYear(userId: string, year?: number): Promise<Budget[]> {
    const budgets = await prisma.budget.findMany({
      where: {
        userId,
        ...(year ? { year } : {}),
      },
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
    });

    return budgets.map(
      (b: any): Budget => ({
        id: b.id,
        user_id: b.userId,
        month: b.month,
        year: b.year,
        monthly_income: b.monthlyIncome.toNumber(),
        expenses_percentage: b.expensesPercentage.toNumber(),
        investments_percentage: b.investmentsPercentage.toNumber(),
        savings_percentage: b.savingsPercentage.toNumber(),
        other_percentage: b.otherPercentage.toNumber(),
        is_recurring: b.isRecurring,
        created_at: b.createdAt.toISOString(),
        updated_at: b.updatedAt.toISOString(),
      })
    );
  },

  async fetchRecurringTemplate(userId: string): Promise<Budget | null> {
    const budget = await prisma.budget.findFirst({
      where: {
        userId,
        isRecurring: true,
      },
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
    });

    if (!budget) return null;

    return {
      id: budget.id,
      user_id: budget.userId,
      month: budget.month,
      year: budget.year,
      monthly_income: budget.monthlyIncome.toNumber(),
      expenses_percentage: budget.expensesPercentage.toNumber(),
      investments_percentage: budget.investmentsPercentage.toNumber(),
      savings_percentage: budget.savingsPercentage.toNumber(),
      other_percentage: budget.otherPercentage.toNumber(),
      is_recurring: budget.isRecurring,
      created_at: budget.createdAt.toISOString(),
      updated_at: budget.updatedAt.toISOString(),
    };
  },

  async createBudget(budget: {
    user_id: string;
    month: number;
    year: number;
    monthly_income: number;
    expenses_percentage: number;
    investments_percentage: number;
    savings_percentage: number;
    other_percentage: number;
    is_recurring?: boolean;
  }): Promise<Budget> {
    // Validate percentages
    const total =
      budget.expenses_percentage +
      budget.investments_percentage +
      budget.savings_percentage +
      budget.other_percentage;

    if (Math.abs(total - 100) > 0.01) {
      throw new Error('Percentages must total 100');
    }

    // Validate month
    if (budget.month < 1 || budget.month > 12) {
      throw new Error('Month must be between 1 and 12');
    }

    const created = await prisma.budget.create({
      data: {
        userId: budget.user_id,
        month: budget.month,
        year: budget.year,
        monthlyIncome: budget.monthly_income,
        expensesPercentage: budget.expenses_percentage,
        investmentsPercentage: budget.investments_percentage,
        savingsPercentage: budget.savings_percentage,
        otherPercentage: budget.other_percentage,
        isRecurring: budget.is_recurring ?? false,
      },
    });

    return {
      id: created.id,
      user_id: created.userId,
      month: created.month,
      year: created.year,
      monthly_income: created.monthlyIncome.toNumber(),
      expenses_percentage: created.expensesPercentage.toNumber(),
      investments_percentage: created.investmentsPercentage.toNumber(),
      savings_percentage: created.savingsPercentage.toNumber(),
      other_percentage: created.otherPercentage.toNumber(),
      is_recurring: created.isRecurring,
      created_at: created.createdAt.toISOString(),
      updated_at: created.updatedAt.toISOString(),
    };
  },

  async updateBudget(
    userId: string,
    month: number,
    year: number,
    updates: {
      monthly_income?: number;
      expenses_percentage?: number;
      investments_percentage?: number;
      savings_percentage?: number;
      other_percentage?: number;
      is_recurring?: boolean;
    }
  ): Promise<Budget> {
    // If percentages are being updated, validate they total 100
    if (
      updates.expenses_percentage !== undefined ||
      updates.investments_percentage !== undefined ||
      updates.savings_percentage !== undefined ||
      updates.other_percentage !== undefined
    ) {
      // Fetch current budget to get existing percentages
      const currentBudget = await this.fetchBudgetByMonth(userId, month, year);
      if (!currentBudget) {
        throw new Error('Budget not found');
      }

      const total =
        (updates.expenses_percentage ?? currentBudget.expenses_percentage) +
        (updates.investments_percentage ?? currentBudget.investments_percentage) +
        (updates.savings_percentage ?? currentBudget.savings_percentage) +
        (updates.other_percentage ?? currentBudget.other_percentage);

      if (Math.abs(total - 100) > 0.01) {
        throw new Error('Percentages must total 100');
      }
    }

    const data: any = {};
    if (updates.monthly_income !== undefined) data.monthlyIncome = updates.monthly_income;
    if (updates.expenses_percentage !== undefined)
      data.expensesPercentage = updates.expenses_percentage;
    if (updates.investments_percentage !== undefined)
      data.investmentsPercentage = updates.investments_percentage;
    if (updates.savings_percentage !== undefined)
      data.savingsPercentage = updates.savings_percentage;
    if (updates.other_percentage !== undefined) data.otherPercentage = updates.other_percentage;
    if (updates.is_recurring !== undefined) data.isRecurring = updates.is_recurring;

    const updated = await prisma.budget.update({
      where: {
        userId_month_year: {
          userId,
          month,
          year,
        },
      },
      data,
    });

    return {
      id: updated.id,
      user_id: updated.userId,
      month: updated.month,
      year: updated.year,
      monthly_income: updated.monthlyIncome.toNumber(),
      expenses_percentage: updated.expensesPercentage.toNumber(),
      investments_percentage: updated.investmentsPercentage.toNumber(),
      savings_percentage: updated.savingsPercentage.toNumber(),
      other_percentage: updated.otherPercentage.toNumber(),
      is_recurring: updated.isRecurring,
      created_at: updated.createdAt.toISOString(),
      updated_at: updated.updatedAt.toISOString(),
    };
  },

  async upsertBudget(budget: {
    user_id: string;
    month: number;
    year: number;
    monthly_income: number;
    expenses_percentage: number;
    investments_percentage: number;
    savings_percentage: number;
    other_percentage: number;
    is_recurring?: boolean;
  }): Promise<Budget> {
    const existing = await this.fetchBudgetByMonth(budget.user_id, budget.month, budget.year);

    if (existing) {
      return this.updateBudget(budget.user_id, budget.month, budget.year, {
        monthly_income: budget.monthly_income,
        expenses_percentage: budget.expenses_percentage,
        investments_percentage: budget.investments_percentage,
        savings_percentage: budget.savings_percentage,
        other_percentage: budget.other_percentage,
        is_recurring: budget.is_recurring,
      });
    } else {
      return this.createBudget(budget);
    }
  },

  async deleteBudget(userId: string, month: number, year: number): Promise<void> {
    await prisma.budget.delete({
      where: {
        userId_month_year: {
          userId,
          month,
          year,
        },
      },
    });
  },

  async createFromTemplate(userId: string, month: number, year: number): Promise<Budget> {
    const template = await this.fetchRecurringTemplate(userId);

    if (!template) {
      throw new Error('No recurring budget template found');
    }

    return this.createBudget({
      user_id: userId,
      month,
      year,
      monthly_income: template.monthly_income,
      expenses_percentage: template.expenses_percentage,
      investments_percentage: template.investments_percentage,
      savings_percentage: template.savings_percentage,
      other_percentage: template.other_percentage,
      is_recurring: false,
    });
  },

  async getOrCreateBudget(userId: string, month: number, year: number): Promise<Budget | null> {
    let budget = await this.fetchBudgetByMonth(userId, month, year);

    if (!budget) {
      const template = await this.fetchRecurringTemplate(userId);
      if (template) {
        budget = await this.createFromTemplate(userId, month, year);
      }
    }

    return budget;
  },

  async copyBudgetToMonths(
    userId: string,
    sourceMonth: number,
    sourceYear: number,
    targetMonths: Array<{ month: number; year: number }>
  ): Promise<Budget[]> {
    const sourceBudget = await this.fetchBudgetByMonth(userId, sourceMonth, sourceYear);

    if (!sourceBudget) {
      throw new Error('Source budget not found');
    }

    const results: Budget[] = [];

    for (const target of targetMonths) {
      const budget = await this.upsertBudget({
        user_id: userId,
        month: target.month,
        year: target.year,
        monthly_income: sourceBudget.monthly_income,
        expenses_percentage: sourceBudget.expenses_percentage,
        investments_percentage: sourceBudget.investments_percentage,
        savings_percentage: sourceBudget.savings_percentage,
        other_percentage: sourceBudget.other_percentage,
        is_recurring: false,
      });
      results.push(budget);
    }

    return results;
  },
};
