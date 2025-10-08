import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { foodReviewService } from '@/services/food-review/service';

export const runtime = 'edge';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const review = await foodReviewService.getReview(params.id, user.id);
    if (!review) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    }
    return NextResponse.json(review);
  } catch (error) {
    console.error('Error fetching food review:', error);
    return NextResponse.json({ error: 'Failed to fetch food review' }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const review = await foodReviewService.updateReview(params.id, user.id, body);
    return NextResponse.json(review);
  } catch (error) {
    console.error('Error updating food review:', error);
    return NextResponse.json({ error: 'Failed to update food review' }, { status: 500 });
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

  try {
    await foodReviewService.deleteReview(params.id, user.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting food review:', error);
    return NextResponse.json({ error: 'Failed to delete food review' }, { status: 500 });
  }
}
