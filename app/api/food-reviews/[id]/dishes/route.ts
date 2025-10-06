import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { foodReviewService } from '@/services/food-review/service';

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const dish = await foodReviewService.addDish(params.id, user.id, body);
    return NextResponse.json(dish);
  } catch (error) {
    console.error('Error adding dish:', error);
    return NextResponse.json(
      {
        error: 'Failed to add dish',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
