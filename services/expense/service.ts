import { createClient } from '@/lib/supabase/client';
import { Expense } from '@/stores/expense/store';

export const expenseService = {
  async fetchExpenses(userId: string): Promise<Expense[]> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async createExpense(expense: Omit<Expense, 'id' | 'created_at'>): Promise<Expense> {
    const supabase = createClient();
    const { data, error } = await supabase.from('expenses').insert([expense]).select().single();

    if (error) throw error;
    return data;
  },

  async updateExpense(id: string, updates: Partial<Expense>): Promise<Expense> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('expenses')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteExpense(id: string): Promise<void> {
    const supabase = createClient();
    const { error } = await supabase.from('expenses').delete().eq('id', id);

    if (error) throw error;
  },

  async getExpensesByDateRange(
    userId: string,
    startDate: string,
    endDate: string
  ): Promise<Expense[]> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .eq('user_id', userId)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getExpensesByCategory(userId: string, category: string): Promise<Expense[]> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .eq('user_id', userId)
      .eq('category', category)
      .order('date', { ascending: false });

    if (error) throw error;
    return data || [];
  },
};
