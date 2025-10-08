import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { expenseService } from '@/services/expense/service';

export const runtime = 'edge';

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const expenses = await expenseService.fetchExpenses(user.id);
    return NextResponse.json(expenses);
  } catch (error) {
    console.error('Error fetching expenses:', error);
    return NextResponse.json({ error: 'Failed to fetch expenses' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { amount, description, category, date, notes, receiptUrl, isRecurring, recurringDay } =
    body;

  console.log('POST /api/expenses - Request body:', body);

  if (!amount || !description || !category || !date) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  try {
    const expenseData = {
      user_id: user.id,
      amount: parseFloat(amount),
      description,
      category,
      date,
      notes: notes || null,
      receipt_url: receiptUrl || null,
      is_recurring: Boolean(isRecurring),
      recurring_day: recurringDay ? parseInt(recurringDay) : null,
    };

    console.log('Creating expense with data:', expenseData);
    const expense = await expenseService.createExpense(expenseData);

    return NextResponse.json(expense);
  } catch (error) {
    console.error('Error creating expense:', error);
    console.error('Error details:', error instanceof Error ? error.message : error);
    return NextResponse.json(
      {
        error: 'Failed to create expense',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
