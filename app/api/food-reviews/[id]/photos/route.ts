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
    const { photoUrls } = body;
    await foodReviewService.addPhotos(params.id, user.id, photoUrls);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error adding photos:', error);
    return NextResponse.json(
      {
        error: 'Failed to add photos',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
