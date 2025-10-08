import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  getFoodToTryItem,
  updateFoodToTryItem,
  deleteFoodToTryItem,
} from '@/services/food-to-try/service';

export const runtime = 'edge';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const item = await getFoodToTryItem(params.id, user.id);
    return NextResponse.json(item);
  } catch (error) {
    console.error('Error fetching food to try item:', error);
    return NextResponse.json({ error: 'Failed to fetch food to try item' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
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
    const item = await updateFoodToTryItem(params.id, body, user.id);

    return NextResponse.json(item);
  } catch (error) {
    console.error('Error updating food to try item:', error);
    return NextResponse.json({ error: 'Failed to update food to try item' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await deleteFoodToTryItem(params.id, user.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting food to try item:', error);
    return NextResponse.json({ error: 'Failed to delete food to try item' }, { status: 500 });
  }
}
