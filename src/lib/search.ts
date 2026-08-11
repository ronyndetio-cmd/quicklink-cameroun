import type { ServiceOffer, Task } from '../types';
import { CATEGORIES } from '../data/categories';
import { PROFESSIONS } from '../data/professions';

function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .trim();
}

// Free-text query keywords that don't literally appear in a category name.
const SYNONYMS: Record<string, string[]> = {
  fuite: ['plumbing'],
  robinet: ['plumbing'],
  tuyau: ['plumbing'],
  eau: ['plumbing'],
  leak: ['plumbing'],
  pipe: ['plumbing'],
  courant: ['electrical'],
  panne: ['electrical', 'appliance_repair', 'mechanics'],
  disjoncteur: ['electrical'],
  power: ['electrical'],
  benskin: ['driving'],
  moto: ['driving', 'mechanics'],
  taxi: ['driving'],
  chauffeur: ['driving'],
  ecran: ['phone_repair', 'it_repair', 'electronics_repair'],
  screen: ['phone_repair', 'it_repair', 'electronics_repair'],
  telephone: ['phone_repair'],
  phone: ['phone_repair'],
  ordinateur: ['it_repair'],
  laptop: ['it_repair'],
  coiffure: ['hairdressing'],
  tresse: ['hairdressing'],
  braid: ['hairdressing'],
  couture: ['tailoring'],
  couturier: ['tailoring'],
  tailor: ['tailoring'],
  mecanicien: ['mechanics'],
  mechanic: ['mechanics'],
  peinture: ['painting'],
  paint: ['painting'],
  macon: ['masonry'],
  beton: ['masonry'],
  soudure: ['welding'],
  weld: ['welding'],
  nettoyage: ['cleaning'],
  menage: ['cleaning'],
  clean: ['cleaning'],
  blanchisserie: ['cleaning'],
  laundry: ['cleaning'],
  jardin: ['gardening'],
  garden: ['gardening'],
  nounou: ['childcare'],
  nanny: ['childcare'],
  babysitter: ['childcare'],
  photographe: ['photography'],
  photographer: ['photography'],
  dj: ['music_events'],
  musicien: ['music_events'],
  securite: ['security'],
  security: ['security'],
  gardien: ['security'],
  wifi: ['networking'],
  reseau: ['networking'],
  internet: ['networking'],
  carrelage: ['tiling'],
  tile: ['tiling'],
  frigo: ['appliance_repair', 'ac_refrigeration'],
  fridge: ['appliance_repair', 'ac_refrigeration'],
  clim: ['ac_refrigeration'],
  ac: ['ac_refrigeration'],
  glace: ['ac_refrigeration'],
  massage: ['wellness'],
  infirmier: ['wellness'],
  nurse: ['wellness'],
  cordonnier: ['shoe_repair'],
  chaussure: ['shoe_repair'],
  shoe: ['shoe_repair'],
  meuble: ['furniture', 'carpentry'],
  furniture: ['furniture', 'carpentry'],
  chien: ['pet_care'],
  dog: ['pet_care'],
  demenagement: ['moving'],
  moving: ['moving'],
  traiteur: ['catering'],
  cuisine: ['catering'],
  cooking: ['catering'],
  cours: ['tutoring'],
  tutor: ['tutoring'],
};

/**
 * Widens a free-text query into candidate category ids via synonyms,
 * category/subcategory names, and the profession list — used to broaden a
 * search before `scoreMatch` narrows it back down.
 */
export function relatedCategories(query: string): string[] {
  const q = normalize(query || '');
  if (!q) return [];
  const ids = new Set<string>();

  for (const [key, cats] of Object.entries(SYNONYMS)) {
    if (q.includes(key)) cats.forEach((c) => ids.add(c));
  }

  for (const cat of CATEGORIES) {
    const names = [cat.name, cat.nameFr, ...(cat.subcategories ?? []), ...(cat.subcategoriesFr ?? [])].map(
      normalize,
    );
    if (names.some((n) => n && (n.includes(q) || q.includes(n)))) ids.add(cat.id);
  }

  for (const [en, fr, catId] of PROFESSIONS) {
    if (normalize(en).includes(q) || normalize(fr).includes(q)) ids.add(catId);
  }

  return [...ids];
}

function haystackOf(item: Task | ServiceOffer): string {
  const service = item as ServiceOffer;
  return normalize(
    [item.title, item.description, item.category, item.subCategory, service.specialty].filter(Boolean).join(' '),
  );
}

/** Field-weighted relevance score; 0 or less means "excluded from results". */
export function scoreMatch(item: Task | ServiceOffer, query: string, related: string[]): number {
  const q = normalize(query || '');
  if (!q) return 1;

  const haystack = haystackOf(item);
  let score = 0;
  if (haystack.includes(q)) score += 10;

  for (const word of q.split(/\s+/)) {
    if (word.length > 1 && haystack.includes(word)) score += 3;
  }

  if (related.includes(item.category)) score += 5;

  return score;
}

export const POPULAR_SEARCHES: { fr: string; en: string; category: string }[] = [
  { fr: 'Fuite d’eau', en: 'Water leak', category: 'plumbing' },
  { fr: 'Coupure de courant', en: 'Power cut', category: 'electrical' },
  { fr: 'Écran cassé', en: 'Broken screen', category: 'phone_repair' },
  { fr: 'Tresses', en: 'Hair braiding', category: 'hairdressing' },
  { fr: 'Couture', en: 'Tailoring', category: 'tailoring' },
  { fr: 'Déménagement', en: 'House moving', category: 'moving' },
  { fr: 'Climatisation', en: 'AC repair', category: 'ac_refrigeration' },
  { fr: 'Ménage', en: 'House cleaning', category: 'cleaning' },
];
