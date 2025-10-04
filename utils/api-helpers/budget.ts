export interface BudgetAllocation {
  category: string;
  percentage: number;
  amount: number;
}

export interface Budget {
  id: string;
  userId: string;
  monthlyIncome: number;
  allocations: BudgetAllocation[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateBudgetInput {
  monthlyIncome: number;
  expensesPercentage: number;
  investmentsPercentage: number;
  savingsPercentage: number;
  otherPercentage: number;
}

const API_BASE_URL = '/api/budget';

/**
 * Get budget for the authenticated user
 */
export async function getBudget(): Promise<Budget | null> {
  const response = await fetch(API_BASE_URL, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch budget');
  }

  const data = await response.json();
  return data.budget;
}

/**
 * Create or update budget for the authenticated user
 */
export async function saveBudget(input: CreateBudgetInput): Promise<Budget> {
  const response = await fetch(API_BASE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to save budget');
  }

  const data = await response.json();
  return data.budget;
}

/**
 * Delete budget for the authenticated user
 */
export async function deleteBudget(): Promise<void> {
  const response = await fetch(API_BASE_URL, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete budget');
  }
}
