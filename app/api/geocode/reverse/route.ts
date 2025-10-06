import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get('lat');
  const lon = searchParams.get('lon');

  if (!lat || !lon) {
    return NextResponse.json({ result: null });
  }

  const key = process.env.GOOGLE_MAPS_API_KEY;
  if (!key) {
    return NextResponse.json(
      { error: 'Google Maps API key not configured', result: null },
      { status: 500 }
    );
  }

  try {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${encodeURIComponent(
      lat + ',' + lon
    )}&key=${key}`;

    const res = await fetch(url);
    if (!res.ok) {
      const text = await res.text();
      console.error('Google Geocode error', res.status, text);
      return NextResponse.json(
        { error: 'Google Geocode request failed', result: null },
        { status: 502 }
      );
    }

    const data = await res.json();
    const result = data.results && data.results[0] ? data.results[0] : null;
    return NextResponse.json({ result });
  } catch (error) {
    console.error('Error proxying Google Geocode:', error);
    return NextResponse.json({ error: 'Internal error', result: null }, { status: 500 });
  }
}
