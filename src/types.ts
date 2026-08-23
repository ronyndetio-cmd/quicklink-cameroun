export const UNLOCK_PRICE = 250;
export const UNLOCK_WINDOW_MS = 24 * 60 * 60 * 1000;
export const SUPPORT_WHATSAPP = '237674459360';

export type Lang = 'fr' | 'en';

export type Urgency = 'urgent' | 'today' | 'this_week' | 'flexible';

export type RoleType = 'client' | 'provider' | 'both';

export interface User {
  id: string;
  name: string;
  phone: string;
  /** Often a different line than `phone` — defaults to `phone` when not set separately. */
  whatsapp?: string;
  /** Optional — lets password reset work by email as an alternative to SMS. */
  email?: string;
  facebookUrl?: string;
  instagramUrl?: string;
  area: string;
  city: string;
  avatarUrl?: string;
  profileVideoUrl?: string;
  hasVideoBio?: boolean;
  /** Everyone declares a profession at signup — "everyone does something". */
  specialty: string;
  servicesOffered?: string[];
  serviceSubcategories?: string[];
  customProfession?: string;
  roleType?: RoleType;
  workPhotos?: string[];
  ratingAvg: number;
  ratingCount: number;
  bio?: string;
  createdAt: string;
  /** Set by the server, relative to the requesting viewer. */
  isUnlocked?: boolean;
  /** Never sent to the client — stripped by publicUser() on every response. */
  passwordHash?: string;
}

export interface Task {
  id: string;
  postedBy: string;
  postedByName?: string;
  postedByArea?: string;
  title: string;
  category: string;
  subCategory?: string;
  description: string;
  area: string;
  city: string;
  lat: number;
  lng: number;
  urgency: Urgency;
  status: 'open' | 'closed';
  createdAt: string;
  interestedCount: number;
  imageUrl?: string;
}

export interface ServiceOffer {
  id: string;
  postedBy: string;
  postedByName?: string;
  postedByPhone?: string;
  postedByRating?: number;
  title: string;
  category: string;
  subCategory?: string;
  specialty?: string;
  description: string;
  area: string;
  city: string;
  lat: number;
  lng: number;
  pricingRate?: string;
  workPhotos?: string[];
  status: 'active' | 'paused';
  createdAt: string;
  interestedCount: number;
}

export interface CategoryOption {
  id: string;
  name: string;
  nameFr?: string;
  iconName: string;
  color?: string;
  subcategories: string[];
  subcategoriesFr?: string[];
}

export interface ContactUnlock {
  id: string;
  unlockingUserId: string;
  unlockedUserId: string;
  unlockedAt: string;
  paymentMethod: 'fapshi';
  amountPaid: number;
  reference: string;
}

/** `ContactUnlock` enriched with the live status, as returned by GET /api/unlocks. */
export interface UnlockedContact extends ContactUnlock {
  expiresAt: string;
  remainingMs: number;
  user: User;
}

export interface UnlockStatus {
  unlocked: boolean;
  expiresAt: string | null;
  remainingMs: number;
  via: 'fapshi' | 'self' | null;
}

export interface InterestSignal {
  id: string;
  userId: string;
  postId: string;
  postType: 'task' | 'service_offer';
  createdAt: string;
  userPreview: {
    serviceType: string;
    ratingAvg: number;
    ratingCount: number;
    area: string;
    hasVideo: boolean;
  };
}

/** Shaped after Fapshi's payment lifecycle (transId + CREATED/SUCCESSFUL/FAILED). */
export type PaymentStatus = 'CREATED' | 'SUCCESSFUL' | 'FAILED';

export interface PaymentTransaction {
  id: string;
  transId: string;
  userId: string;
  amount: number;
  status: PaymentStatus;
  phone: string;
  targetUserId?: string;
  createdAt: string;
}

export interface Review {
  id: string;
  reviewerId: string;
  reviewerName: string;
  reviewedUserId: string;
  taskId?: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface ApiErrorBody {
  error: string;
  fr: string;
  en: string;
}
