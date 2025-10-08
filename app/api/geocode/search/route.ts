import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q') || '';
  if (!q || q.length < 1) {
    return NextResponse.json({ results: [] });
  }

  const key = process.env.GOOGLE_MAPS_API_KEY;
  if (!key) {
    return NextResponse.json(
      { error: 'Google Maps API key not configured', results: [] },
      { status: 500 }
    );
  }

  try {
    const url = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${encodeURIComponent(
      q
    )}&inputtype=textquery&fields=place_id,name,formatted_address,geometry&language=en&key=${key}`;

    const res = await fetch(url);
    if (!res.ok) {
      const text = await res.text();
      console.error('Google Places error', res.status, text);
      return NextResponse.json(
        { error: 'Google Places request failed', results: [] },
        { status: 502 }
      );
    }

    const data = await res.json();
    const results = (data.candidates || []).map((item: any) => ({
      place_id: item.place_id,
      name: item.name,
      formatted_address: item.formatted_address,
      geometry: item.geometry,
    }));

    return NextResponse.json({ results });
  } catch (error) {
    console.error('Error proxying Google Places:', error);
    return NextResponse.json({ error: 'Internal error', results: [] }, { status: 500 });
  }
}
