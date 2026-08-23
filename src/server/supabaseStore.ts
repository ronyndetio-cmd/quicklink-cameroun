import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { ContactUnlock, InterestSignal, PaymentTransaction, Review, ServiceOffer, Task, User } from '../types';
import type { DataStore } from './dataStore';

/* ------------------------------------------------------------------ *
 * Row <-> domain-object mapping. Postgres columns are snake_case; the
 * app's types (src/types.ts) are camelCase everywhere else.
 * ------------------------------------------------------------------ */

type Row = Record<string, unknown>;

function userFromRow(r: Row): User {
  return {
    id: r.id as string,
    name: r.name as string,
    phone: r.phone as string,
    whatsapp: (r.whatsapp as string) ?? undefined,
    email: (r.email as string) ?? undefined,
    facebookUrl: (r.facebook_url as string) ?? undefined,
    instagramUrl: (r.instagram_url as string) ?? undefined,
    area: r.area as string,
    city: r.city as string,
    avatarUrl: (r.avatar_url as string) ?? undefined,
    profileVideoUrl: (r.profile_video_url as string) ?? undefined,
    hasVideoBio: Boolean(r.has_video_bio),
    specialty: r.specialty as string,
    servicesOffered: (r.services_offered as string[]) ?? [],
    serviceSubcategories: (r.service_subcategories as string[]) ?? [],
    customProfession: (r.custom_profession as string) ?? undefined,
    roleType: (r.role_type as User['roleType']) ?? 'both',
    workPhotos: (r.work_photos as string[]) ?? [],
    ratingAvg: Number(r.rating_avg ?? 0),
    ratingCount: Number(r.rating_count ?? 0),
    bio: (r.bio as string) ?? undefined,
    createdAt: r.created_at as string,
    passwordHash: (r.password_hash as string) ?? undefined,
  };
}

function userToRow(u: User): Row {
  return {
    id: u.id,
    name: u.name,
    phone: u.phone,
    whatsapp: u.whatsapp ?? null,
    email: u.email ?? null,
    facebook_url: u.facebookUrl ?? null,
    instagram_url: u.instagramUrl ?? null,
    area: u.area,
    city: u.city,
    avatar_url: u.avatarUrl ?? null,
    profile_video_url: u.profileVideoUrl ?? null,
    has_video_bio: Boolean(u.hasVideoBio),
    specialty: u.specialty,
    services_offered: u.servicesOffered ?? [],
    service_subcategories: u.serviceSubcategories ?? [],
    custom_profession: u.customProfession ?? null,
    role_type: u.roleType ?? 'both',
    work_photos: u.workPhotos ?? [],
    rating_avg: u.ratingAvg ?? 0,
    rating_count: u.ratingCount ?? 0,
    bio: u.bio ?? null,
    created_at: u.createdAt,
    password_hash: u.passwordHash ?? null,
  };
}

const USER_PATCH_KEYS: Record<string, string> = {
  name: 'name',
  phone: 'phone',
  whatsapp: 'whatsapp',
  email: 'email',
  facebookUrl: 'facebook_url',
  instagramUrl: 'instagram_url',
  area: 'area',
  city: 'city',
  avatarUrl: 'avatar_url',
  profileVideoUrl: 'profile_video_url',
  hasVideoBio: 'has_video_bio',
  specialty: 'specialty',
  servicesOffered: 'services_offered',
  serviceSubcategories: 'service_subcategories',
  customProfession: 'custom_profession',
  roleType: 'role_type',
  workPhotos: 'work_photos',
  bio: 'bio',
  ratingAvg: 'rating_avg',
  ratingCount: 'rating_count',
  passwordHash: 'password_hash',
};

function userPatchToRow(patch: Partial<User>): Row {
  const row: Row = {};
  for (const [key, column] of Object.entries(USER_PATCH_KEYS)) {
    const value = (patch as Record<string, unknown>)[key];
    if (value !== undefined) row[column] = value;
  }
  return row;
}

function taskFromRow(r: Row): Task {
  return {
    id: r.id as string,
    postedBy: r.posted_by as string,
    postedByName: (r.posted_by_name as string) ?? undefined,
    postedByArea: (r.posted_by_area as string) ?? undefined,
    title: r.title as string,
    category: (r.category as string) ?? '',
    subCategory: (r.sub_category as string) ?? '',
    description: (r.description as string) ?? '',
    area: r.area as string,
    city: r.city as string,
    lat: Number(r.lat),
    lng: Number(r.lng),
    urgency: r.urgency as Task['urgency'],
    status: r.status as Task['status'],
    createdAt: r.created_at as string,
    interestedCount: Number(r.interested_count ?? 0),
    imageUrl: (r.image_url as string) ?? undefined,
  };
}

function taskToRow(t: Task): Row {
  return {
    id: t.id,
    posted_by: t.postedBy,
    posted_by_name: t.postedByName ?? null,
    posted_by_area: t.postedByArea ?? null,
    title: t.title,
    category: t.category ?? '',
    sub_category: t.subCategory ?? '',
    description: t.description ?? '',
    area: t.area,
    city: t.city,
    lat: t.lat,
    lng: t.lng,
    urgency: t.urgency,
    status: t.status,
    created_at: t.createdAt,
    interested_count: t.interestedCount ?? 0,
    image_url: t.imageUrl ?? null,
  };
}

function serviceFromRow(r: Row): ServiceOffer {
  return {
    id: r.id as string,
    postedBy: r.posted_by as string,
    postedByName: (r.posted_by_name as string) ?? undefined,
    postedByPhone: (r.posted_by_phone as string) ?? undefined,
    postedByRating: r.posted_by_rating != null ? Number(r.posted_by_rating) : undefined,
    title: r.title as string,
    category: (r.category as string) ?? '',
    subCategory: (r.sub_category as string) ?? '',
    specialty: (r.specialty as string) ?? undefined,
    description: (r.description as string) ?? '',
    area: r.area as string,
    city: r.city as string,
    lat: Number(r.lat),
    lng: Number(r.lng),
    pricingRate: (r.pricing_rate as string) ?? undefined,
    workPhotos: (r.work_photos as string[]) ?? [],
    status: r.status as ServiceOffer['status'],
    createdAt: r.created_at as string,
    interestedCount: Number(r.interested_count ?? 0),
  };
}

function serviceToRow(s: ServiceOffer): Row {
  return {
    id: s.id,
    posted_by: s.postedBy,
    posted_by_name: s.postedByName ?? null,
    posted_by_phone: s.postedByPhone ?? null,
    posted_by_rating: s.postedByRating ?? null,
    title: s.title,
    category: s.category ?? '',
    sub_category: s.subCategory ?? '',
    specialty: s.specialty ?? null,
    description: s.description ?? '',
    area: s.area,
    city: s.city,
    lat: s.lat,
    lng: s.lng,
    pricing_rate: s.pricingRate ?? null,
    work_photos: s.workPhotos ?? [],
    status: s.status,
    created_at: s.createdAt,
    interested_count: s.interestedCount ?? 0,
  };
}

function interestFromRow(r: Row): InterestSignal {
  return {
    id: r.id as string,
    userId: r.user_id as string,
    postId: r.post_id as string,
    postType: r.post_type as InterestSignal['postType'],
    createdAt: r.created_at as string,
    userPreview: {
      serviceType: (r.preview_service_type as string) ?? '',
      ratingAvg: Number(r.preview_rating_avg ?? 0),
      ratingCount: Number(r.preview_rating_count ?? 0),
      area: (r.preview_area as string) ?? '',
      hasVideo: Boolean(r.preview_has_video),
    },
  };
}

function interestToRow(i: InterestSignal): Row {
  return {
    id: i.id,
    user_id: i.userId,
    post_id: i.postId,
    post_type: i.postType,
    created_at: i.createdAt,
    preview_service_type: i.userPreview.serviceType,
    preview_rating_avg: i.userPreview.ratingAvg,
    preview_rating_count: i.userPreview.ratingCount,
    preview_area: i.userPreview.area,
    preview_has_video: i.userPreview.hasVideo,
  };
}

function unlockFromRow(r: Row): ContactUnlock {
  return {
    id: r.id as string,
    unlockingUserId: r.unlocking_user_id as string,
    unlockedUserId: r.unlocked_user_id as string,
    unlockedAt: r.unlocked_at as string,
    paymentMethod: r.payment_method as ContactUnlock['paymentMethod'],
    amountPaid: Number(r.amount_paid ?? 0),
    reference: (r.reference as string) ?? '',
  };
}

function unlockToRow(u: ContactUnlock): Row {
  return {
    id: u.id,
    unlocking_user_id: u.unlockingUserId,
    unlocked_user_id: u.unlockedUserId,
    unlocked_at: u.unlockedAt,
    payment_method: u.paymentMethod,
    amount_paid: u.amountPaid,
    reference: u.reference,
  };
}

function paymentFromRow(r: Row): PaymentTransaction {
  return {
    id: r.id as string,
    transId: r.trans_id as string,
    userId: r.user_id as string,
    amount: Number(r.amount),
    status: r.status as PaymentTransaction['status'],
    phone: r.phone as string,
    targetUserId: (r.target_user_id as string) ?? undefined,
    createdAt: r.created_at as string,
  };
}

function paymentToRow(p: PaymentTransaction): Row {
  return {
    id: p.id,
    trans_id: p.transId,
    user_id: p.userId,
    amount: p.amount,
    status: p.status,
    phone: p.phone,
    target_user_id: p.targetUserId ?? null,
    created_at: p.createdAt,
  };
}

function reviewFromRow(r: Row): Review {
  return {
    id: r.id as string,
    reviewerId: r.reviewer_id as string,
    reviewerName: (r.reviewer_name as string) ?? '',
    reviewedUserId: r.reviewed_user_id as string,
    taskId: (r.task_id as string) ?? undefined,
    rating: Number(r.rating),
    comment: (r.comment as string) ?? '',
    createdAt: r.created_at as string,
  };
}

function reviewToRow(r: Review): Row {
  return {
    id: r.id,
    reviewer_id: r.reviewerId,
    reviewer_name: r.reviewerName,
    reviewed_user_id: r.reviewedUserId,
    task_id: r.taskId ?? null,
    rating: r.rating,
    comment: r.comment,
    created_at: r.createdAt,
  };
}

function assertOk<T>(data: T | null, error: { message: string } | null, context: string): T {
  if (error) throw new Error(`[supabaseStore] ${context}: ${error.message}`);
  if (data == null) throw new Error(`[supabaseStore] ${context}: no data returned`);
  return data;
}

export function createSupabaseStore(url: string, serviceKey: string): DataStore {
  const sb: SupabaseClient = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  return {
    async listUsers(filter) {
      let q = sb.from('users').select('*');
      if (filter.phone) {
        q = q.eq('phone', filter.phone.replace(/\D/g, ''));
      } else {
        if (filter.city) q = q.ilike('city', filter.city);
        if (filter.category) q = q.contains('services_offered', [filter.category]);
        if (filter.search) {
          const s = filter.search.replace(/[%_]/g, '');
          q = q.or(`name.ilike.%${s}%,specialty.ilike.%${s}%,area.ilike.%${s}%,city.ilike.%${s}%`);
        }
      }
      const { data, error } = await q;
      return assertOk(data, error, 'listUsers').map(userFromRow);
    },
    async getUser(id) {
      const { data, error } = await sb.from('users').select('*').eq('id', id).maybeSingle();
      if (error) throw new Error(`[supabaseStore] getUser: ${error.message}`);
      return data ? userFromRow(data) : undefined;
    },
    async findUserByPhone(phone, exceptId) {
      let q = sb.from('users').select('*').eq('phone', phone.replace(/\s+/g, ''));
      if (exceptId) q = q.neq('id', exceptId);
      const { data, error } = await q.maybeSingle();
      if (error) throw new Error(`[supabaseStore] findUserByPhone: ${error.message}`);
      return data ? userFromRow(data) : undefined;
    },
    async findUserByEmail(email) {
      const { data, error } = await sb.from('users').select('*').ilike('email', email.trim()).maybeSingle();
      if (error) throw new Error(`[supabaseStore] findUserByEmail: ${error.message}`);
      return data ? userFromRow(data) : undefined;
    },
    async createUser(user) {
      const { data, error } = await sb.from('users').insert(userToRow(user)).select().single();
      return userFromRow(assertOk(data, error, 'createUser'));
    },
    async updateUser(id, patch) {
      const row = userPatchToRow(patch);
      if (Object.keys(row).length === 0) return this.getUser(id);
      const { data, error } = await sb.from('users').update(row).eq('id', id).select().maybeSingle();
      if (error) throw new Error(`[supabaseStore] updateUser: ${error.message}`);
      return data ? userFromRow(data) : undefined;
    },
    async deleteUser(id) {
      const { error, count } = await sb.from('users').delete({ count: 'exact' }).eq('id', id);
      if (error) throw new Error(`[supabaseStore] deleteUser: ${error.message}`);
      return (count ?? 0) > 0;
    },
    async syncOwnerSnapshot(ownerId, patch) {
      const servicePatch: Row = {};
      if (patch.name !== undefined) servicePatch.posted_by_name = patch.name;
      if (patch.phone !== undefined) servicePatch.posted_by_phone = patch.phone;
      if (patch.ratingAvg !== undefined) servicePatch.posted_by_rating = patch.ratingAvg;
      if (Object.keys(servicePatch).length > 0) {
        const { error } = await sb.from('services').update(servicePatch).eq('posted_by', ownerId);
        if (error) throw new Error(`[supabaseStore] syncOwnerSnapshot(services): ${error.message}`);
      }
      if (patch.name !== undefined) {
        const { error } = await sb.from('tasks').update({ posted_by_name: patch.name }).eq('posted_by', ownerId);
        if (error) throw new Error(`[supabaseStore] syncOwnerSnapshot(tasks): ${error.message}`);
      }
    },
    async countUsers(filter) {
      let q = sb.from('users').select('*', { count: 'exact', head: true });
      if (filter?.excludeClients) q = q.neq('role_type', 'client');
      const { count, error } = await q;
      if (error) throw new Error(`[supabaseStore] countUsers: ${error.message}`);
      return count ?? 0;
    },

    async listTasks(filter) {
      let q = sb.from('tasks').select('*').order('created_at', { ascending: false });
      if (filter.category) q = q.eq('category', filter.category);
      if (filter.city) q = q.ilike('city', filter.city);
      if (filter.urgency) q = q.eq('urgency', filter.urgency);
      const { data, error } = await q;
      return assertOk(data, error, 'listTasks').map(taskFromRow);
    },
    async createTask(task) {
      const { data, error } = await sb.from('tasks').insert(taskToRow(task)).select().single();
      return taskFromRow(assertOk(data, error, 'createTask'));
    },
    async deleteTask(id) {
      const { error, count } = await sb.from('tasks').delete({ count: 'exact' }).eq('id', id);
      if (error) throw new Error(`[supabaseStore] deleteTask: ${error.message}`);
      return (count ?? 0) > 0;
    },
    async countTasks() {
      const { count, error } = await sb.from('tasks').select('*', { count: 'exact', head: true });
      if (error) throw new Error(`[supabaseStore] countTasks: ${error.message}`);
      return count ?? 0;
    },

    async listServices(filter) {
      let q = sb.from('services').select('*').order('created_at', { ascending: false });
      if (filter.activeOnly !== false) q = q.eq('status', 'active');
      if (filter.category) q = q.eq('category', filter.category);
      if (filter.city) q = q.ilike('city', filter.city);
      const { data, error } = await q;
      return assertOk(data, error, 'listServices').map(serviceFromRow);
    },
    async createService(service) {
      const { data, error } = await sb.from('services').insert(serviceToRow(service)).select().single();
      return serviceFromRow(assertOk(data, error, 'createService'));
    },
    async deleteService(id) {
      const { error, count } = await sb.from('services').delete({ count: 'exact' }).eq('id', id);
      if (error) throw new Error(`[supabaseStore] deleteService: ${error.message}`);
      return (count ?? 0) > 0;
    },
    async countActiveServicesIn(city, category) {
      const { count, error } = await sb
        .from('services')
        .select('*', { count: 'exact', head: true })
        .ilike('city', city)
        .eq('category', category)
        .eq('status', 'active');
      if (error) throw new Error(`[supabaseStore] countActiveServicesIn: ${error.message}`);
      return count ?? 0;
    },
    async countActiveServices() {
      const { count, error } = await sb
        .from('services')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');
      if (error) throw new Error(`[supabaseStore] countActiveServices: ${error.message}`);
      return count ?? 0;
    },

    async findInterest(userId, postId, postType) {
      const { data, error } = await sb
        .from('interests')
        .select('*')
        .eq('user_id', userId)
        .eq('post_id', postId)
        .eq('post_type', postType)
        .maybeSingle();
      if (error) throw new Error(`[supabaseStore] findInterest: ${error.message}`);
      return data ? interestFromRow(data) : undefined;
    },
    async listInterests(filter) {
      let q = sb.from('interests').select('*');
      if (filter.postId) q = q.eq('post_id', filter.postId);
      if (filter.userId) q = q.eq('user_id', filter.userId);
      const { data, error } = await q;
      return assertOk(data, error, 'listInterests').map(interestFromRow);
    },
    async createInterest(signal) {
      const { data, error } = await sb.from('interests').insert(interestToRow(signal)).select().single();
      return interestFromRow(assertOk(data, error, 'createInterest'));
    },
    async countInterests(postId) {
      const { count, error } = await sb
        .from('interests')
        .select('*', { count: 'exact', head: true })
        .eq('post_id', postId);
      if (error) throw new Error(`[supabaseStore] countInterests: ${error.message}`);
      return count ?? 0;
    },
    async setPostInterestCount(postId, postType, count) {
      const table = postType === 'task' ? 'tasks' : 'services';
      const { error } = await sb.from(table).update({ interested_count: count }).eq('id', postId);
      if (error) throw new Error(`[supabaseStore] setPostInterestCount: ${error.message}`);
    },

    async findLatestUnlock(unlockingUserId, unlockedUserId) {
      const { data, error } = await sb
        .from('contact_unlocks')
        .select('*')
        .eq('unlocking_user_id', unlockingUserId)
        .eq('unlocked_user_id', unlockedUserId)
        .order('unlocked_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw new Error(`[supabaseStore] findLatestUnlock: ${error.message}`);
      return data ? unlockFromRow(data) : undefined;
    },
    async listUnlocksForUser(unlockingUserId) {
      const { data, error } = await sb.from('contact_unlocks').select('*').eq('unlocking_user_id', unlockingUserId);
      return assertOk(data, error, 'listUnlocksForUser').map(unlockFromRow);
    },
    async createUnlock(unlock) {
      const { data, error } = await sb.from('contact_unlocks').insert(unlockToRow(unlock)).select().single();
      return unlockFromRow(assertOk(data, error, 'createUnlock'));
    },
    async updateUnlock(id, patch) {
      const row: Row = {};
      if (patch.unlockedAt !== undefined) row.unlocked_at = patch.unlockedAt;
      if (patch.paymentMethod !== undefined) row.payment_method = patch.paymentMethod;
      if (patch.amountPaid !== undefined) row.amount_paid = patch.amountPaid;
      if (patch.reference !== undefined) row.reference = patch.reference;
      const { data, error } = await sb.from('contact_unlocks').update(row).eq('id', id).select().maybeSingle();
      if (error) throw new Error(`[supabaseStore] updateUnlock: ${error.message}`);
      return data ? unlockFromRow(data) : undefined;
    },

    async getPaymentByTransId(transId) {
      const { data, error } = await sb.from('payments').select('*').eq('trans_id', transId).maybeSingle();
      if (error) throw new Error(`[supabaseStore] getPaymentByTransId: ${error.message}`);
      return data ? paymentFromRow(data) : undefined;
    },
    async createPayment(payment) {
      const { data, error } = await sb.from('payments').insert(paymentToRow(payment)).select().single();
      return paymentFromRow(assertOk(data, error, 'createPayment'));
    },
    async updatePayment(id, patch) {
      const row: Row = {};
      if (patch.status !== undefined) row.status = patch.status;
      const { data, error } = await sb.from('payments').update(row).eq('id', id).select().maybeSingle();
      if (error) throw new Error(`[supabaseStore] updatePayment: ${error.message}`);
      return data ? paymentFromRow(data) : undefined;
    },
    async listPaymentsForUser(userId) {
      const { data, error } = await sb
        .from('payments')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      return assertOk(data, error, 'listPaymentsForUser').map(paymentFromRow);
    },

    async listReviews() {
      const { data, error } = await sb
        .from('reviews')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(200);
      return assertOk(data, error, 'listReviews').map(reviewFromRow);
    },
    async listReviewsForUser(userId) {
      const { data, error } = await sb
        .from('reviews')
        .select('*')
        .eq('reviewed_user_id', userId)
        .order('created_at', { ascending: false });
      return assertOk(data, error, 'listReviewsForUser').map(reviewFromRow);
    },
    async createReview(review) {
      const { data, error } = await sb.from('reviews').insert(reviewToRow(review)).select().single();
      return reviewFromRow(assertOk(data, error, 'createReview'));
    },

    async setPasswordResetCode(phone, code, expiresAt) {
      const { error } = await sb
        .from('password_resets')
        .upsert({ phone, code, expires_at: expiresAt }, { onConflict: 'phone' });
      if (error) throw new Error(`[supabaseStore] setPasswordResetCode: ${error.message}`);
    },
    async getPasswordResetCode(phone) {
      const { data, error } = await sb.from('password_resets').select('*').eq('phone', phone).maybeSingle();
      if (error) throw new Error(`[supabaseStore] getPasswordResetCode: ${error.message}`);
      return data ? { code: data.code as string, expiresAt: data.expires_at as string } : undefined;
    },
    async clearPasswordResetCode(phone) {
      const { error } = await sb.from('password_resets').delete().eq('phone', phone);
      if (error) throw new Error(`[supabaseStore] clearPasswordResetCode: ${error.message}`);
    },
  };
}
