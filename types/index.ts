export interface User {
  id: string;
  email: string;
  created_at: string;
}

export interface Expense {
  id: string;
  user_id: string;
  amount: number;
  description: string;
  category: string;
  date: string;
  created_at: string;
  updated_at?: string;
}

export interface Category {
  id: string;
  name: string;
  icon?: string;
  color?: string;
}

export interface ExpenseSummary {
  total: number;
  count: number;
  average: number;
  byCategory: Record<string, number>;
  byMonth: Record<string, { total: number; count: number }>;
}

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

export interface DialogProps {
  open: boolean;
  onClose: () => void;
}
