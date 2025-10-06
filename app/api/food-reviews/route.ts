import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { foodReviewService } from '@/services/food-review/service';

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const reviews = await foodReviewService.fetchReviews(user.id);
    return NextResponse.json(reviews);
  } catch (error) {
    console.error('Error fetching food reviews:', error);
    return NextResponse.json({ error: 'Failed to fetch food reviews' }, { status: 500 });
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

  try {
    const body = await request.json();
    const review = await foodReviewService.createReview(user.id, body);
    return NextResponse.json(review);
  } catch (error) {
    console.error('Error creating food review:', error);
    return NextResponse.json(
      {
        error: 'Failed to create food review',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
