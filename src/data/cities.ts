export const REGIONS = [
  'Adamaoua',
  'Centre',
  'Est',
  'Extrême-Nord',
  'Littoral',
  'Nord',
  'Nord-Ouest',
  'Ouest',
  'Sud',
  'Sud-Ouest',
] as const;

export interface CityEntry {
  name: string;
  region: (typeof REGIONS)[number];
  lat: number;
  lng: number;
}

// [name, region, lat, lng] — approximate coordinates, enough for map placement
// and Haversine distance; not survey-grade. Covers the 10 regions with a mix
// of regional capitals, department towns and smaller arrondissements — not
// exhaustive of Cameroon's ~360 arrondissements, but a wide, honest spread.
const RAW: [string, (typeof REGIONS)[number], number, number][] = [
  // Littoral
  ['Douala', 'Littoral', 4.0511, 9.7679],
  ['Nkongsamba', 'Littoral', 4.9547, 9.9401],
  ['Edéa', 'Littoral', 3.8, 10.1333],
  ['Loum', 'Littoral', 4.7167, 9.7333],
  ['Manjo', 'Littoral', 4.8394, 9.825],
  ['Mbanga', 'Littoral', 4.5, 9.5667],
  ['Yabassi', 'Littoral', 4.4333, 9.9667],
  ['Dibombari', 'Littoral', 4.1333, 9.6667],
  ['Melong', 'Littoral', 5.1167, 9.95],
  ['Nyombe', 'Littoral', 4.55, 9.6333],
  ['Diboum', 'Littoral', 3.9, 10.2],
  ['Mouanko', 'Littoral', 3.633, 9.816],
  ['Ndom', 'Littoral', 4.45, 10.4],
  ['Massock', 'Littoral', 4.3, 10.55],
  ['Nkondjock', 'Littoral', 4.766, 10.233],
  ['Yingui', 'Littoral', 4.966, 10.283],
  ['Dizangué', 'Littoral', 3.966, 9.983],
  ['Pouma', 'Littoral', 3.883, 10.4],
  ['Njombé-Penja', 'Littoral', 4.85, 9.68],
  // Centre
  ['Yaoundé', 'Centre', 3.848, 11.5021],
  ['Mbalmayo', 'Centre', 3.5167, 11.5],
  ['Obala', 'Centre', 4.1667, 11.5333],
  ['Monatélé', 'Centre', 4.3167, 11.2],
  ['Akonolinga', 'Centre', 3.7667, 12.25],
  ['Bafia', 'Centre', 4.75, 11.2333],
  ['Eséka', 'Centre', 3.65, 10.7667],
  ['Ntui', 'Centre', 4.45, 11.63],
  ['Nanga-Eboko', 'Centre', 4.6833, 12.3667],
  ['Soa', 'Centre', 3.95, 11.55],
  ['Mfou', 'Centre', 3.7167, 11.6333],
  ['Ngoumou', 'Centre', 3.6, 11.3833],
  ["Sa'a", 'Centre', 4.3667, 11.4833],
  ['Okola', 'Centre', 4.05, 11.2],
  ['Awaé', 'Centre', 3.8, 11.6667],
  ['Esse', 'Centre', 4.1667, 11.9167],
  ['Mbankomo', 'Centre', 3.75, 11.35],
  ['Évodoula', 'Centre', 4.3667, 11.15],
  ['Ombessa', 'Centre', 4.7, 11.35],
  ['Yoko', 'Centre', 5.5333, 12.3167],
  ['Ngoro', 'Centre', 4.05, 12.05],
  ['Bikok', 'Centre', 3.5833, 11.55],
  ['Lobo', 'Centre', 3.35, 11.45],
  ['Ngomedzap', 'Centre', 3.25, 11.35],
  ['Batchenga', 'Centre', 4.4667, 11.55],
  ['Akono', 'Centre', 3.883, 11.3167],
  ['Nkoteng', 'Centre', 4.5167, 12.0333],
  // Ouest
  ['Bafoussam', 'Ouest', 5.4768, 10.4179],
  ['Dschang', 'Ouest', 5.45, 10.0667],
  ['Bafang', 'Ouest', 5.15, 10.1833],
  ['Bandjoun', 'Ouest', 5.35, 10.42],
  ['Foumban', 'Ouest', 5.7288, 10.9],
  ['Mbouda', 'Ouest', 5.625, 10.25],
  ['Baham', 'Ouest', 5.3, 10.3],
  ['Bangangté', 'Ouest', 5.15, 10.5167],
  ['Bangou', 'Ouest', 5.2333, 10.2833],
  ['Galim', 'Ouest', 5.6667, 10.35],
  ['Foumbot', 'Ouest', 5.5, 10.6333],
  ['Malantouen', 'Ouest', 5.5833, 10.75],
  ['Kouoptamo', 'Ouest', 5.5667, 10.75],
  ['Bangourain', 'Ouest', 5.9, 10.75],
  ['Massangam', 'Ouest', 5.3833, 11.0167],
  ['Babadjou', 'Ouest', 5.6833, 10.2167],
  ['Penka-Michel', 'Ouest', 5.4333, 10.0],
  ['Santchou', 'Ouest', 5.35, 9.9],
  ['Fokoué', 'Ouest', 5.4833, 10.1667],
  ['Nkong-Ni', 'Ouest', 5.4, 9.95],
  ['Fongo-Tongo', 'Ouest', 5.5, 10.0],
  ['Bafou', 'Ouest', 5.5333, 10.1167],
  ['Batié', 'Ouest', 5.05, 10.2833],
  ['Bangoulap', 'Ouest', 5.1667, 10.55],
  ['Bamougoum', 'Ouest', 5.5, 10.35],
  ['Baleng', 'Ouest', 5.55, 10.3833],
  // Nord-Ouest
  ['Bamenda', 'Nord-Ouest', 5.9631, 10.1591],
  ['Kumbo', 'Nord-Ouest', 6.2, 10.6667],
  ['Wum', 'Nord-Ouest', 6.3833, 10.0667],
  ['Ndop', 'Nord-Ouest', 5.9667, 10.45],
  ['Mbengwi', 'Nord-Ouest', 6.0167, 9.9833],
  ['Fundong', 'Nord-Ouest', 6.25, 10.27],
  ['Nkambe', 'Nord-Ouest', 6.5833, 10.6667],
  ['Bali', 'Nord-Ouest', 5.8833, 10.0167],
  ['Bafut', 'Nord-Ouest', 6.1, 10.1],
  ['Tubah', 'Nord-Ouest', 6.0333, 10.15],
  ['Santa', 'Nord-Ouest', 5.9833, 10.2333],
  ['Widikum', 'Nord-Ouest', 5.95, 9.9],
  ['Furu-Awa', 'Nord-Ouest', 6.5, 9.9333],
  ['Ako', 'Nord-Ouest', 6.9, 10.5167],
  ['Misaje', 'Nord-Ouest', 6.65, 10.55],
  ['Jakiri', 'Nord-Ouest', 6.1, 10.5833],
  ['Oku', 'Nord-Ouest', 6.2333, 10.4833],
  ['Bum', 'Nord-Ouest', 6.4, 10.2],
  ['Belo', 'Nord-Ouest', 6.1, 10.2333],
  ['Batibo', 'Nord-Ouest', 5.9833, 9.8667],
  ['Ndu', 'Nord-Ouest', 6.4167, 10.7333],
  ['Bafmeng', 'Nord-Ouest', 6.3667, 10.35],
  // Sud-Ouest
  ['Buea', 'Sud-Ouest', 4.1557, 9.2413],
  ['Limbe', 'Sud-Ouest', 4.0217, 9.2122],
  ['Kumba', 'Sud-Ouest', 4.636, 9.4462],
  ['Mamfe', 'Sud-Ouest', 5.7667, 9.3167],
  ['Tiko', 'Sud-Ouest', 4.075, 9.36],
  ['Mutengene', 'Sud-Ouest', 4.0833, 9.3167],
  ['Muyuka', 'Sud-Ouest', 4.2833, 9.4167],
  ['Idenau', 'Sud-Ouest', 4.2167, 8.9833],
  ['Bangem', 'Sud-Ouest', 5.1, 9.7167],
  ['Konye', 'Sud-Ouest', 4.9667, 9.4833],
  ['Nguti', 'Sud-Ouest', 5.35, 9.55],
  ['Fontem', 'Sud-Ouest', 5.5167, 9.8833],
  ['Alou', 'Sud-Ouest', 5.4, 9.85],
  ['Wabane', 'Sud-Ouest', 5.35, 9.95],
  ['Bamusso', 'Sud-Ouest', 4.4667, 8.85],
  ['Toko', 'Sud-Ouest', 4.9, 8.9333],
  ['Ekona', 'Sud-Ouest', 4.2667, 9.3667],
  ['Mundemba', 'Sud-Ouest', 4.9667, 8.8667],
  ['Bakingili', 'Sud-Ouest', 4.15, 9.05],
  ['Batoke', 'Sud-Ouest', 4.05, 9.05],
  // Nord
  ['Garoua', 'Nord', 9.3014, 13.3972],
  ['Guider', 'Nord', 9.9333, 13.95],
  ['Poli', 'Nord', 8.4833, 13.25],
  ['Figuil', 'Nord', 9.7667, 13.9667],
  ['Pitoa', 'Nord', 9.3833, 13.5333],
  ['Tcholliré', 'Nord', 8.4, 14.1667],
  ['Lagdo', 'Nord', 9.05, 13.7167],
  ['Bibémi', 'Nord', 9.35, 13.8],
  ['Demsa', 'Nord', 9.2333, 13.1667],
  ['Mayo-Oulo', 'Nord', 9.7167, 13.6167],
  ['Touboro', 'Nord', 7.7667, 15.3667],
  ['Ngong', 'Nord', 8.55, 12.9833],
  ['Béka', 'Nord', 9.25, 13.35],
  // Extrême-Nord
  ['Maroua', 'Extrême-Nord', 10.591, 14.3159],
  ['Kousséri', 'Extrême-Nord', 12.0761, 15.0303],
  ['Mokolo', 'Extrême-Nord', 10.7333, 13.8],
  ['Yagoua', 'Extrême-Nord', 10.3394, 15.2333],
  ['Kaélé', 'Extrême-Nord', 10.1, 14.45],
  ['Mora', 'Extrême-Nord', 11.05, 14.15],
  ['Bogo', 'Extrême-Nord', 10.7333, 14.6],
  ['Maga', 'Extrême-Nord', 10.85, 14.9333],
  ['Gazawa', 'Extrême-Nord', 10.4333, 14.1333],
  ['Méri', 'Extrême-Nord', 10.7833, 13.9333],
  ['Mindif', 'Extrême-Nord', 10.4167, 14.4333],
  ['Moutourwa', 'Extrême-Nord', 10.35, 14.2667],
  ['Kolofata', 'Extrême-Nord', 11.0667, 14.1833],
  ['Guidiguis', 'Extrême-Nord', 10.1167, 14.75],
  ['Datcheka', 'Extrême-Nord', 10.1667, 15.15],
  ['Waza', 'Extrême-Nord', 11.4, 14.5833],
  ['Tokombéré', 'Extrême-Nord', 10.9667, 14.15],
  ['Koza', 'Extrême-Nord', 10.8333, 13.9333],
  // Adamaoua
  ['Ngaoundéré', 'Adamaoua', 7.3232, 13.5844],
  ['Meiganga', 'Adamaoua', 6.5167, 14.3],
  ['Tibati', 'Adamaoua', 6.4667, 12.6333],
  ['Banyo', 'Adamaoua', 6.75, 11.8167],
  ['Tignère', 'Adamaoua', 7.3667, 12.65],
  ['Ngaoundal', 'Adamaoua', 6.5, 13.2667],
  ['Belel', 'Adamaoua', 7.55, 14.4333],
  ['Djohong', 'Adamaoua', 6.7333, 14.6833],
  ['Mbé', 'Adamaoua', 7.15, 13.7167],
  ['Nyambaka', 'Adamaoua', 7.5833, 14.15],
  // Est
  ['Bertoua', 'Est', 4.5776, 13.6846],
  ['Batouri', 'Est', 4.4333, 14.3667],
  ['Abong-Mbang', 'Est', 3.9833, 13.1833],
  ['Yokadouma', 'Est', 3.5167, 15.05],
  ['Lomié', 'Est', 3.1667, 13.6],
  ['Doumé', 'Est', 4.2333, 13.45],
  ['Mbang', 'Est', 4.3667, 14.25],
  ['Bélabo', 'Est', 4.9333, 13.3],
  ['Diang', 'Est', 4.55, 13.9333],
  ['Ngoura', 'Est', 4.9, 14.35],
  ['Garoua-Boulaï', 'Est', 5.9667, 14.55],
  ['Kette', 'Est', 4.15, 14.5333],
  ['Salapoumbé', 'Est', 2.6667, 14.9833],
  ['Ndélélé', 'Est', 4.05, 14.9333],
  // Sud
  ['Ebolowa', 'Sud', 2.9167, 11.15],
  ['Kribi', 'Sud', 2.95, 9.9096],
  ['Sangmélima', 'Sud', 2.9333, 11.9833],
  ['Ambam', 'Sud', 2.3833, 11.2833],
  ['Djoum', 'Sud', 2.6667, 12.4167],
  ['Meyomessala', 'Sud', 3.05, 11.9833],
  ['Mvangan', 'Sud', 2.4833, 11.9167],
  ['Bipindi', 'Sud', 3.0333, 10.3667],
  ['Lolodorf', 'Sud', 3.2333, 10.7333],
  ['Akom II', 'Sud', 2.7833, 10.5333],
  ["Ma'an", 'Sud', 2.2, 11.1667],
  ['Meyomessi', 'Sud', 3.0833, 12.05],
  ['Efoulan', 'Sud', 2.9833, 11.45],
  ['Mengong', 'Sud', 2.9667, 11.4],
];

export const CITIES: CityEntry[] = RAW.map(([name, region, lat, lng]) => ({ name, region, lat, lng }));

export const CITY_COUNT = CITIES.length;

export const MAJOR_CITIES = [
  'Douala',
  'Yaoundé',
  'Bamenda',
  'Bafoussam',
  'Garoua',
  'Maroua',
  'Ngaoundéré',
  'Bertoua',
  'Ebolowa',
  'Buea',
  'Limbe',
  'Kribi',
  'Kumba',
  'Edéa',
  'Dschang',
  'Foumban',
];

const CITY_BY_NAME = new Map(CITIES.map((c) => [c.name.toLowerCase(), c]));

export function findCity(name?: string): CityEntry | undefined {
  if (!name) return undefined;
  return CITY_BY_NAME.get(name.toLowerCase());
}

/** Case/accent-loose lookup so a user typing "yaounde" still matches "Yaoundé". */
export function searchCities(query: string, limit = 12): CityEntry[] {
  const q = query
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '');
  if (!q) return CITIES.slice(0, limit);
  return CITIES.filter((c) =>
    c.name
      .toLowerCase()
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
      .includes(q),
  ).slice(0, limit);
}

export function regionOf(city?: string): (typeof REGIONS)[number] {
  return findCity(city)?.region ?? 'Centre';
}

const NAMED_QUARTERS: Record<string, string[]> = {
  douala: ['Akwa', 'Bonanjo', 'Bonapriso', 'New Bell', 'Deido', 'Bépanda', 'Makepe', 'Ndokoti', 'Bonabéri', 'Logbaba'],
  yaoundé: ['Bastos', 'Mvog-Mbi', 'Essos', 'Mvan', 'Nlongkak', 'Etoa-Meki', 'Mimboman', 'Ngousso', 'Biyem-Assi', 'Odza'],
  bamenda: ['Up Station', 'Nkwen', 'Old Town', 'Mankon', 'Ntarikon', 'Bamendankwe'],
  buea: ['Molyko', 'Great Soppo', 'Bokwango', 'Bonduma', 'Muea'],
  limbe: ['Down Beach', 'Mile 4', 'Bota', 'Isokolo'],
  garoua: ['Foulbéré', 'Roumdé Adjia', 'Bibemiré', 'Djamboutou'],
  maroua: ['Domayo', 'Kongola', 'Djarengol', 'Founangué'],
  bafoussam: ['Tamdja', 'Djeleng', 'Banengo', 'Kamkop'],
};

const QUARTER_POOLS: Record<(typeof REGIONS)[number], string[]> = {
  Adamaoua: ['Centre-ville', 'Marché A', 'Béka-Hosséré', 'Dang', 'Bamyanga'],
  Centre: ['Centre-ville', 'Marché Central', 'Nkolbisson', 'Nkoabang', 'Etoudi'],
  Est: ['Centre-ville', 'Marché', 'Quartier Fouda', 'Nkolbikon'],
  'Extrême-Nord': ['Centre-ville', 'Marché Central', 'Quartier Zokok', 'Domayo'],
  Littoral: ['Centre-ville', 'Marché', 'Cité SIC', 'Quartier Résidentiel'],
  Nord: ['Centre-ville', 'Marché', 'Quartier Foulbé', 'Zone Administrative'],
  'Nord-Ouest': ['Centre Town', 'Commercial Avenue', 'Foncha Street', 'Hospital Roundabout'],
  Ouest: ['Centre-ville', 'Marché A', 'Quartier Chefferie', 'Tamdja'],
  Sud: ['Centre-ville', 'Marché', 'Nko’ovos', 'Quartier Administratif'],
  'Sud-Ouest': ['Government Station', 'Market Area', 'Mile 2', 'Church Street'],
};

export function quartersFor(city?: string): string[] {
  const named = city ? NAMED_QUARTERS[city.toLowerCase()] : undefined;
  if (named) return named;
  const region = regionOf(city);
  return QUARTER_POOLS[region];
}
