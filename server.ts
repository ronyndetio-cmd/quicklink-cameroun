import express, { type NextFunction, type Request, type RequestHandler, type Response } from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import path from 'node:path';
import fs from 'node:fs';

import type { ContactUnlock, InterestSignal, PaymentTransaction, ServiceOffer, Task, UnlockStatus, User } from './src/types';
import { UNLOCK_PRICE, UNLOCK_WINDOW_MS, SUPPORT_WHATSAPP } from './src/types';
import { store, usingSupabase } from './src/server/store';
import { nextId } from './src/server/dataStore';
import { generateTechnicians } from './src/lib/generator';
import { avatarFor } from './src/lib/media';
import { coordsFor } from './src/lib/geo';
import { scoreMatch, relatedCategories } from './src/lib/search';
import { CITY_COUNT } from './src/data/cities';
import { PROFESSION_COUNT } from './src/data/professions';

const isProd = process.env.NODE_ENV === 'production';
const PORT = Number(process.env.PORT ?? 5173);
const rootDir = process.cwd();

/** Express 4 doesn't forward rejected async handlers to error middleware on its own. */
const ah =
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>): RequestHandler =>
  (req, res, next) => {
    fn(req, res, next).catch(next);
  };

/* ------------------------------------------------------------------ *
 * Unlock rules — recomputed on every read, never stored as a flag
 * ------------------------------------------------------------------ */
async function unlockStatus(viewerId: string | undefined, targetId: string): Promise<UnlockStatus> {
  if (!viewerId) return { unlocked: false, expiresAt: null, remainingMs: 0, via: null };
  if (viewerId === targetId) return { unlocked: true, expiresAt: null, remainingMs: Infinity, via: 'self' };

  const record = await store.findLatestUnlock(viewerId, targetId);
  if (!record) return { unlocked: false, expiresAt: null, remainingMs: 0, via: null };

  const expires = new Date(record.unlockedAt).getTime() + UNLOCK_WINDOW_MS;
  const remaining = expires - Date.now();
  if (remaining <= 0) return { unlocked: false, expiresAt: null, remainingMs: 0, via: null };

  return {
    unlocked: true,
    expiresAt: new Date(expires).toISOString(),
    remainingMs: remaining,
    via: record.paymentMethod,
  };
}

function maskPhone(phone: string): string {
  const clean = (phone ?? '').replace(/\s+/g, '');
  return `${clean.slice(0, 3)} *** ***`;
}

async function publicUser(user: User, viewerId?: string): Promise<User> {
  const status = await unlockStatus(viewerId, user.id);
  const { passwordHash: _passwordHash, ...rest } = user;
  return {
    ...rest,
    phone: status.unlocked ? user.phone : maskPhone(user.phone),
    whatsapp: status.unlocked ? user.whatsapp || user.phone : maskPhone(user.whatsapp || user.phone),
    isUnlocked: status.unlocked,
  };
}

async function publicService(s: ServiceOffer, viewerId?: string): Promise<ServiceOffer> {
  const owner = await store.getUser(s.postedBy);
  const status = await unlockStatus(viewerId, s.postedBy);
  return {
    ...s,
    postedByName: owner?.name ?? s.postedByName,
    postedByRating: owner?.ratingAvg ?? s.postedByRating,
    postedByPhone: status.unlocked ? owner?.phone ?? s.postedByPhone : maskPhone(owner?.phone ?? s.postedByPhone ?? ''),
  };
}

async function grantUnlock(
  unlockingUserId: string,
  unlockedUserId: string,
  amountPaid: number,
  reference: string,
): Promise<ContactUnlock> {
  const existing = await store.findLatestUnlock(unlockingUserId, unlockedUserId);
  if (existing) {
    // Renewing restarts the full 24-hour window.
    const updated = await store.updateUnlock(existing.id, {
      unlockedAt: new Date().toISOString(),
      amountPaid,
      reference,
    });
    return updated!;
  }
  const record: ContactUnlock = {
    id: nextId('unl'),
    unlockingUserId,
    unlockedUserId,
    unlockedAt: new Date().toISOString(),
    paymentMethod: 'fapshi',
    amountPaid,
    reference,
  };
  return store.createUnlock(record);
}

async function addInterest(
  userId: string,
  postId: string,
  postType: 'task' | 'service_offer',
): Promise<InterestSignal | null> {
  const already = await store.findInterest(userId, postId, postType);
  if (already) return null;
  const user = await store.getUser(userId);
  const signal: InterestSignal = {
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
  };
  await store.createInterest(signal);
  const count = await store.countInterests(postId);
  await store.setPostInterestCount(postId, postType, count);
  return signal;
}

/** Keeps every city+category combination populated with at least 2 listings. */
async function ensureFillers(city?: string, category?: string): Promise<void> {
  if (!city || !category) return;
  const existingCount = await store.countActiveServicesIn(city, category);
  if (existingCount >= 2) return;
  const needed = 2 - existingCount;
  const generated = generateTechnicians(city, category, needed, existingCount);
  for (const { user, service } of generated) {
    if (await store.getUser(user.id)) continue;
    let phone = user.phone;
    let guard = 0;
    while ((await store.findUserByPhone(phone)) && guard++ < 50) {
      phone = `6${Math.floor(50000000 + Math.random() * 49999999)}`.slice(0, 9);
    }
    await store.createUser({ ...user, phone });
    await store.createService({ ...service, postedByPhone: phone });
  }
}

async function recomputeRating(userId: string): Promise<void> {
  const user = await store.getUser(userId);
  if (!user) return;
  const rs = await store.listReviewsForUser(userId);
  const ratingCount = rs.length;
  const ratingAvg = rs.length ? Math.round((rs.reduce((a, r) => a + r.rating, 0) / rs.length) * 10) / 10 : 0;
  await store.updateUser(userId, { ratingAvg, ratingCount });
  await store.syncOwnerSnapshot(userId, { ratingAvg });
}

const bilingual = (fr: string, en: string) => ({ error: `${fr} / ${en}`, fr, en });

/* ------------------------------------------------------------------ *
 * App
 * ------------------------------------------------------------------ */
// If the frontend is deployed separately (e.g. Netlify) from this API
// (e.g. Railway), set CORS_ORIGIN to its URL(s), comma-separated. Left
// unset, the API reflects whatever origin asked — fine for same-origin
// deploys and local dev, since there's no cookie/session auth to protect.
const corsOrigins = (process.env.CORS_ORIGIN ?? '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

const app = express();
app.use(cors({ origin: corsOrigins.length > 0 ? corsOrigins : true }));
app.use(express.json({ limit: '4mb' }));

const api = express.Router();

/* ---------------------------- users ---------------------------- */
api.get(
  '/users',
  ah(async (req, res) => {
    const viewer = req.query.requestingUserId as string | undefined;
    const { city, category, search, phone } = req.query as Record<string, string | undefined>;
    await ensureFillers(city, category);
    const list = await store.listUsers({ city, category, search, phone });
    res.json(await Promise.all(list.map((u) => publicUser(u, viewer))));
  }),
);

api.get(
  '/users/:id',
  ah(async (req, res) => {
    const user = await store.getUser(req.params.id);
    if (!user) return res.status(404).json(bilingual('Utilisateur introuvable', 'User not found'));
    res.json(await publicUser(user, req.query.requestingUserId as string | undefined));
  }),
);

api.post(
  '/users',
  ah(async (req, res) => {
    const body = req.body ?? {};
    const phone = String(body.phone ?? '').replace(/\s+/g, '');
    if (!body.name || !phone)
      return res.status(400).json(bilingual('Nom et téléphone obligatoires', 'Name and phone are required'));
    const password = String(body.password ?? '');
    if (password.length < 6)
      return res
        .status(400)
        .json(bilingual('Le mot de passe doit contenir au moins 6 caractères', 'Password must be at least 6 characters'));
    if (!String(body.specialty ?? '').trim())
      return res.status(400).json(bilingual('Le métier est obligatoire', 'Profession is required'));
    if (!String(body.avatarUrl ?? '').trim())
      return res.status(400).json(bilingual('La photo de profil est obligatoire', 'A profile photo is required'));

    const owner = await store.findUserByPhone(phone);
    if (owner)
      return res
        .status(409)
        .json(bilingual(`Ce numéro est déjà utilisé par ${owner.name}`, `This number already belongs to ${owner.name}`));

    const email = String(body.email ?? '').trim();
    if (email) {
      const emailOwner = await store.findUserByEmail(email);
      if (emailOwner)
        return res
          .status(409)
          .json(bilingual(`Cet email est déjà utilisé par ${emailOwner.name}`, `This email already belongs to ${emailOwner.name}`));
    }

    const name = String(body.name);
    const id = nextId('u');
    const user: User = {
      id,
      name,
      phone,
      whatsapp: String(body.whatsapp ?? '').replace(/\s+/g, '') || undefined,
      email: email || undefined,
      facebookUrl: String(body.facebookUrl ?? '').trim() || undefined,
      instagramUrl: String(body.instagramUrl ?? '').trim() || undefined,
      area: body.area || 'Centre-ville',
      city: body.city || 'Douala',
      avatarUrl: body.avatarUrl || avatarFor(name, id),
      profileVideoUrl: body.profileVideoUrl,
      hasVideoBio: Boolean(body.profileVideoUrl),
      specialty: String(body.specialty).trim(),
      servicesOffered: body.servicesOffered ?? [],
      serviceSubcategories: body.serviceSubcategories ?? [],
      customProfession: body.customProfession,
      roleType: body.roleType === 'provider' ? 'provider' : 'client',
      workPhotos: body.workPhotos ?? [],
      ratingAvg: 0,
      ratingCount: 0,
      bio: body.bio,
      createdAt: new Date().toISOString(),
      passwordHash: await bcrypt.hash(password, 10),
    };
    await store.createUser(user);
    res.status(201).json(await publicUser(user, id));
  }),
);

/** Phone + password login. Never returns the hash — publicUser() strips it. */
api.post(
  '/auth/login',
  ah(async (req, res) => {
    const phone = String(req.body?.phone ?? '').replace(/\s+/g, '');
    const password = String(req.body?.password ?? '');
    if (!phone || !password) return res.status(400).json(bilingual('Champs manquants', 'Missing fields'));

    const user = await store.findUserByPhone(phone);
    if (!user || !user.passwordHash)
      return res.status(401).json(bilingual('Numéro ou mot de passe incorrect', 'Incorrect phone or password'));

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json(bilingual('Numéro ou mot de passe incorrect', 'Incorrect phone or password'));

    res.json(await publicUser(user, user.id));
  }),
);

/**
 * Resend (https://resend.com) sends the real reset code by email once
 * EMAIL_API_KEY is set — a plain fetch against their REST API, same
 * no-SDK pattern as Groq/Fapshi above. EMAIL_FROM lets you override the
 * sender once a custom domain is verified; until then it defaults to
 * Resend's shared onboarding address, which only delivers to the email
 * your Resend account itself was created with (fine for testing the
 * flow yourself, not for real users — verify a domain for that).
 * Returns whether the send actually succeeded, so the caller can still
 * fall back to `devCode` if it didn't.
 */
async function sendResetEmail(to: string, code: string): Promise<boolean> {
  const key = process.env.EMAIL_API_KEY;
  if (!key) return false;
  const from = process.env.EMAIL_FROM || 'QuickLink Cameroun <onboarding@resend.dev>';
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
      body: JSON.stringify({
        from,
        to: [to],
        subject: 'Code de réinitialisation QuickLink / Your QuickLink reset code',
        html: `
          <p>Votre code de réinitialisation est : <strong style="font-size:20px">${code}</strong><br/>Il expire dans 10 minutes.</p>
          <hr style="border:none;border-top:1px solid #e5e7eb;margin:16px 0" />
          <p>Your password reset code is: <strong style="font-size:20px">${code}</strong><br/>It expires in 10 minutes.</p>
        `,
      }),
    });
    if (!res.ok) {
      console.error('[resend]', res.status, await res.text().catch(() => ''));
      return false;
    }
    return true;
  } catch (err) {
    console.error('[resend]', err);
    return false;
  }
}

/**
 * Accepts either a phone number or an email — whichever the account has.
 * SMS delivery (SMS_API_KEY) isn't wired to a real gateway yet, so phone
 * resets still return the code directly in the response (`devCode`) —
 * same convention as the simulated payment flow. Email resets are real
 * once EMAIL_API_KEY is set (see sendResetEmail above); `devCode` only
 * comes back for email too if that send actually fails.
 */
api.post(
  '/auth/forgot-password',
  ah(async (req, res) => {
    const raw = String(req.body?.identifier ?? req.body?.phone ?? '').trim();
    if (!raw) return res.status(400).json(bilingual('Numéro ou email requis', 'Phone or email required'));

    const isEmail = raw.includes('@');
    const user = isEmail
      ? await store.findUserByEmail(raw)
      : await store.findUserByPhone(raw.replace(/\s+/g, ''));
    if (!user) return res.status(404).json(bilingual('Aucun compte trouvé', 'No account found'));

    const code = String(Math.floor(100000 + Math.random() * 900000));
    const expiresAt = new Date(Date.now() + 10 * 60_000).toISOString();
    await store.setPasswordResetCode(user.phone, code, expiresAt);

    const destination = isEmail ? user.email! : user.phone;
    const delivered = isEmail ? await sendResetEmail(destination, code) : false;
    const devKeySet = isEmail ? delivered : Boolean(process.env.SMS_API_KEY);

    res.json({
      sent: true,
      channel: isEmail ? 'email' : 'sms',
      phone: user.phone,
      devCode: devKeySet ? undefined : code,
      instructionFr: `Un code à 6 chiffres a été envoyé ${isEmail ? 'à' : 'au'} ${destination}. Il expire dans 10 minutes.`,
      instructionEn: `A 6-digit code was sent to ${destination}. It expires in 10 minutes.`,
    });
  }),
);

api.post(
  '/auth/reset-password',
  ah(async (req, res) => {
    const phone = String(req.body?.phone ?? '').replace(/\s+/g, '');
    const code = String(req.body?.code ?? '').trim();
    const newPassword = String(req.body?.newPassword ?? '');
    if (!phone || !code || !newPassword) return res.status(400).json(bilingual('Champs manquants', 'Missing fields'));
    if (newPassword.length < 6)
      return res
        .status(400)
        .json(bilingual('Le mot de passe doit contenir au moins 6 caractères', 'Password must be at least 6 characters'));

    const record = await store.getPasswordResetCode(phone);
    if (!record || record.code !== code || new Date(record.expiresAt).getTime() < Date.now())
      return res.status(400).json(bilingual('Code invalide ou expiré', 'Invalid or expired code'));

    const user = await store.findUserByPhone(phone);
    if (!user) return res.status(404).json(bilingual('Compte introuvable', 'Account not found'));

    await store.updateUser(user.id, { passwordHash: await bcrypt.hash(newPassword, 10) });
    await store.clearPasswordResetCode(phone);
    res.json({ ok: true });
  }),
);

api.delete(
  '/users/:id',
  ah(async (req, res) => {
    const ok = await store.deleteUser(req.params.id);
    if (!ok) return res.status(404).json(bilingual('Utilisateur introuvable', 'User not found'));
    res.json({ ok: true });
  }),
);

api.put(
  '/users/:id',
  ah(async (req, res) => {
    const user = await store.getUser(req.params.id);
    if (!user) return res.status(404).json(bilingual('Utilisateur introuvable', 'User not found'));
    const body = req.body ?? {};

    const patch: Partial<User> = {};

    if (body.phone) {
      const phone = String(body.phone).replace(/\s+/g, '');
      const owner = await store.findUserByPhone(phone, user.id);
      if (owner)
        return res
          .status(409)
          .json(bilingual(`Ce numéro est déjà utilisé par ${owner.name}`, `This number already belongs to ${owner.name}`));
      patch.phone = phone;
    }
    if (body.specialty !== undefined && !String(body.specialty).trim())
      return res.status(400).json(bilingual('Le métier est obligatoire', 'Profession is required'));

    for (const key of [
      'name', 'area', 'city', 'avatarUrl', 'specialty', 'servicesOffered', 'serviceSubcategories',
      'customProfession', 'roleType', 'workPhotos', 'bio', 'profileVideoUrl', 'whatsapp',
      'email', 'facebookUrl', 'instagramUrl',
    ] as const) {
      if (body[key] !== undefined) (patch as unknown as Record<string, unknown>)[key] = body[key];
    }
    if (body.profileVideoUrl !== undefined) patch.hasVideoBio = Boolean(body.profileVideoUrl);

    const updated = (await store.updateUser(user.id, patch)) ?? user;
    await store.syncOwnerSnapshot(user.id, {
      name: patch.name,
      phone: patch.phone,
    });

    res.json(await publicUser(updated, updated.id));
  }),
);

api.post(
  '/users/:id/video',
  ah(async (req, res) => {
    const user = await store.getUser(req.params.id);
    if (!user) return res.status(404).json(bilingual('Utilisateur introuvable', 'User not found'));
    const url = String(req.body?.profileVideoUrl ?? '').trim();
    const updated = await store.updateUser(user.id, { profileVideoUrl: url || undefined, hasVideoBio: Boolean(url) });
    res.json(await publicUser(updated ?? user, user.id));
  }),
);

/* ---------------------------- tasks ---------------------------- */
api.get(
  '/tasks',
  ah(async (req, res) => {
    const { category, city, urgency, search } = req.query as Record<string, string | undefined>;
    let list = await store.listTasks({ category, city, urgency });
    if (search) {
      const related = relatedCategories(search);
      list = list.filter((t) => scoreMatch(t, search, related) > 0);
    }
    res.json(list);
  }),
);

api.post(
  '/tasks',
  ah(async (req, res) => {
    const b = req.body ?? {};
    if (!b.title || !b.postedBy)
      return res.status(400).json(bilingual('Titre et auteur obligatoires', 'Title and author are required'));
    const owner = await store.getUser(b.postedBy);
    const id = nextId('t');
    const city = b.city || owner?.city || 'Douala';
    const area = b.area || owner?.area || 'Centre-ville';
    const { lat, lng } = coordsFor(city, area, id);
    const task: Task = {
      id,
      postedBy: b.postedBy,
      postedByName: owner?.name,
      postedByArea: area,
      title: b.title,
      category: b.category || '',
      subCategory: b.subCategory || '',
      description: b.description || '',
      area,
      city,
      lat,
      lng,
      urgency: b.urgency || 'flexible',
      status: 'open',
      createdAt: new Date().toISOString(),
      interestedCount: 0,
      imageUrl: b.imageUrl,
    };
    await store.createTask(task);
    res.status(201).json(task);
  }),
);

api.delete(
  '/tasks/:id',
  ah(async (req, res) => {
    const ok = await store.deleteTask(req.params.id);
    if (!ok) return res.status(404).json(bilingual('Tâche introuvable', 'Task not found'));
    res.json({ ok: true });
  }),
);

/* -------------------------- services --------------------------- */
api.get(
  '/services',
  ah(async (req, res) => {
    const { category, city, search } = req.query as Record<string, string | undefined>;
    const viewer = req.query.requestingUserId as string | undefined;
    await ensureFillers(city, category);
    let list = await store.listServices({ category, city, activeOnly: true });
    if (search) {
      const related = relatedCategories(search);
      list = list.filter((s) => scoreMatch(s, search, related) > 0);
    }
    res.json(await Promise.all(list.map((s) => publicService(s, viewer))));
  }),
);

api.post(
  '/services',
  ah(async (req, res) => {
    const b = req.body ?? {};
    if (!b.title || !b.postedBy)
      return res.status(400).json(bilingual('Titre et auteur obligatoires', 'Title and author are required'));
    const owner = await store.getUser(b.postedBy);
    const id = nextId('s');
    const city = b.city || owner?.city || 'Douala';
    const area = b.area || owner?.area || 'Centre-ville';
    const { lat, lng } = coordsFor(city, area, id);
    const service: ServiceOffer = {
      id,
      postedBy: b.postedBy,
      postedByName: owner?.name,
      postedByPhone: owner?.phone,
      postedByRating: owner?.ratingAvg,
      title: b.title,
      category: b.category || '',
      subCategory: b.subCategory || '',
      specialty: b.specialty || owner?.specialty,
      description: b.description || '',
      area,
      city,
      lat,
      lng,
      pricingRate: b.pricingRate,
      workPhotos: b.workPhotos ?? [],
      status: 'active',
      createdAt: new Date().toISOString(),
      interestedCount: 0,
    };
    await store.createService(service);
    if (owner && b.specialty) await store.updateUser(owner.id, { specialty: b.specialty });
    if (owner && b.category && !(owner.servicesOffered ?? []).includes(b.category)) {
      await store.updateUser(owner.id, { servicesOffered: [...(owner.servicesOffered ?? []), b.category] });
    }
    res.status(201).json(await publicService(service, b.postedBy));
  }),
);

api.delete(
  '/services/:id',
  ah(async (req, res) => {
    const ok = await store.deleteService(req.params.id);
    if (!ok) return res.status(404).json(bilingual('Service introuvable', 'Service not found'));
    res.json({ ok: true });
  }),
);

/* -------------------------- interests -------------------------- */
api.get(
  '/interests',
  ah(async (req, res) => {
    const { postId, userId } = req.query as Record<string, string | undefined>;
    res.json(await store.listInterests({ postId, userId }));
  }),
);

api.post(
  '/interests',
  ah(async (req, res) => {
    const { userId, postId, postType } = req.body ?? {};
    if (!userId || !postId || !postType) return res.status(400).json(bilingual('Champs manquants', 'Missing fields'));
    const created = await addInterest(userId, postId, postType);
    const count = await store.countInterests(postId);
    res.status(created ? 201 : 200).json({ created: Boolean(created), signal: created, interestedCount: count });
  }),
);

/* --------------------------- unlocks --------------------------- */
api.get(
  '/unlocks/check',
  ah(async (req, res) => {
    const { userA, userB } = req.query as Record<string, string | undefined>;
    if (!userB) return res.status(400).json(bilingual('userB requis', 'userB is required'));
    res.json(await unlockStatus(userA, userB));
  }),
);

api.get(
  '/unlocks',
  ah(async (req, res) => {
    const userId = req.query.userId as string | undefined;
    if (!userId) return res.json([]);
    const unlocks = await store.listUnlocksForUser(userId);
    const rows = (
      await Promise.all(unlocks.map(async (u) => ({ unlock: u, status: await unlockStatus(userId, u.unlockedUserId) })))
    )
      .filter((r) => r.status.unlocked)
      .sort((a, b) => a.status.remainingMs - b.status.remainingMs);

    const result = await Promise.all(
      rows.map(async (r) => {
        const target = await store.getUser(r.unlock.unlockedUserId);
        return {
          ...r.unlock,
          expiresAt: r.status.expiresAt,
          remainingMs: r.status.remainingMs,
          user: await publicUser(target!, userId),
        };
      }),
    );
    res.json(result);
  }),
);

/* -------------------------- payments --------------------------- *
 * Talks to Fapshi's real collect API (https://docs.fapshi.com) once
 * FAPSHI_API_USER/FAPSHI_API_KEY are set. Without them, both /initiate and
 * confirmation are simulated locally so the app runs standalone end to end.
 * ------------------------------------------------------------------ */
const usingRealFapshi = Boolean(process.env.FAPSHI_API_KEY);
const FAPSHI_BASE = process.env.FAPSHI_ENV === 'live' ? 'https://live.fapshi.com' : 'https://sandbox.fapshi.com';

function fapshiHeaders() {
  return {
    'Content-Type': 'application/json',
    apiuser: process.env.FAPSHI_API_USER ?? '',
    apikey: process.env.FAPSHI_API_KEY ?? '',
  };
}

/** POST /direct-pay — pushes a MoMo/Orange Money confirmation prompt straight to the payer's phone. */
async function fapshiDirectPay(args: { amount: number; phone: string; userId: string; externalId: string; message: string }) {
  const res = await fetch(`${FAPSHI_BASE}/direct-pay`, {
    method: 'POST',
    headers: fapshiHeaders(),
    body: JSON.stringify(args),
  });
  const data = (await res.json().catch(() => ({}))) as { transId?: string; message?: string };
  if (!res.ok || !data.transId) throw new Error(data.message || `Fapshi direct-pay failed (${res.status})`);
  return data as { transId: string; message: string };
}

/** GET /payment-status/{transId} — used to self-heal a pending transaction even before a webhook fires. */
async function fapshiPaymentStatus(transId: string) {
  const res = await fetch(`${FAPSHI_BASE}/payment-status/${transId}`, { headers: fapshiHeaders() });
  if (!res.ok) throw new Error(`Fapshi payment-status failed (${res.status})`);
  return (await res.json()) as { status: 'CREATED' | 'PENDING' | 'SUCCESSFUL' | 'FAILED' | 'EXPIRED' };
}

/**
 * Server-side confirmation. A client claiming "payment succeeded" is never
 * enough — the unlock is only created here, either from Fapshi's real
 * webhook call, or (in simulated mode, see below) from our own timer
 * standing in for it.
 */
async function resolvePayment(transId: string, status: 'SUCCESSFUL' | 'FAILED') {
  const tx = await store.getPaymentByTransId(transId);
  if (!tx || tx.status !== 'CREATED') return;

  if (status === 'FAILED') {
    await store.updatePayment(tx.id, { status: 'FAILED' });
    return;
  }
  const updated = (await store.updatePayment(tx.id, { status: 'SUCCESSFUL' }))!;
  if (updated.targetUserId) await grantUnlock(updated.userId, updated.targetUserId, updated.amount, updated.transId);
}

api.post(
  '/payments/initiate',
  ah(async (req, res) => {
    const { userId, phone, targetUserId } = req.body ?? {};
    if (!userId || !phone || !targetUserId) return res.status(400).json(bilingual('Champs manquants', 'Missing fields'));
    const cleanPhone = String(phone).replace(/\s+/g, '');

    let transId: string;
    if (usingRealFapshi) {
      try {
        const result = await fapshiDirectPay({
          amount: UNLOCK_PRICE,
          phone: cleanPhone,
          userId,
          externalId: targetUserId,
          message: 'QuickLink Cameroun - deblocage contact',
        });
        transId = result.transId;
      } catch (err) {
        console.error('[fapshi]', err);
        return res
          .status(502)
          .json(bilingual('Le paiement Mobile Money a échoué. Réessayez.', 'Mobile Money payment failed. Try again.'));
      }
    } else {
      transId = `QL-${Math.random().toString(36).slice(2, 10).toUpperCase()}`;
    }

    const tx: PaymentTransaction = {
      id: nextId('pay'),
      transId,
      userId,
      amount: UNLOCK_PRICE,
      status: 'CREATED',
      phone: cleanPhone,
      targetUserId,
      createdAt: new Date().toISOString(),
    };
    await store.createPayment(tx);

    // No real Fapshi credentials: stand in for the MOMO/OM confirmation
    // popup and their webhook call, so the app is fully testable end to end
    // without needing a live merchant account. Once FAPSHI_API_KEY is set,
    // this never fires — Fapshi's real webhook (or the status poll below) drives confirmation instead.
    if (!usingRealFapshi) {
      setTimeout(() => {
        resolvePayment(transId, 'SUCCESSFUL').catch((err) => console.error('simulated payment resolve failed', err));
      }, 4500);
    }

    res.status(201).json({
      transaction: tx,
      transId,
      instructionFr: `Confirmez le paiement de ${UNLOCK_PRICE} FCFA depuis le pop-up Mobile Money (MTN MoMo ou Orange Money) sur votre téléphone.`,
      instructionEn: `Confirm the ${UNLOCK_PRICE} FCFA payment from the Mobile Money pop-up (MTN MoMo or Orange Money) on your phone.`,
    });
  }),
);

api.post(
  '/payments/webhook',
  ah(async (req, res) => {
    // Fapshi signs webhook calls with a shared secret in `x-wh-secret` when
    // one is configured on the dashboard — verify it if we have one to compare against.
    const webhookSecret = process.env.FAPSHI_WEBHOOK_SECRET;
    if (webhookSecret && req.header('x-wh-secret') !== webhookSecret) {
      return res.status(401).json(bilingual('Signature webhook invalide', 'Invalid webhook signature'));
    }

    const { transId, status } = req.body ?? {};
    const tx = await store.getPaymentByTransId(transId);
    if (!tx) return res.status(404).json(bilingual('Transaction introuvable', 'Transaction not found'));
    if (tx.status !== 'CREATED') return res.json({ transaction: tx, alreadyProcessed: true });

    await resolvePayment(transId, status === 'SUCCESSFUL' ? 'SUCCESSFUL' : 'FAILED');
    const updated = (await store.getPaymentByTransId(transId))!;
    if (updated.status === 'SUCCESSFUL' && updated.targetUserId) {
      return res.json({ transaction: updated, status: await unlockStatus(updated.userId, updated.targetUserId) });
    }
    res.json({ transaction: updated });
  }),
);

/**
 * Polled by the client while a payment is pending — see /payments/initiate.
 * With real Fapshi credentials, also self-heals by checking Fapshi's live
 * status directly, so confirmation still works even before a public
 * webhook URL is configured (e.g. while testing locally).
 */
api.get(
  '/payments/status/:transId',
  ah(async (req, res) => {
    let tx = await store.getPaymentByTransId(req.params.transId);
    if (!tx) return res.status(404).json(bilingual('Transaction introuvable', 'Transaction not found'));

    if (usingRealFapshi && tx.status === 'CREATED') {
      try {
        const live = await fapshiPaymentStatus(tx.transId);
        if (live.status === 'SUCCESSFUL') await resolvePayment(tx.transId, 'SUCCESSFUL');
        else if (live.status === 'FAILED' || live.status === 'EXPIRED') await resolvePayment(tx.transId, 'FAILED');
        tx = (await store.getPaymentByTransId(req.params.transId))!;
      } catch (err) {
        console.error('[fapshi] status poll failed', err);
      }
    }

    res.json({ transaction: tx });
  }),
);

api.get(
  '/payments/history',
  ah(async (req, res) => {
    const userId = req.query.userId as string | undefined;
    res.json(userId ? await store.listPaymentsForUser(userId) : []);
  }),
);

/* --------------------------- reviews --------------------------- */
api.get(
  '/reviews',
  ah(async (_req, res) => {
    res.json(await store.listReviews());
  }),
);

api.get(
  '/reviews/:userId',
  ah(async (req, res) => {
    res.json(await store.listReviewsForUser(req.params.userId));
  }),
);

api.post(
  '/reviews',
  ah(async (req, res) => {
    const { reviewerId, reviewedUserId, rating, comment, taskId } = req.body ?? {};
    if (!reviewerId || !reviewedUserId || !rating) return res.status(400).json(bilingual('Champs manquants', 'Missing fields'));
    if (reviewerId === reviewedUserId)
      return res.status(400).json(bilingual('Vous ne pouvez pas vous évaluer', 'You cannot review yourself'));
    const n = Number(rating);
    if (!(n >= 1 && n <= 5)) return res.status(400).json(bilingual('Note entre 1 et 5', 'Rating must be 1 to 5'));
    const reviewer = await store.getUser(reviewerId);
    const review = {
      id: nextId('r'),
      reviewerId,
      reviewerName: reviewer?.name ?? 'Client',
      reviewedUserId,
      taskId,
      rating: n,
      comment: String(comment ?? '').slice(0, 1000),
      createdAt: new Date().toISOString(),
    };
    await store.createReview(review);
    await recomputeRating(reviewedUserId);
    const updatedUser = await store.getUser(reviewedUserId);
    res.status(201).json({ review, user: await publicUser(updatedUser!, reviewerId) });
  }),
);

/* --------------------------- support --------------------------- */
api.post('/support', (req, res) => {
  const { message, lang } = req.body ?? {};
  const text =
    lang === 'en'
      ? `Hello QuickLink support. ${message ?? 'I need help.'}`
      : `Bonjour le support QuickLink. ${message ?? "J'ai besoin d'aide."}`;
  res.json({
    whatsappUrl: `https://wa.me/${SUPPORT_WHATSAPP}?text=${encodeURIComponent(text)}`,
    phone: SUPPORT_WHATSAPP,
  });
});

/* --------------------------- AI chat --------------------------- */
const SAFETY_FR =
  '⚠️ Rappel sécurité : ne payez jamais et n’envoyez jamais d’argent à un professionnel avant que le travail soit vérifié.';
const SAFETY_EN =
  '⚠️ Safety reminder: never pay or send money to a professional before the work has been verified.';

const SYSTEM_PROMPT = `You are the QuickLink Cameroun assistant. QuickLink connects clients with local
professionals and technicians across Cameroon.

Facts you must use:
- ${PROFESSION_COUNT}+ professions listed, across ${CITY_COUNT}+ Cameroonian cities and towns in all 10 regions.
- Contact details (phone / WhatsApp) are masked until unlocked.
- Unlocking one professional's contact costs ${UNLOCK_PRICE} FCFA via Mobile Money (Fapshi).
- Posting a task, browsing, and signalling interest are always free.
- Every member lists their own profession when they sign up, even if they mostly come here looking for help.

Style: warm, concise, practical. Reply in the same language the user writes in
(French or English — French is the default). Keep answers under 120 words.
Never invent phone numbers. Never promise a price on a professional's behalf.`;

function cannedReply(message: string, lang: 'fr' | 'en'): string {
  const m = (message ?? '').toLowerCase();
  if (lang === 'en') {
    if (m.includes('price') || m.includes('cost') || m.includes('pay') || m.includes('unlock'))
      return `Unlocking a professional's contact costs ${UNLOCK_PRICE} FCFA via Mobile Money. Browsing and posting a task are free.`;
    if (m.includes('post') || m.includes('task'))
      return 'Open the Tasks tab and use "Post a task". Describe the job, pick your city and quarter, and set how urgent it is. Professionals nearby will signal interest for free.';
    return `I can help you find a technician, post a task, or explain how unlocking works. Contacts cost ${UNLOCK_PRICE} FCFA via Mobile Money.`;
  }
  if (m.includes('prix') || m.includes('coût') || m.includes('cout') || m.includes('payer') || m.includes('débloq'))
    return `Débloquer le contact d’un professionnel coûte ${UNLOCK_PRICE} FCFA via Mobile Money. Naviguer et publier une tâche restent gratuits.`;
  if (m.includes('publier') || m.includes('tâche') || m.includes('tache'))
    return 'Allez dans l’onglet Tâches puis « Publier une tâche ». Décrivez le travail, choisissez votre ville et votre quartier, et indiquez l’urgence. Les professionnels proches signalent leur intérêt gratuitement.';
  return `Je peux vous aider à trouver un technicien, publier une tâche, ou expliquer le déblocage des contacts. Un contact coûte ${UNLOCK_PRICE} FCFA via Mobile Money.`;
}

const PAYMENT_WORDS = /pay|price|cost|money|fcfa|momo|orange|unlock|fapshi|prix|argent|payer|coût|cout|débloq|debloq|hire|embauch|recrut|avance|acompte|arnaque|scam/i;

/**
 * Groq (https://console.groq.com) speaks the same wire format as OpenAI's
 * chat completions endpoint, so a plain `fetch` is enough — no SDK
 * dependency needed. Model name is configurable since Groq's catalog moves;
 * check console.groq.com/docs/models for the current one if the default
 * ever gets retired.
 */
const GROQ_MODEL = process.env.GROQ_MODEL || 'openai/gpt-oss-20b';

async function callGroq(
  messages: { role: 'system' | 'user' | 'assistant'; content: string }[],
  opts: { maxTokens: number; temperature: number },
): Promise<string | null> {
  const key = process.env.GROQ_API_KEY;
  if (!key) return null;
  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages,
        max_tokens: opts.maxTokens,
        temperature: opts.temperature,
      }),
    });
    if (!res.ok) {
      console.error('[groq]', res.status, await res.text().catch(() => ''));
      return null;
    }
    const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    return data.choices?.[0]?.message?.content?.trim() || null;
  } catch (err) {
    console.error('[groq]', err);
    return null;
  }
}

api.post('/ai/chat', async (req, res) => {
  const message = String(req.body?.message ?? '').slice(0, 1500);
  const lang: 'fr' | 'en' = req.body?.lang === 'en' ? 'en' : 'fr';
  const history: { role: string; text: string }[] = Array.isArray(req.body?.history) ? req.body.history.slice(-8) : [];
  const safety = lang === 'en' ? SAFETY_EN : SAFETY_FR;
  const needsSafety = PAYMENT_WORDS.test(message);

  const respond = (reply: string, source: 'groq' | 'fallback') =>
    res.json({ reply: needsSafety ? `${reply}\n\n${safety}` : reply, source });

  if (!process.env.GROQ_API_KEY) return respond(cannedReply(message, lang), 'fallback');

  const messages: { role: 'system' | 'user' | 'assistant'; content: string }[] = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...history.map((h) => ({ role: (h.role === 'assistant' ? 'assistant' : 'user') as 'assistant' | 'user', content: h.text })),
    { role: 'user', content: message },
  ];
  const text = await callGroq(messages, { maxTokens: 400, temperature: 0.6 });
  return respond(text || cannedReply(message, lang), text ? 'groq' : 'fallback');
});

/* -------------------------- translate ---------------------------- *
 * Lets an FR reader translate an EN post and vice versa. Uses Groq when
 * GROQ_API_KEY is set (best quality); otherwise falls back to MyMemory's
 * free, keyless translation API so the feature works out of the box.
 * QuickLink content is only ever FR or EN, so the source language is simply
 * "whichever one isn't the requested target".
 * ------------------------------------------------------------------ */
async function translateViaGroq(text: string, target: 'fr' | 'en'): Promise<string | null> {
  const targetName = target === 'fr' ? 'French' : 'English';
  return callGroq(
    [
      { role: 'system', content: `Translate the user's text to ${targetName}. Reply with only the translation, no notes or quotes.` },
      { role: 'user', content: text },
    ],
    { maxTokens: 400, temperature: 0.2 },
  );
}

async function translateViaMyMemory(text: string, source: 'fr' | 'en', target: 'fr' | 'en'): Promise<string | null> {
  try {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${source}|${target}`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = (await res.json()) as { responseData?: { translatedText?: string }; responseStatus?: number };
    const translated = data.responseData?.translatedText?.trim();
    // MyMemory returns the same text back (or an error string) when it can't translate — reject those.
    if (!translated || data.responseStatus !== 200) return null;
    return translated;
  } catch {
    return null;
  }
}

api.post('/translate', async (req, res) => {
  const text = String(req.body?.text ?? '').slice(0, 2000);
  const target: 'fr' | 'en' = req.body?.target === 'en' ? 'en' : 'fr';
  if (!text.trim()) return res.json({ translated: null, available: false });
  const source: 'fr' | 'en' = target === 'fr' ? 'en' : 'fr';

  const translated = (await translateViaGroq(text, target)) ?? (await translateViaMyMemory(text, source, target));
  res.json({ translated: translated ?? null, available: Boolean(translated) });
});

/* ---------------------------- meta ----------------------------- */
api.get(
  '/meta',
  ah(async (_req, res) => {
    const [providers, tasks, services] = await Promise.all([
      store.countUsers({ excludeClients: true }),
      store.countTasks(),
      store.countActiveServices(),
    ]);
    res.json({
      cities: CITY_COUNT,
      professions: PROFESSION_COUNT,
      unlockPrice: UNLOCK_PRICE,
      providers,
      tasks,
      services,
      aiEnabled: Boolean(process.env.GROQ_API_KEY),
    });
  }),
);

app.use('/api', api);

app.use('/api', (_req, res) => res.status(404).json(bilingual('Route inconnue', 'Unknown route')));
app.use('/api', (err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  res.status(500).json(bilingual('Erreur serveur', 'Server error'));
});

/* ------------------------------------------------------------------ *
 * Static / Vite
 * ------------------------------------------------------------------ */
async function start() {
  if (isProd) {
    const clientDir = path.join(rootDir, 'dist', 'client');
    app.use(express.static(clientDir, { index: false, maxAge: '1h' }));
    const html = fs.readFileSync(path.join(clientDir, 'index.html'), 'utf-8');
    app.use((_req, res) => res.status(200).set({ 'Content-Type': 'text/html' }).end(html));
  } else {
    const { createServer } = await import('vite');
    const vite = await createServer({
      root: rootDir,
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, () => {
    console.log(`\n  QuickLink Cameroun → http://localhost:${PORT}`);
    console.log(`  mode: ${isProd ? 'production' : 'development'}`);
    console.log(`  data: ${usingSupabase ? 'Supabase (Postgres)' : 'in-memory (set SUPABASE_URL/SUPABASE_SERVICE_KEY)'}`);
    console.log(`  payments: ${process.env.FAPSHI_API_KEY ? 'Fapshi' : 'simulated (set FAPSHI_API_USER/FAPSHI_API_KEY)'}`);
    console.log(`  AI support: ${process.env.GROQ_API_KEY ? 'Groq' : 'canned bilingual fallback'}\n`);
  });
}

start();
