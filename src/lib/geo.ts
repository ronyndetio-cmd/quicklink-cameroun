import { CITIES, findCity } from '../data/cities';
import type { Lang } from '../types';

export const NEARBY_RADIUS_KM = 40;

const DOUALA = { lat: 4.0511, lng: 9.7679 };

function hash(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

/** Deterministic jitter around a city centre so listings in the same town don't stack exactly. */
export function coordsFor(city?: string, area?: string, seed = ''): { lat: number; lng: number } {
  const base = findCity(city) ?? DOUALA;
  const h = hash(`${city ?? ''}|${area ?? ''}|${seed}`);
  const jitterLat = (((h % 1000) / 1000) - 0.5) * 0.09;
  const jitterLng = ((((h >> 10) % 1000) / 1000) - 0.5) * 0.09;
  return { lat: base.lat + jitterLat, lng: base.lng + jitterLng };
}

export function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/** Nearest known town to a GPS fix — used to seed the "home city" on first load. */
export function reverseGeocode(lat: number, lng: number): { city: string; area: string } {
  let best = CITIES[0];
  let bestDist = Infinity;
  for (const c of CITIES) {
    const d = haversineKm(lat, lng, c.lat, c.lng);
    if (d < bestDist) {
      bestDist = d;
      best = c;
    }
  }
  return { city: best.name, area: 'Centre-ville' };
}

export function formatDistance(km: number, lang: Lang): string {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  const value = km.toFixed(1);
  return `${lang === 'fr' ? value.replace('.', ',') : value} km`;
}
