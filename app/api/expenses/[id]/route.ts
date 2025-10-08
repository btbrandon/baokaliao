import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { expenseService } from '@/services/expense/service';

export const runtime = 'edge';

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { id } = params;

  try {
    const expense = await expenseService.updateExpense(id, {
      ...(body.amount && { amount: parseFloat(body.amount) }),
      ...(body.description && { description: body.description }),
      ...(body.category && { category: body.category }),
      ...(body.date && { date: body.date }),
      ...(body.notes !== undefined && { notes: body.notes }),
      ...(body.receiptUrl !== undefined && { receipt_url: body.receiptUrl }),
      ...(body.isRecurring !== undefined && { is_recurring: body.isRecurring }),
      ...(body.recurringDay !== undefined && {
        recurring_day: body.recurringDay ? parseInt(body.recurringDay) : null,
      }),
    });

    return NextResponse.json(expense);
  } catch (error) {
    console.error('Error updating expense:', error);
    return NextResponse.json({ error: 'Failed to update expense' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = params;

  try {
    await expenseService.deleteExpense(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting expense:', error);
    return NextResponse.json({ error: 'Failed to delete expense' }, { status: 500 });
  }
}
