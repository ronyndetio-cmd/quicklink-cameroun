import type { ServiceOffer, User } from '../types';
import { regionOf, quartersFor } from '../data/cities';
import { CATEGORY_BY_ID } from '../data/categories';
import { PROFESSIONS } from '../data/professions';
import { avatarFor, workPhoto, hashOf } from './media';
import { coordsFor } from './geo';

type Pool = { male: string[]; female: string[]; last: string[] };

const COASTAL: Pool = {
  male: ['Emmanuel', 'Serge', 'Landry', 'Blaise', 'Armand', 'Cyrille', 'Thierry', 'Guy', 'Roger', 'Didier'],
  female: ['Solange', 'Nadège', 'Chantal', 'Rosine', 'Estelle', 'Clarisse', 'Josiane', 'Sandrine'],
  last: ['Ndoumbé', 'Ebongué', 'Dikoumé', 'Manga', 'Njoh', 'Mouangué', 'Ekwalla', 'Épée', 'Ngando', 'Étamé', 'Mbella', 'Njiké'],
};
const BETI: Pool = {
  male: ['Jean-Paul', 'Hervé', 'Aurélien', 'Bertrand', 'Patrick', 'Vincent', 'Alain', 'Olivier'],
  female: ['Marie-Claire', 'Bernadette', 'Éliane', 'Pélagie', 'Odette', 'Yvonne', 'Carole'],
  last: ['Mvondo', 'Ateba', 'Onana', 'Essomba', 'Bekolo', 'Owona', 'Ndzana', 'Abéga', 'Mballa', 'Zambo', 'Fouda', 'Amougou'],
};
const GRASSFIELDS: Pool = {
  male: ['Rodrigue', 'Franck', 'Steve', 'Ulrich', 'Willy', 'Cédric', 'Boris', 'Arnaud'],
  female: ['Ghislaine', 'Laure', 'Nathalie', 'Viviane', 'Flore', 'Michèle'],
  last: ['Kamdem', 'Kouam', 'Fotso', 'Nana', 'Kamga', 'Tagne', 'Tchinda', 'Wandji', 'Sop', 'Feuko', 'Fonkou', 'Djoumessi'],
};
const ANGLO: Pool = {
  male: ['Nfor', 'Divine', 'Terence', 'Godlove', 'Clovis', 'Awah', 'Ndifor', 'Bertrand'],
  female: ['Bih', 'Ngum', 'Grace', 'Comfort', 'Vera', 'Relindis', 'Blessing'],
  last: ['Ngwa', 'Tabi', 'Achidi', 'Nkeng', 'Mbah', 'Fru', 'Anyi', 'Che', 'Ndim', 'Tanjong', 'Ashu'],
};
const SAHEL: Pool = {
  male: ['Amadou', 'Oumarou', 'Ibrahim', 'Aboubakar', 'Souleymane', 'Moussa', 'Hamidou', 'Bello', 'Mahamat'],
  female: ['Aïssatou', 'Fadimatou', 'Amina', 'Hadja', 'Maimouna', 'Djaïli'],
  last: ['Bakary', 'Djibrilla', 'Haman', 'Sali', 'Bouba', 'Yaya', 'Ousmanou', 'Adamou', 'Abdoulaye', 'Alhadji'],
};

function poolFor(region: string): Pool {
  switch (region) {
    case 'Littoral':
      return COASTAL;
    case 'Centre':
    case 'Sud':
    case 'Est':
      return BETI;
    case 'Ouest':
      return GRASSFIELDS;
    case 'Nord-Ouest':
    case 'Sud-Ouest':
      return ANGLO;
    default:
      return SAHEL;
  }
}

const BIO_FR = [
  'Plus de {y} ans sur le terrain. Travail propre, devis clair, aucun acompte avant visite.',
  '{y} ans d’expérience à {city}. Je me déplace dans tout le quartier, même le week-end.',
  'Artisan indépendant depuis {y} ans. Matériel complet, intervention rapide sur {city}.',
  'Équipe de 3 personnes, {y} ans de métier. Je donne toujours une garantie sur le travail fait.',
];
const BIO_EN = [
  'Over {y} years on the job. Clean work, clear quote, no deposit before I visit.',
  '{y} years working in {city}. I move around the whole neighbourhood, weekends included.',
  'Independent artisan for {y} years. Full toolkit, fast call-outs across {city}.',
  'Small team of 3, {y} years in the trade. I always guarantee the work I deliver.',
];

const RATES = ['5 000 – 15 000 FCFA', '10 000 – 25 000 FCFA', '2 500 FCFA / heure', '15 000 – 40 000 FCFA', 'Sur devis', '3 000 FCFA / passage'];

function pick<T>(arr: T[], n: number): T {
  return arr[n % arr.length];
}

export interface GeneratedTechnician {
  user: User;
  service: ServiceOffer;
}

/**
 * Fabricate plausible local technicians for a city+category that has too few
 * real listings, so every town in Cameroon still feels populated.
 */
export function generateTechnicians(
  city: string,
  categoryId: string,
  count: number,
  offset = 0,
): GeneratedTechnician[] {
  const region = regionOf(city);
  const pool = poolFor(region);
  const quarters = quartersFor(city);
  const cat = CATEGORY_BY_ID[categoryId];
  // The two Anglophone regions get English job titles and bios.
  const anglo = region === 'Nord-Ouest' || region === 'Sud-Ouest';
  const color = cat?.color ?? '#1F7A8C';
  const professions = PROFESSIONS.filter((p) => p[2] === categoryId);
  const out: GeneratedTechnician[] = [];

  for (let i = 0; i < count; i++) {
    const idx = offset + i;
    const seed = `${city}|${categoryId}|${idx}`;
    const h = hashOf(seed);
    const isFemale = ['beauty', 'tailoring', 'catering', 'cleaning', 'childcare', 'laundry'].includes(categoryId)
      ? h % 4 !== 0
      : h % 7 === 0;
    const first = isFemale ? pick(pool.female, h) : pick(pool.male, h);
    const last = pick(pool.last, h >> 3);
    const name = `${first} ${last}`;
    const area = pick(quarters, h >> 5);
    const prof = professions.length ? pick(professions, h >> 7) : undefined;
    const specialtyFr = prof?.[1] ?? cat?.nameFr ?? categoryId;
    const specialtyEn = prof?.[0] ?? cat?.name ?? categoryId;
    const specialty = anglo ? specialtyEn : specialtyFr;
    const years = 3 + (h % 14);
    const rating = Math.round((3.7 + ((h >> 4) % 13) / 10) * 10) / 10;
    const ratingCount = 4 + (h % 47);
    const subEn = cat?.subcategories.length ? pick(cat.subcategories, h >> 9) : '';
    const subFrRaw = cat?.subcategoriesFr?.length ? pick(cat.subcategoriesFr, h >> 9) : subEn;
    const sub = anglo ? subEn : subFrRaw;
    const phone = `6${(h % 4) + 5}${String(100000 + (h % 900000)).slice(0, 6)}`.slice(0, 9);
    const uid = `gen-u-${categoryId}-${slug(city)}-${idx}`;
    const { lat, lng } = coordsFor(city, area, uid);
    const createdAt = new Date(Date.now() - (h % 40) * 86400000 - 3600000).toISOString();

    const user: User = {
      id: uid,
      name,
      phone,
      area,
      city,
      avatarUrl: avatarFor(name, uid),
      hasVideoBio: h % 5 === 0,
      profileVideoUrl: h % 5 === 0 ? 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4' : undefined,
      specialty,
      servicesOffered: [categoryId],
      serviceSubcategories: sub ? [sub] : [],
      roleType: 'provider',
      workPhotos: [workPhoto(categoryId, h % 5, color), workPhoto(categoryId, (h + 1) % 5, color)],
      ratingAvg: rating,
      ratingCount,
      bio: pick(anglo ? BIO_EN : BIO_FR, h >> 2).replace('{y}', String(years)).replace('{city}', city),
      createdAt,
    };

    const service: ServiceOffer = {
      id: `gen-s-${categoryId}-${slug(city)}-${idx}`,
      postedBy: uid,
      postedByName: name,
      postedByPhone: phone,
      postedByRating: rating,
      title: anglo ? `${specialtyEn} in ${city} — ${sub}` : `${specialtyFr} à ${city} — ${sub || specialtyFr}`,
      category: categoryId,
      subCategory: sub,
      specialty,
      description: pick(anglo ? BIO_EN : BIO_FR, h >> 6).replace('{y}', String(years)).replace('{city}', city),
      area,
      city,
      lat,
      lng,
      pricingRate: pick(RATES, h >> 8),
      workPhotos: user.workPhotos,
      status: 'active',
      createdAt,
      interestedCount: h % 9,
    };

    out.push({ user, service });
  }
  return out;
}

export function slug(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}
