import type { ContactUnlock, Review, ServiceOffer, Task, User } from '../types';
import { avatarFor, workPhoto } from '../lib/media';
import { coordsFor } from '../lib/geo';
import { categoryColor } from '../data/categories';

const iso = (hoursAgo: number) => new Date(Date.now() - hoursAgo * 3600_000).toISOString();

function user(u: Omit<User, 'avatarUrl'> & { avatarUrl?: string }): User {
  return { ...u, avatarUrl: u.avatarUrl ?? avatarFor(u.name, u.id) };
}

export const SEED_USERS: User[] = [
  user({ id: 'u-1', name: 'Arlette Ngando', phone: '677110022', area: 'Bonapriso', city: 'Douala',
    specialty: 'Couturière', servicesOffered: ['tailoring'], serviceSubcategories: ['Sur mesure', 'Tenues traditionnelles'],
    roleType: 'both', ratingAvg: 4.8, ratingCount: 26, bio: '12 ans de couture, spécialiste des tenues traditionnelles et sur mesure.',
    createdAt: iso(3200) }),
  user({ id: 'u-2', name: 'Jean-Paul Mvondo', phone: '699223344', area: 'Bastos', city: 'Yaoundé',
    specialty: 'Électricien', servicesOffered: ['electrical'], serviceSubcategories: ['Câblage', 'Installation éclairage'],
    roleType: 'both', ratingAvg: 4.6, ratingCount: 18, bio: 'Électricien agréé, interventions rapides sur Yaoundé.',
    createdAt: iso(2600) }),
  user({ id: 'u-3', name: 'Grace Ngum', phone: '675334455', area: 'Nkwen', city: 'Bamenda',
    specialty: 'Braider', servicesOffered: ['hairdressing'], serviceSubcategories: ['Braiding'],
    roleType: 'both', ratingAvg: 4.9, ratingCount: 31, bio: 'Home braiding and hair treatment, 8 years of experience.',
    createdAt: iso(4100) }),
  user({ id: 'u-4', name: 'Ibrahim Bello', phone: '691445566', area: 'Foulbéré', city: 'Garoua',
    specialty: 'Mécanicien moto', servicesOffered: ['mechanics'], serviceSubcategories: ['Tyres & suspension'],
    roleType: 'both', ratingAvg: 4.3, ratingCount: 9, bio: 'Réparation moto et véhicules légers, pièces garanties.',
    createdAt: iso(1800) }),
  user({ id: 'u-5', name: 'Solange Ebongué', phone: '677556677', area: 'Akwa', city: 'Douala',
    specialty: 'Plombière', servicesOffered: ['plumbing'], serviceSubcategories: ['Réparation de fuite', 'Débouchage'],
    roleType: 'both', ratingAvg: 4.7, ratingCount: 22, bio: 'Plomberie résidentielle et commerciale, devis gratuit.',
    createdAt: iso(3700) }),
  user({ id: 'u-6', name: 'Steve Kamdem', phone: '696667788', area: 'Tamdja', city: 'Bafoussam',
    specialty: 'Menuisier', servicesOffered: ['carpentry'], serviceSubcategories: ['Meubles sur mesure', 'Charpente'],
    roleType: 'both', ratingAvg: 4.5, ratingCount: 14, bio: 'Menuiserie moderne et traditionnelle, livraison dans la région.',
    createdAt: iso(2200) }),
  user({ id: 'u-7', name: 'Comfort Ashu', phone: '678778899', area: 'Molyko', city: 'Buea',
    specialty: 'Event caterer', servicesOffered: ['catering'], serviceSubcategories: ['Event catering'],
    roleType: 'both', ratingAvg: 4.9, ratingCount: 40, bio: 'Catering for weddings, birthdays and corporate events.',
    createdAt: iso(5200) }),
  user({ id: 'u-8', name: 'Landry Njoh', phone: '679889900', area: 'Deido', city: 'Douala',
    specialty: 'Réparateur de téléphones', servicesOffered: ['phone_repair'], serviceSubcategories: ['Screen replacement'],
    roleType: 'both', ratingAvg: 4.4, ratingCount: 17, bio: 'Réparation express, écran et batterie en moins d’une heure.',
    createdAt: iso(1500) }),
  user({ id: 'u-9', name: 'Aïssatou Bakary', phone: '694990011', area: 'Domayo', city: 'Maroua',
    specialty: 'Esthéticienne', servicesOffered: ['beauty'], serviceSubcategories: ['Skincare', 'Makeup'],
    roleType: 'both', ratingAvg: 4.6, ratingCount: 11, bio: 'Maquillage événementiel et soins du visage à domicile.',
    createdAt: iso(2900) }),
  user({ id: 'u-10', name: 'Hervé Ateba', phone: '677001122', area: 'Mvog-Mbi', city: 'Yaoundé',
    specialty: 'Maçon', servicesOffered: ['masonry'], serviceSubcategories: ['Wall building', 'Plastering'],
    roleType: 'both', ratingAvg: 4.2, ratingCount: 8, bio: 'Chantiers résidentiels, équipe de 4 maçons.',
    createdAt: iso(3300) }),
  user({ id: 'u-11', name: 'Divine Tabi', phone: '655112233', area: 'Down Beach', city: 'Limbe',
    specialty: 'Photographer', servicesOffered: ['photography'], serviceSubcategories: ['Event photography'],
    roleType: 'both', ratingAvg: 4.8, ratingCount: 23, bio: 'Wedding and event photography across the South-West.',
    createdAt: iso(4600) }),
  user({ id: 'u-12', name: 'Marie Fouda', phone: '690223311', area: 'Etoa-Meki', city: 'Yaoundé',
    specialty: 'Comptable', servicesOffered: [], serviceSubcategories: [],
    roleType: 'client', ratingAvg: 0, ratingCount: 0, bio: 'Je poste ici quand j’ai besoin d’un coup de main à la maison.',
    createdAt: iso(900) }),
];

function svcPhotos(categoryId: string, count: number): string[] {
  const color = categoryColor(categoryId);
  return Array.from({ length: count }, (_, i) => workPhoto(categoryId, i, color));
}

function task(t: Omit<Task, 'lat' | 'lng' | 'status' | 'interestedCount'>): Task {
  const { lat, lng } = coordsFor(t.city, t.area, t.id);
  return { ...t, lat, lng, status: 'open', interestedCount: 0 };
}

export const SEED_TASKS: Task[] = [
  task({ id: 't-1', postedBy: 'u-12', postedByName: 'Marie Fouda', postedByArea: 'Etoa-Meki', title: 'Fuite sous l’évier de la cuisine',
    category: 'plumbing', subCategory: 'Réparation de fuite', description: 'Ça fuit depuis hier soir, il y a de l’eau qui s’accumule sous le meuble.',
    area: 'Etoa-Meki', city: 'Yaoundé', urgency: 'urgent', createdAt: iso(6) }),
  task({ id: 't-2', postedBy: 'u-2', postedByName: 'Jean-Paul Mvondo', postedByArea: 'Bastos', title: 'Coupure de courant dans tout l’appartement',
    category: 'electrical', subCategory: 'Disjoncteur', description: 'Le disjoncteur principal saute dès qu’on branche le frigo.',
    area: 'Bastos', city: 'Yaoundé', urgency: 'today', createdAt: iso(20) }),
  task({ id: 't-3', postedBy: 'u-9', postedByName: 'Aïssatou Bakary', postedByArea: 'Domayo', title: 'Réparer une moto en panne',
    category: 'mechanics', subCategory: 'Moto', description: 'La moto ne démarre plus depuis ce matin, bruit bizarre au démarrage.',
    area: 'Domayo', city: 'Maroua', urgency: 'this_week', createdAt: iso(40) }),
  task({ id: 't-4', postedBy: 'u-7', postedByName: 'Comfort Ashu', postedByArea: 'Molyko', title: 'Besoin d’une tresseuse à domicile',
    category: 'hairdressing', subCategory: 'Braiding', description: 'Pour un mariage samedi, je cherche quelqu’un de disponible tôt le matin.',
    area: 'Molyko', city: 'Buea', urgency: 'flexible', createdAt: iso(70) }),
  task({ id: 't-5', postedBy: 'u-1', postedByName: 'Arlette Ngando', postedByArea: 'Bonapriso', title: 'Peindre deux chambres',
    category: 'painting', subCategory: 'Peinture intérieure', description: 'Deux chambres à repeindre, peinture déjà achetée, juste la main d’œuvre.',
    area: 'Bonapriso', city: 'Douala', urgency: 'this_week', createdAt: iso(95) }),
  task({ id: 't-6', postedBy: 'u-10', postedByName: 'Hervé Ateba', postedByArea: 'Mvog-Mbi', title: 'Installer une caméra de surveillance',
    category: 'security', subCategory: 'Installation caméras', description: 'Une caméra à l’entrée de la parcelle, accès wifi disponible.',
    area: 'Mvog-Mbi', city: 'Yaoundé', urgency: 'today', createdAt: iso(14) }),
  task({ id: 't-7', postedBy: 'u-12', postedByName: 'Marie Fouda', postedByArea: 'Etoa-Meki', title: 'Cours de maths niveau terminale',
    category: 'tutoring', subCategory: 'Niveau universitaire', description: 'Mon fils est en terminale C, il a besoin d’aide en maths deux fois par semaine.',
    area: 'Etoa-Meki', city: 'Yaoundé', urgency: 'flexible', createdAt: iso(130) }),
  task({ id: 't-8', postedBy: 'u-11', postedByName: 'Divine Tabi', postedByArea: 'Down Beach', title: 'Déménagement studio meublé',
    category: 'moving', subCategory: 'Déménagement', description: 'Studio meublé à déménager ce week-end, un camion et deux bras suffisent.',
    area: 'Down Beach', city: 'Limbe', urgency: 'urgent', createdAt: iso(3) }),
];

function service(s: Omit<ServiceOffer, 'lat' | 'lng' | 'status' | 'interestedCount'>): ServiceOffer {
  const { lat, lng } = coordsFor(s.city, s.area, s.id);
  return { ...s, lat, lng, status: 'active', interestedCount: 0 };
}

export const SEED_SERVICES: ServiceOffer[] = [
  service({ id: 's-1', postedBy: 'u-1', postedByName: 'Arlette Ngando', postedByPhone: '677110022', postedByRating: 4.8,
    title: 'Couture sur mesure à Douala', category: 'tailoring', subCategory: 'Sur mesure', specialty: 'Couturière',
    description: 'Robes, costumes et tenues traditionnelles, essayage à domicile possible.', area: 'Bonapriso', city: 'Douala',
    pricingRate: '10 000 – 40 000 FCFA', workPhotos: svcPhotos('tailoring', 3), createdAt: iso(200) }),
  service({ id: 's-2', postedBy: 'u-2', postedByName: 'Jean-Paul Mvondo', postedByPhone: '699223344', postedByRating: 4.6,
    title: 'Électricien disponible à Yaoundé', category: 'electrical', subCategory: 'Câblage', specialty: 'Électricien',
    description: 'Câblage, dépannage, installation de luminaires. Devis gratuit avant tout travail.', area: 'Bastos', city: 'Yaoundé',
    pricingRate: '5 000 – 25 000 FCFA', workPhotos: svcPhotos('electrical', 2), createdAt: iso(180) }),
  service({ id: 's-3', postedBy: 'u-3', postedByName: 'Grace Ngum', postedByPhone: '675334455', postedByRating: 4.9,
    title: 'Tresses et coiffure à domicile', category: 'hairdressing', subCategory: 'Braiding', specialty: 'Braider',
    description: 'All styles, home visits across Bamenda. Book ahead for weekends.', area: 'Nkwen', city: 'Bamenda',
    pricingRate: '3 000 – 15 000 FCFA', workPhotos: svcPhotos('hairdressing', 3), createdAt: iso(260) }),
  service({ id: 's-4', postedBy: 'u-4', postedByName: 'Ibrahim Bello', postedByPhone: '691445566', postedByRating: 4.3,
    title: 'Réparation moto et voiture', category: 'mechanics', subCategory: 'Tyres & suspension', specialty: 'Mécanicien moto',
    description: 'Diagnostic gratuit, pièces d’occasion et neuves disponibles.', area: 'Foulbéré', city: 'Garoua',
    pricingRate: 'Sur devis', workPhotos: svcPhotos('mechanics', 2), createdAt: iso(150) }),
  service({ id: 's-5', postedBy: 'u-5', postedByName: 'Solange Ebongué', postedByPhone: '677556677', postedByRating: 4.7,
    title: 'Plombier rapide à Douala', category: 'plumbing', subCategory: 'Réparation de fuite', specialty: 'Plombière',
    description: 'Interventions en moins de 2h sur Akwa, Bonanjo et Bonapriso.', area: 'Akwa', city: 'Douala',
    pricingRate: '5 000 – 20 000 FCFA', workPhotos: svcPhotos('plumbing', 3), createdAt: iso(310) }),
  service({ id: 's-6', postedBy: 'u-6', postedByName: 'Steve Kamdem', postedByPhone: '696667788', postedByRating: 4.5,
    title: 'Menuiserie et meubles sur mesure', category: 'carpentry', subCategory: 'Meubles sur mesure', specialty: 'Menuisier',
    description: 'Lits, armoires, tables — bois local, livraison dans l’Ouest.', area: 'Tamdja', city: 'Bafoussam',
    pricingRate: 'Sur devis', workPhotos: svcPhotos('carpentry', 2), createdAt: iso(220) }),
  service({ id: 's-7', postedBy: 'u-7', postedByName: 'Comfort Ashu', postedByPhone: '678778899', postedByRating: 4.9,
    title: 'Traiteur événements à Buea', category: 'catering', subCategory: 'Event catering', specialty: 'Event caterer',
    description: 'Weddings, birthdays, corporate lunches. Tastings available on request.', area: 'Molyko', city: 'Buea',
    pricingRate: 'From 2,500 FCFA / plate', workPhotos: svcPhotos('catering', 3), createdAt: iso(400) }),
  service({ id: 's-8', postedBy: 'u-8', postedByName: 'Landry Njoh', postedByPhone: '679889900', postedByRating: 4.4,
    title: 'Réparation téléphone express', category: 'phone_repair', subCategory: 'Screen replacement', specialty: 'Réparateur de téléphones',
    description: 'Écran, batterie, déblocage logiciel — la plupart des pannes en moins d’une heure.', area: 'Deido', city: 'Douala',
    pricingRate: '5 000 – 35 000 FCFA', workPhotos: svcPhotos('phone_repair', 2), createdAt: iso(90) }),
  service({ id: 's-9', postedBy: 'u-9', postedByName: 'Aïssatou Bakary', postedByPhone: '694990011', postedByRating: 4.6,
    title: 'Maquillage et soins du visage', category: 'beauty', subCategory: 'Makeup', specialty: 'Esthéticienne',
    description: 'Maquillage mariage et soirée, produits professionnels.', area: 'Domayo', city: 'Maroua',
    pricingRate: '10 000 – 30 000 FCFA', workPhotos: svcPhotos('beauty', 2), createdAt: iso(170) }),
  service({ id: 's-10', postedBy: 'u-10', postedByName: 'Hervé Ateba', postedByPhone: '677001122', postedByRating: 4.2,
    title: 'Maçonnerie et construction', category: 'masonry', subCategory: 'Wall building', specialty: 'Maçon',
    description: 'Construction, extension, chape. Équipe de 4 personnes, devis sous 48h.', area: 'Mvog-Mbi', city: 'Yaoundé',
    pricingRate: 'Sur devis', workPhotos: svcPhotos('masonry', 2), createdAt: iso(340) }),
  service({ id: 's-11', postedBy: 'u-11', postedByName: 'Divine Tabi', postedByPhone: '655112233', postedByRating: 4.8,
    title: 'Photographe événementiel', category: 'photography', subCategory: 'Event photography', specialty: 'Photographer',
    description: 'Weddings, graduations, portraits. Digital gallery delivered within a week.', area: 'Down Beach', city: 'Limbe',
    pricingRate: '25 000 – 100 000 FCFA', workPhotos: svcPhotos('photography', 3), createdAt: iso(280) }),
  service({ id: 's-12', postedBy: 'u-6', postedByName: 'Steve Kamdem', postedByPhone: '696667788', postedByRating: 4.5,
    title: 'Réparation de charpente et toiture', category: 'carpentry', subCategory: 'Roofing frames', specialty: 'Charpentier',
    description: 'Réparation et remplacement de charpentes bois, tôles incluses sur demande.', area: 'Tamdja', city: 'Bafoussam',
    pricingRate: 'Sur devis', workPhotos: svcPhotos('carpentry', 1), createdAt: iso(60) }),
];

export const SEED_UNLOCKS: ContactUnlock[] = [];

export const SEED_REVIEWS: Review[] = [
  { id: 'r-1', reviewerId: 'u-12', reviewerName: 'Marie Fouda', reviewedUserId: 'u-1', rating: 5,
    comment: 'Travail impeccable, robe livrée avant la date promise.', createdAt: iso(500) },
  { id: 'r-2', reviewerId: 'u-2', reviewerName: 'Jean-Paul Mvondo', reviewedUserId: 'u-5', rating: 5,
    comment: 'Fuite réparée en 30 minutes, très professionnelle.', createdAt: iso(600) },
  { id: 'r-3', reviewerId: 'u-7', reviewerName: 'Comfort Ashu', reviewedUserId: 'u-3', rating: 5,
    comment: 'Best braider in Bamenda, always on time.', createdAt: iso(700) },
  { id: 'r-4', reviewerId: 'u-9', reviewerName: 'Aïssatou Bakary', reviewedUserId: 'u-4', rating: 4,
    comment: 'Bon travail sur la moto, un peu de retard mais résultat correct.', createdAt: iso(150) },
];
