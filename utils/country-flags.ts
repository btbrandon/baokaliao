// Country name to flag emoji mapping
export function getCountryFlag(country: string | null | undefined): string {
  if (!country) return '🏳️';

  const countryName = country.toLowerCase().trim();

  const countryFlags: Record<string, string> = {
    // Asia
    singapore: '🇸🇬',
    malaysia: '🇲🇾',
    japan: '🇯🇵',
    china: '🇨🇳',
    'hong kong': '🇭🇰',
    korea: '🇰🇷',
    'south korea': '🇰🇷',
    'north korea': '🇰🇵',
    thailand: '🇹🇭',
    vietnam: '🇻🇳',
    indonesia: '🇮🇩',
    philippines: '🇵🇭',
    india: '🇮🇳',
    taiwan: '🇹🇼',
    myanmar: '🇲🇲',
    cambodia: '🇰🇭',
    laos: '🇱🇦',
    bangladesh: '🇧🇩',
    pakistan: '🇵🇰',
    'sri lanka': '🇱🇰',
    nepal: '🇳🇵',
    macau: '🇲🇴',

    // Europe
    france: '🇫🇷',
    italy: '🇮🇹',
    spain: '🇪🇸',
    germany: '🇩🇪',
    'united kingdom': '🇬🇧',
    uk: '🇬🇧',
    england: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
    scotland: '🏴󠁧󠁢󠁳󠁣󠁴󠁿',
    wales: '🏴󠁧󠁢󠁷󠁬󠁳󠁿',
    portugal: '🇵🇹',
    greece: '🇬🇷',
    netherlands: '🇳🇱',
    belgium: '🇧🇪',
    switzerland: '🇨🇭',
    austria: '🇦🇹',
    poland: '🇵🇱',
    sweden: '🇸🇪',
    norway: '🇳🇴',
    denmark: '🇩🇰',
    finland: '🇫🇮',
    ireland: '🇮🇪',
    russia: '🇷🇺',
    turkey: '🇹🇷',

    // Americas
    'united states': '🇺🇸',
    usa: '🇺🇸',
    'united states of america': '🇺🇸',
    canada: '🇨🇦',
    mexico: '🇲🇽',
    brazil: '🇧🇷',
    argentina: '🇦🇷',
    chile: '🇨🇱',
    peru: '🇵🇪',
    colombia: '🇨🇴',

    // Middle East
    'saudi arabia': '🇸🇦',
    'united arab emirates': '🇦🇪',
    uae: '🇦🇪',
    dubai: '🇦🇪',
    'abu dhabi': '🇦🇪',
    israel: '🇮🇱',
    lebanon: '🇱🇧',
    iran: '🇮🇷',
    iraq: '🇮🇶',
    jordan: '🇯🇴',
    qatar: '🇶🇦',
    kuwait: '🇰🇼',

    // Oceania
    australia: '🇦🇺',
    'new zealand': '🇳🇿',

    // Africa
    'south africa': '🇿🇦',
    egypt: '🇪🇬',
    morocco: '🇲🇦',
    nigeria: '🇳🇬',
    kenya: '🇰🇪',
    ethiopia: '🇪🇹',
  };

  return countryFlags[countryName] || '🏳️';
}

// Extract country from location string
export function extractCountry(location: string | null | undefined): string | null {
  if (!location) return null;

  const parts = location.split(',').map((p) => p.trim());
  const lastPart = parts[parts.length - 1];

  // If last part looks like a postal code or address, try second to last
  if (lastPart && /^\d+$/.test(lastPart) && parts.length > 1) {
    return parts[parts.length - 2];
  }

  return lastPart;
}

// Cuisine to flag emoji mapping
export function getCuisineFlag(cuisine: string | null | undefined): string {
  if (!cuisine) return '🍽️';

  const cuisineName = cuisine.toLowerCase().trim();

  const cuisineFlags: Record<string, string> = {
    // Asian cuisines
    japanese: '🇯🇵',
    sushi: '🇯🇵',
    ramen: '🇯🇵',
    korean: '🇰🇷',
    bbq: '🇰🇷',
    'korean bbq': '🇰🇷',
    chinese: '🇨🇳',
    cantonese: '🇭🇰',
    'dim sum': '🇭🇰',
    thai: '🇹🇭',
    vietnamese: '🇻🇳',
    pho: '🇻🇳',
    indonesian: '🇮🇩',
    malaysian: '🇲🇾',
    singaporean: '🇸🇬',
    indian: '🇮🇳',
    filipino: '🇵🇭',
    taiwanese: '🇹🇼',
    burmese: '🇲🇲',
    cambodian: '🇰🇭',
    laotian: '🇱🇦',

    // European cuisines
    italian: '🇮🇹',
    pizza: '🇮🇹',
    pasta: '🇮🇹',
    french: '🇫🇷',
    spanish: '🇪🇸',
    tapas: '🇪🇸',
    german: '🇩🇪',
    british: '🇬🇧',
    'fish and chips': '🇬🇧',
    portuguese: '🇵🇹',
    greek: '🇬🇷',
    dutch: '🇳🇱',
    belgian: '🇧🇪',
    swiss: '🇨🇭',
    austrian: '🇦🇹',
    polish: '🇵🇱',
    swedish: '🇸🇪',
    norwegian: '🇳🇴',
    danish: '🇩🇰',
    finnish: '🇫🇮',
    irish: '🇮🇪',
    russian: '🇷🇺',
    turkish: '🇹🇷',
    kebab: '🇹🇷',

    // American cuisines
    american: '🇺🇸',
    burger: '🇺🇸',
    'hot dog': '🇺🇸',
    'american bbq': '🇺🇸',
    mexican: '🇲🇽',
    tacos: '🇲🇽',
    brazilian: '🇧🇷',
    argentinian: '🇦🇷',
    peruvian: '🇵🇪',
    colombian: '🇨🇴',
    cuban: '🇨🇺',
    canadian: '🇨🇦',

    // Middle Eastern cuisines
    'middle eastern': '🇸🇦',
    arabian: '🇸🇦',
    lebanese: '🇱🇧',
    israeli: '🇮🇱',
    persian: '🇮🇷',
    egyptian: '🇪🇬',
    moroccan: '🇲🇦',

    // Other cuisines
    african: '🌍',
    ethiopian: '🇪🇹',
    'south african': '🇿🇦',
    caribbean: '🏝️',
    jamaican: '🇯🇲',
    fusion: '🌐',
    international: '🌐',
    seafood: '🦞',
    steakhouse: '🥩',
    vegetarian: '🥬',
    vegan: '🌱',
    cafe: '☕',
    bakery: '🥖',
    dessert: '🍰',
    'ice cream': '🍦',
  };

  return cuisineFlags[cuisineName] || '🍽️';
}
