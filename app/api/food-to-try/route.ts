import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getFoodToTryItems, createFoodToTryItem } from '@/services/food-to-try/service';

export const runtime = 'edge';

export async function GET(_request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const items = await getFoodToTryItems(user.id);
    return NextResponse.json(items);
  } catch (error) {
    console.error('Error fetching food to try:', error);
    return NextResponse.json({ error: 'Failed to fetch food to try' }, { status: 500 });
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
    const item = await createFoodToTryItem(body, user.id);

    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    console.error('Error creating food to try:', error);
    return NextResponse.json({ error: 'Failed to create food to try' }, { status: 500 });
  }
}
