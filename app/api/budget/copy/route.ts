import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { budgetService } from '@/services/budget/service';

export const runtime = 'edge';

// POST /api/budget/copy
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
    const { sourceMonth, sourceYear, targetMonths } = body;

    if (!sourceMonth || !sourceYear || !targetMonths || !Array.isArray(targetMonths)) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const results = await budgetService.copyBudgetToMonths(
      user.id,
      parseInt(sourceMonth),
      parseInt(sourceYear),
      targetMonths.map((t: { month: string; year: string }) => ({
        month: parseInt(t.month),
        year: parseInt(t.year),
      }))
    );

    return NextResponse.json({
      message: `Successfully copied budget to ${results.length} month(s)`,
      budgets: results,
    });
  } catch (error) {
    console.error('Error copying budget:', error);
    const message = error instanceof Error ? error.message : 'Failed to copy budget';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
