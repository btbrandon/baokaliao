/**
 * Geocoding utilities backed by Google Maps via server-side proxy routes.
 * The client calls local /api/geocode/* endpoints which keep the API key server-side.
 */

export interface GeocodingResult {
  place_id: string;
  name: string;
  display_name: string;
  lat: number;
  lon: number;
  address?: {
    amenity?: string;
    road?: string;
    suburb?: string;
    city?: string;
    postcode?: string;
    country?: string;
  };
}

/**
 * Search for places using Nominatim
 * Supports: addresses, postal codes, place names, coordinates
 */
export async function searchPlaces(query: string, limit: number = 5): Promise<GeocodingResult[]> {
  if (!query || query.length < 3) return [];

  try {
    const res = await fetch(`/api/geocode/search?` + new URLSearchParams({ q: query, limit: String(limit) }));
    if (!res.ok) throw new Error('Geocoding proxy failed');
    const data = await res.json();
    return (data.results || []).map((item: any) => ({
      place_id: item.place_id,
      name: item.name,
      display_name: item.formatted_address || item.name,
      lat: item.geometry?.location?.lat ?? item.geometry?.location?.lat ?? 0,
      lon: item.geometry?.location?.lng ?? item.geometry?.location?.lng ?? 0,
      address: undefined,
    }));
  } catch (error) {
    console.error('Error searching places:', error);
    return [];
  }
}

/**
 * Reverse geocode coordinates to get address
 */
export async function reverseGeocode(lat: number, lon: number): Promise<GeocodingResult | null> {
  try {
    const res = await fetch(`/api/geocode/reverse?` + new URLSearchParams({ lat: String(lat), lon: String(lon) }));
    if (!res.ok) throw new Error('Reverse geocode proxy failed');
    const data = await res.json();
    const item = data.result;
    if (!item) return null;
    return {
      place_id: item.place_id ?? item.place_id?.toString() ?? '0',
      name: item.formatted_address || (item.address_components && item.address_components[0]?.long_name) || '',
      display_name: item.formatted_address || '',
      lat: typeof item.geometry?.location?.lat === 'number' ? item.geometry.location.lat : parseFloat(item.geometry.location.lat),
      lon: typeof item.geometry?.location?.lng === 'number' ? item.geometry.location.lng : parseFloat(item.geometry.location.lng),
      address: undefined,
    };
  } catch (error) {
    console.error('Error reverse geocoding:', error);
    return null;
  }
}

/**
 * Format address from geocoding result
 */
export function formatAddress(result: GeocodingResult): string {
  if (result.address) {
    const parts = [
      result.address.amenity,
      result.address.road,
      result.address.suburb,
      result.address.city,
      result.address.postcode,
      result.address.country,
    ].filter(Boolean);
    return parts.join(', ');
  }
  return result.display_name;
}

/**
 * Validate coordinates
 */
export function isValidCoordinates(lat: number, lon: number): boolean {
  return lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180;
}
