export interface Expense {
  id: string;
  userId: string;
  amount: number;
  description: string;
  category: string;
  date: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateExpenseInput {
  amount: number;
  description: string;
  category: string;
  date?: string;
}

export interface UpdateExpenseInput {
  amount?: number;
  description?: string;
  category?: string;
  date?: string;
}

const API_BASE_URL = '/api/expenses/new';

/**
 * Get all expenses for the authenticated user
 */
export async function getExpenses(): Promise<Expense[]> {
  const response = await fetch(API_BASE_URL, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch expenses');
  }

  const data = await response.json();
  return data.expenses;
}

/**
 * Get a single expense by ID
 */
export async function getExpenseById(id: string): Promise<Expense> {
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch expense');
  }

  const data = await response.json();
  return data.expense;
}

/**
 * Create a new expense
 */
export async function createExpense(input: CreateExpenseInput): Promise<Expense> {
  const response = await fetch(API_BASE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create expense');
  }

  const data = await response.json();
  return data.expense;
}

/**
 * Update an existing expense
 */
export async function updateExpense(id: string, input: UpdateExpenseInput): Promise<Expense> {
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update expense');
  }

  const data = await response.json();
  return data.expense;
}

/**
 * Delete an expense
 */
export async function deleteExpense(id: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete expense');
  }
}
