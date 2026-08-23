import type { ContactUnlock, InterestSignal, PaymentTransaction, Review, ServiceOffer, Task, User } from '../types';
import { SEED_REVIEWS, SEED_SERVICES, SEED_TASKS, SEED_UNLOCKS, SEED_USERS } from '../data/seed';
import type { DataStore } from './dataStore';
import { nextId } from './dataStore';

/**
 * Zero-setup default: everything lives in process RAM and resets on
 * restart. This is what runs when SUPABASE_URL / SUPABASE_SERVICE_KEY
 * aren't set — good for local dev and previews, not for production at
 * scale (see supabaseStore.ts for that).
 */
export function createMemoryStore(): DataStore {
  const users: User[] = [...SEED_USERS];
  const tasks: Task[] = [...SEED_TASKS];
  const services: ServiceOffer[] = [...SEED_SERVICES];
  const interests: InterestSignal[] = [];
  const unlocks: ContactUnlock[] = [...SEED_UNLOCKS];
  const payments: PaymentTransaction[] = [];
  const reviews: Review[] = [...SEED_REVIEWS];
  const passwordResets = new Map<string, { code: string; expiresAt: string }>();

  // Seed a handful of interest signals so counts don't start at a flat zero.
  const seedPairs: [string, string, 'task' | 'service_offer'][] = [
    ['u-2', 't-1', 'task'],
    ['u-8', 't-2', 'task'],
    ['u-9', 't-2', 'task'],
    ['u-4', 't-3', 'task'],
    ['u-5', 't-4', 'task'],
    ['u-2', 't-4', 'task'],
    ['u-3', 't-7', 'task'],
    ['u-1', 's-1', 'service_offer'],
    ['u-6', 's-1', 'service_offer'],
    ['u-1', 's-11', 'service_offer'],
    ['u-10', 's-7', 'service_offer'],
  ];
  for (const [userId, postId, postType] of seedPairs) {
    const user = users.find((u) => u.id === userId);
    interests.push({
      id: nextId('int'),
      userId,
      postId,
      postType,
      createdAt: new Date().toISOString(),
      userPreview: {
        serviceType: user?.specialty ?? 'Client',
        ratingAvg: user?.ratingAvg ?? 0,
        ratingCount: user?.ratingCount ?? 0,
        area: user ? `${user.area}, ${user.city}` : '',
        hasVideo: Boolean(user?.hasVideoBio),
      },
    });
    const post = postType === 'task' ? tasks.find((t) => t.id === postId) : services.find((s) => s.id === postId);
    if (post) post.interestedCount = interests.filter((i) => i.postId === postId).length;
  }

  return {
    async listUsers(filter) {
      let list = users;
      if (filter.phone) {
        const clean = filter.phone.replace(/\D/g, '');
        return list.filter((u) => u.phone.replace(/\D/g, '') === clean);
      }
      if (filter.city) list = list.filter((u) => u.city.toLowerCase() === filter.city!.toLowerCase());
      if (filter.category) list = list.filter((u) => (u.servicesOffered ?? []).includes(filter.category!));
      if (filter.search) {
        const q = filter.search.toLowerCase();
        list = list.filter((u) => `${u.name} ${u.specialty ?? ''} ${u.area} ${u.city}`.toLowerCase().includes(q));
      }
      return list;
    },
    async getUser(id) {
      return users.find((u) => u.id === id);
    },
    async findUserByPhone(phone, exceptId) {
      const clean = phone.replace(/\s+/g, '');
      return users.find((u) => u.phone.replace(/\s+/g, '') === clean && u.id !== exceptId);
    },
    async findUserByEmail(email) {
      const clean = email.trim().toLowerCase();
      return users.find((u) => (u.email ?? '').trim().toLowerCase() === clean);
    },
    async createUser(user) {
      users.push(user);
      return user;
    },
    async updateUser(id, patch) {
      const user = users.find((u) => u.id === id);
      if (!user) return undefined;
      Object.assign(user, patch);
      return user;
    },
    async deleteUser(id) {
      const i = users.findIndex((u) => u.id === id);
      if (i === -1) return false;
      users.splice(i, 1);
      return true;
    },
    async syncOwnerSnapshot(ownerId, patch) {
      for (const s of services) {
        if (s.postedBy !== ownerId) continue;
        if (patch.name !== undefined) s.postedByName = patch.name;
        if (patch.phone !== undefined) s.postedByPhone = patch.phone;
        if (patch.ratingAvg !== undefined) s.postedByRating = patch.ratingAvg;
      }
      if (patch.name !== undefined) {
        for (const t of tasks) if (t.postedBy === ownerId) t.postedByName = patch.name;
      }
    },
    async countUsers(filter) {
      if (filter?.excludeClients) return users.filter((u) => u.roleType !== 'client').length;
      return users.length;
    },

    async listTasks(filter) {
      let list = [...tasks];
      if (filter.category) list = list.filter((t) => t.category === filter.category);
      if (filter.city) list = list.filter((t) => t.city.toLowerCase() === filter.city!.toLowerCase());
      if (filter.urgency) list = list.filter((t) => t.urgency === filter.urgency);
      list.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
      return list;
    },
    async createTask(task) {
      tasks.unshift(task);
      return task;
    },
    async deleteTask(id) {
      const i = tasks.findIndex((t) => t.id === id);
      if (i === -1) return false;
      tasks.splice(i, 1);
      return true;
    },
    async countTasks() {
      return tasks.length;
    },

    async listServices(filter) {
      let list = filter.activeOnly === false ? [...services] : services.filter((s) => s.status === 'active');
      if (filter.category) list = list.filter((s) => s.category === filter.category);
      if (filter.city) list = list.filter((s) => s.city.toLowerCase() === filter.city!.toLowerCase());
      return [...list].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
    },
    async createService(service) {
      services.unshift(service);
      return service;
    },
    async deleteService(id) {
      const i = services.findIndex((s) => s.id === id);
      if (i === -1) return false;
      services.splice(i, 1);
      return true;
    },
    async countActiveServicesIn(city, category) {
      return services.filter(
        (s) => s.city.toLowerCase() === city.toLowerCase() && s.category === category && s.status === 'active',
      ).length;
    },
    async countActiveServices() {
      return services.filter((s) => s.status === 'active').length;
    },

    async findInterest(userId, postId, postType) {
      return interests.find((i) => i.userId === userId && i.postId === postId && i.postType === postType);
    },
    async listInterests(filter) {
      let list = interests;
      if (filter.postId) list = list.filter((i) => i.postId === filter.postId);
      if (filter.userId) list = list.filter((i) => i.userId === filter.userId);
      return list;
    },
    async createInterest(signal) {
      interests.push(signal);
      return signal;
    },
    async countInterests(postId) {
      return interests.filter((i) => i.postId === postId).length;
    },
    async setPostInterestCount(postId, postType, count) {
      const post = postType === 'task' ? tasks.find((t) => t.id === postId) : services.find((s) => s.id === postId);
      if (post) post.interestedCount = count;
    },

    async findLatestUnlock(unlockingUserId, unlockedUserId) {
      return unlocks
        .filter((u) => u.unlockingUserId === unlockingUserId && u.unlockedUserId === unlockedUserId)
        .sort((a, b) => +new Date(b.unlockedAt) - +new Date(a.unlockedAt))[0];
    },
    async listUnlocksForUser(unlockingUserId) {
      return unlocks.filter((u) => u.unlockingUserId === unlockingUserId);
    },
    async createUnlock(unlock) {
      unlocks.push(unlock);
      return unlock;
    },
    async updateUnlock(id, patch) {
      const unlock = unlocks.find((u) => u.id === id);
      if (!unlock) return undefined;
      Object.assign(unlock, patch);
      return unlock;
    },

    async getPaymentByTransId(transId) {
      return payments.find((p) => p.transId === transId);
    },
    async createPayment(payment) {
      payments.unshift(payment);
      return payment;
    },
    async updatePayment(id, patch) {
      const payment = payments.find((p) => p.id === id);
      if (!payment) return undefined;
      Object.assign(payment, patch);
      return payment;
    },
    async listPaymentsForUser(userId) {
      return payments.filter((p) => p.userId === userId);
    },

    async listReviews() {
      return [...reviews].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
    },
    async listReviewsForUser(userId) {
      return reviews
        .filter((r) => r.reviewedUserId === userId)
        .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
    },
    async createReview(review) {
      reviews.unshift(review);
      return review;
    },

    async setPasswordResetCode(phone, code, expiresAt) {
      passwordResets.set(phone, { code, expiresAt });
    },
    async getPasswordResetCode(phone) {
      return passwordResets.get(phone);
    },
    async clearPasswordResetCode(phone) {
      passwordResets.delete(phone);
    },
  };
}
