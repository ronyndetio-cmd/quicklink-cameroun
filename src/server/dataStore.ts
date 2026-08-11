import type { ContactUnlock, InterestSignal, PaymentTransaction, Review, ServiceOffer, Task, User } from '../types';

/**
 * Every persistence operation the API needs, independent of where the data
 * actually lives. `server.ts` only ever calls through this interface — the
 * business rules (unlock windows, rating recomputation, filler generation,
 * search ranking) stay in server.ts and are identical no matter which
 * implementation is active.
 *
 * Two implementations exist: `memoryStore` (process RAM, resets on
 * restart — the default, zero-setup dev experience) and `supabaseStore`
 * (Postgres via Supabase, used automatically once SUPABASE_URL and
 * SUPABASE_SERVICE_KEY are set). See src/server/store.ts for the switch.
 */
export interface DataStore {
  /* ------------------------------- users ------------------------------ */
  listUsers(filter: { city?: string; category?: string; search?: string; phone?: string }): Promise<User[]>;
  getUser(id: string): Promise<User | undefined>;
  findUserByPhone(phone: string, exceptId?: string): Promise<User | undefined>;
  createUser(user: User): Promise<User>;
  updateUser(id: string, patch: Partial<User>): Promise<User | undefined>;
  deleteUser(id: string): Promise<boolean>;
  /** Denormalized owner snapshot on that user's tasks/services — kept in sync on profile edits and rating changes. */
  syncOwnerSnapshot(ownerId: string, patch: { name?: string; phone?: string; ratingAvg?: number }): Promise<void>;
  countUsers(filter?: { excludeClients?: boolean }): Promise<number>;

  /* ------------------------------- tasks ------------------------------ */
  listTasks(filter: { category?: string; city?: string; urgency?: string }): Promise<Task[]>;
  createTask(task: Task): Promise<Task>;
  deleteTask(id: string): Promise<boolean>;
  countTasks(): Promise<number>;

  /* ----------------------------- services ------------------------------ */
  listServices(filter: { category?: string; city?: string; activeOnly?: boolean }): Promise<ServiceOffer[]>;
  createService(service: ServiceOffer): Promise<ServiceOffer>;
  deleteService(id: string): Promise<boolean>;
  countActiveServicesIn(city: string, category: string): Promise<number>;
  countActiveServices(): Promise<number>;

  /* ----------------------------- interests ------------------------------ */
  findInterest(userId: string, postId: string, postType: string): Promise<InterestSignal | undefined>;
  listInterests(filter: { postId?: string; userId?: string }): Promise<InterestSignal[]>;
  createInterest(signal: InterestSignal): Promise<InterestSignal>;
  countInterests(postId: string): Promise<number>;
  setPostInterestCount(postId: string, postType: 'task' | 'service_offer', count: number): Promise<void>;

  /* ------------------------------- unlocks ------------------------------ */
  findLatestUnlock(unlockingUserId: string, unlockedUserId: string): Promise<ContactUnlock | undefined>;
  listUnlocksForUser(unlockingUserId: string): Promise<ContactUnlock[]>;
  createUnlock(unlock: ContactUnlock): Promise<ContactUnlock>;
  updateUnlock(id: string, patch: Partial<ContactUnlock>): Promise<ContactUnlock | undefined>;

  /* ------------------------------- payments ------------------------------ */
  getPaymentByTransId(transId: string): Promise<PaymentTransaction | undefined>;
  createPayment(payment: PaymentTransaction): Promise<PaymentTransaction>;
  updatePayment(id: string, patch: Partial<PaymentTransaction>): Promise<PaymentTransaction | undefined>;
  listPaymentsForUser(userId: string): Promise<PaymentTransaction[]>;

  /* ------------------------------- reviews ------------------------------ */
  listReviews(): Promise<Review[]>;
  listReviewsForUser(userId: string): Promise<Review[]>;
  createReview(review: Review): Promise<Review>;
}

export const nextId = (prefix: string) =>
  `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
