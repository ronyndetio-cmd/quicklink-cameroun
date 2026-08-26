import type {
  ApiErrorBody,
  InterestSignal,
  PaymentStatus,
  PaymentTransaction,
  Review,
  ServiceOffer,
  Task,
  UnlockedContact,
  UnlockStatus,
  User,
} from './types';

// Same-origin '/api' by default (works when the frontend is served by this
// same Express app, or via Vite's dev proxy). If the frontend is deployed
// separately (e.g. Netlify) from the API (e.g. Railway), set VITE_API_URL
// to the API's full origin, e.g. https://your-api.up.railway.app/api.
const BASE = import.meta.env.VITE_API_URL || '/api';

export class ApiError extends Error {
  status: number;
  body: Partial<ApiErrorBody>;

  constructor(status: number, body: Partial<ApiErrorBody>) {
    super(body.error || `Request failed (${status})`);
    this.status = status;
    this.body = body;
  }

  localized(lang: 'fr' | 'en'): string {
    return (lang === 'fr' ? this.body.fr : this.body.en) ?? this.message;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
  });
  if (!res.ok) {
    let body: Partial<ApiErrorBody> = {};
    try {
      body = await res.json();
    } catch {
      /* body wasn't JSON */
    }
    throw new ApiError(res.status, body);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

function qs(params: Record<string, string | undefined>): string {
  const usp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) if (v) usp.set(k, v);
  const s = usp.toString();
  return s ? `?${s}` : '';
}

export type { UnlockedContact };

export const api = {
  listUsers(
    params: { requestingUserId?: string; city?: string; category?: string; search?: string; phone?: string } = {},
  ) {
    return request<User[]>(`/users${qs(params)}`);
  },
  getUser(id: string, requestingUserId?: string) {
    return request<User>(`/users/${id}${qs({ requestingUserId })}`);
  },
  createUser(body: Record<string, unknown>) {
    return request<User>('/users', { method: 'POST', body: JSON.stringify(body) });
  },
  updateUser(id: string, body: Record<string, unknown>) {
    return request<User>(`/users/${id}`, { method: 'PUT', body: JSON.stringify(body) });
  },
  setVideo(id: string, profileVideoUrl: string) {
    return request<User>(`/users/${id}/video`, { method: 'POST', body: JSON.stringify({ profileVideoUrl }) });
  },
  deleteUser(id: string) {
    return request<{ ok: true }>(`/users/${id}`, { method: 'DELETE' });
  },
  /** `identifier` is either a phone number or an email — whichever the account has. */
  login(identifier: string, password: string) {
    return request<User>('/auth/login', { method: 'POST', body: JSON.stringify({ phone: identifier, password }) });
  },
  /** `identifier` is either a phone number or an email — whichever the account has. */
  forgotPassword(identifier: string) {
    return request<{ sent: boolean; channel: 'sms' | 'email'; phone: string; devCode?: string; instructionFr: string; instructionEn: string }>(
      '/auth/forgot-password',
      { method: 'POST', body: JSON.stringify({ identifier }) },
    );
  },
  resetPassword(phone: string, code: string, newPassword: string) {
    return request<{ ok: true }>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ phone, code, newPassword }),
    });
  },

  listTasks(params: { category?: string; city?: string; urgency?: string; search?: string } = {}) {
    return request<Task[]>(`/tasks${qs(params)}`);
  },
  createTask(body: Record<string, unknown>) {
    return request<Task>('/tasks', { method: 'POST', body: JSON.stringify(body) });
  },
  deleteTask(id: string) {
    return request<{ ok: true }>(`/tasks/${id}`, { method: 'DELETE' });
  },

  listServices(params: { category?: string; city?: string; search?: string; requestingUserId?: string } = {}) {
    return request<ServiceOffer[]>(`/services${qs(params)}`);
  },
  createService(body: Record<string, unknown>) {
    return request<ServiceOffer>('/services', { method: 'POST', body: JSON.stringify(body) });
  },
  deleteService(id: string) {
    return request<{ ok: true }>(`/services/${id}`, { method: 'DELETE' });
  },

  listInterests(params: { postId?: string; userId?: string } = {}) {
    return request<InterestSignal[]>(`/interests${qs(params)}`);
  },
  addInterest(body: { userId: string; postId: string; postType: 'task' | 'service_offer' }) {
    return request<{ created: boolean; signal: InterestSignal | null; interestedCount: number }>('/interests', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },

  checkUnlock(userA: string | undefined, userB: string) {
    return request<UnlockStatus>(`/unlocks/check${qs({ userA, userB })}`);
  },
  listUnlocks(userId: string) {
    return request<UnlockedContact[]>(`/unlocks${qs({ userId })}`);
  },

  /** Shaped after Fapshi's collect API — swap the server implementation, not this call. */
  initiatePayment(body: { userId: string; phone: string; targetUserId: string }) {
    return request<{
      transaction: PaymentTransaction;
      transId: string;
      instructionFr: string;
      instructionEn: string;
    }>('/payments/initiate', { method: 'POST', body: JSON.stringify(body) });
  },
  confirmPayment(transId: string, status: Extract<PaymentStatus, 'SUCCESSFUL' | 'FAILED'>) {
    return request<{ transaction: PaymentTransaction; unlock?: unknown; status?: UnlockStatus }>(
      '/payments/webhook',
      { method: 'POST', body: JSON.stringify({ transId, status }) },
    );
  },
  paymentStatus(transId: string) {
    return request<{ transaction: PaymentTransaction }>(`/payments/status/${transId}`);
  },
  paymentHistory(userId: string) {
    return request<PaymentTransaction[]>(`/payments/history${qs({ userId })}`);
  },

  listReviews() {
    return request<Review[]>('/reviews');
  },
  listReviewsFor(userId: string) {
    return request<Review[]>(`/reviews/${userId}`);
  },
  createReview(body: { reviewerId: string; reviewedUserId: string; rating: number; comment?: string; taskId?: string }) {
    return request<{ review: Review; user: User }>('/reviews', { method: 'POST', body: JSON.stringify(body) });
  },

  aiChat(message: string, lang: 'fr' | 'en', history: { role: string; text: string }[]) {
    return request<{ reply: string; source: string }>('/ai/chat', {
      method: 'POST',
      body: JSON.stringify({ message, lang, history }),
    });
  },
  translate(text: string, target: 'fr' | 'en') {
    return request<{ translated: string | null; available: boolean }>('/translate', {
      method: 'POST',
      body: JSON.stringify({ text, target }),
    });
  },

  meta() {
    return request<{
      cities: number;
      professions: number;
      unlockPrice: number;
      providers: number;
      tasks: number;
      services: number;
      aiEnabled: boolean;
    }>('/meta');
  },
};
