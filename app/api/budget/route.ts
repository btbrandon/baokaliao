import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { budgetService } from '@/services/budget/service';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const month = searchParams.get('month');
    const year = searchParams.get('year');

    // If month and year provided, get specific month
    if (month && year) {
      const budget = await budgetService.fetchBudgetByMonth(
        user.id,
        parseInt(month),
        parseInt(year)
      );

      if (!budget) {
        return NextResponse.json({ error: 'Budget not found' }, { status: 404 });
      }

      return NextResponse.json(budget);
    }

    // Otherwise get current month
    const budget = await budgetService.fetchCurrentMonthBudget(user.id);

    if (!budget) {
      return NextResponse.json({ error: 'Budget not found' }, { status: 404 });
    }

    return NextResponse.json(budget);
  } catch (error) {
    console.error('Error fetching budget:', error);
    return NextResponse.json({ error: 'Failed to fetch budget' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      month,
      year,
      monthly_income,
      expenses_percentage,
      investments_percentage,
      savings_percentage,
      other_percentage,
      is_recurring,
    } = body;

    // Default to current month if not provided
    const now = new Date();
    const targetMonth = month || now.getMonth() + 1;
    const targetYear = year || now.getFullYear();

    if (
      monthly_income === undefined ||
      expenses_percentage === undefined ||
      investments_percentage === undefined ||
      savings_percentage === undefined ||
      other_percentage === undefined
    ) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const budget = await budgetService.upsertBudget({
      user_id: user.id,
      month: parseInt(targetMonth),
      year: parseInt(targetYear),
      monthly_income: parseFloat(monthly_income),
      expenses_percentage: parseFloat(expenses_percentage),
      investments_percentage: parseFloat(investments_percentage),
      savings_percentage: parseFloat(savings_percentage),
      other_percentage: parseFloat(other_percentage),
      is_recurring: is_recurring ?? false,
    });

    return NextResponse.json(budget, { status: 201 });
  } catch (error) {
    console.error('Error saving budget:', error);
    const message = error instanceof Error ? error.message : 'Failed to save budget';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  return POST(request);
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const month = searchParams.get('month');
    const year = searchParams.get('year');

    if (!month || !year) {
      return NextResponse.json({ error: 'Month and year are required' }, { status: 400 });
    }

    await budgetService.deleteBudget(user.id, parseInt(month), parseInt(year));

    return NextResponse.json({ message: 'Budget deleted successfully' });
  } catch (error) {
    console.error('Error deleting budget:', error);
    return NextResponse.json({ error: 'Failed to delete budget' }, { status: 500 });
  }
}
