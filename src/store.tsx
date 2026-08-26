import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { api, ApiError, type UnlockedContact } from './api';
import type { CategoryOption, Task, Urgency, User } from './types';
import { CATEGORIES } from './data/categories';
import { coordsFor, haversineKm, reverseGeocode, NEARBY_RADIUS_KM } from './lib/geo';
import { relatedCategories, scoreMatch } from './lib/search';
import { useI18n } from './i18n';
import { useToast } from './components/Toast';

export type Section =
  | 'hub'
  | 'categories'
  | 'tasks'
  | 'services'
  | 'map'
  | 'saved'
  | 'profile'
  | 'profileEdit'
  | 'profileSettings'
  | 'myTasks'
  | 'auth'
  | 'support';

export interface Filters {
  query: string;
  category: string;
  city: string;
  urgency: '' | Urgency;
  nearMe: boolean;
}

const EMPTY_FILTERS: Filters = { query: '', category: '', city: '', urgency: '', nearMe: false };

const LS = {
  session: 'ql.session',
  saved: 'ql.saved',
  categories: 'ql.customCategories',
};

export interface UnlockRequest {
  target: User;
}

interface StoreValue {
  /* data */
  users: User[];
  tasks: Task[];
  categories: CategoryOption[];
  unlocks: UnlockedContact[];
  myInterests: Set<string>;
  loading: boolean;
  refreshAll: () => Promise<void>;
  refreshUnlocks: () => Promise<void>;

  /* session */
  user: User | null;
  signIn: (u: User) => void;
  signOut: () => void;
  requireAuth: (action: (u: User) => void) => void;

  /* navigation */
  section: Section;
  goTo: (s: Section, opts?: Partial<Filters>) => void;
  profileId: string | null;
  openProfile: (id: string) => void;
  closeProfile: () => void;

  /* filters */
  filters: Filters;
  setFilters: (patch: Partial<Filters>) => void;
  resetFilters: () => void;

  /* geo */
  gps: { lat: number; lng: number } | null;
  homeCity: string;
  locating: boolean;
  locateMe: () => void;
  distanceTo: (item: { city?: string; area?: string; lat?: number; lng?: number; id?: string }) => number | null;

  /* saved */
  saved: Set<string>;
  toggleSaved: (id: string) => void;

  /* derived feeds */
  visibleTasks: Task[];
  visibleProfessionals: User[];
  userById: (id: string) => User | undefined;

  /* unlock + contact */
  isUnlocked: (userId: string) => boolean;
  unlockRemaining: (userId: string) => number;
  requestUnlock: (target: User) => void;
  unlockRequest: UnlockRequest | null;
  closeUnlock: () => void;
  contact: (target: User, mode: 'whatsapp' | 'call') => void;

  /* interest */
  expressInterest: (postId: string, postType: 'task') => void;

  /* modals */
  accountsOpen: boolean;
  setAccountsOpen: (v: boolean) => void;
  citiesOpen: boolean;
  setCitiesOpen: (v: boolean) => void;
  professionsOpen: boolean;
  setProfessionsOpen: (v: boolean) => void;
  interestsFor: { id: string; title: string } | null;
  setInterestsFor: (v: { id: string; title: string } | null) => void;
  lightbox: { photos: string[]; index: number } | null;
  setLightbox: (v: { photos: string[]; index: number } | null) => void;
  videoFor: User | null;
  setVideoFor: (v: User | null) => void;

  addCustomCategory: (c: CategoryOption) => void;
  afterAuth: (u: User) => void;
}

const StoreContext = createContext<StoreValue | null>(null);

function loadCustomCategories(): CategoryOption[] {
  try {
    const raw = localStorage.getItem(LS.categories);
    return raw ? (JSON.parse(raw) as CategoryOption[]) : [];
  } catch {
    return [];
  }
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const { t, lang } = useI18n();
  const toast = useToast();

  const [users, setUsers] = useState<User[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [customCategories, setCustomCategories] = useState<CategoryOption[]>(loadCustomCategories);
  const [unlocks, setUnlocks] = useState<UnlockedContact[]>([]);
  const [myInterests, setMyInterests] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  const [user, setUser] = useState<User | null>(null);
  const [section, setSection] = useState<Section>('hub');
  const [profileId, setProfileId] = useState<string | null>(null);
  const [filters, setFiltersState] = useState<Filters>(EMPTY_FILTERS);

  const [gps, setGps] = useState<{ lat: number; lng: number } | null>(null);
  const [homeCity, setHomeCity] = useState('Douala');
  const [locating, setLocating] = useState(false);

  const [saved, setSaved] = useState<Set<string>>(() => {
    try {
      return new Set(JSON.parse(localStorage.getItem(LS.saved) ?? '[]') as string[]);
    } catch {
      return new Set();
    }
  });

  const [accountsOpen, setAccountsOpen] = useState(false);
  const [citiesOpen, setCitiesOpen] = useState(false);
  const [professionsOpen, setProfessionsOpen] = useState(false);
  const [interestsFor, setInterestsFor] = useState<{ id: string; title: string } | null>(null);
  const [lightbox, setLightbox] = useState<{ photos: string[]; index: number } | null>(null);
  const [videoFor, setVideoFor] = useState<User | null>(null);
  const [unlockRequest, setUnlockRequest] = useState<UnlockRequest | null>(null);

  const pendingAction = useRef<((u: User) => void) | null>(null);

  const categories = useMemo(
    () =>
      [...CATEGORIES, ...customCategories].sort((a, b) =>
        (lang === 'fr' ? a.nameFr ?? a.name : a.name).localeCompare(lang === 'fr' ? b.nameFr ?? b.name : b.name),
      ),
    [customCategories, lang],
  );

  /* --------------------------- loading --------------------------- */
  const loadCore = useCallback(
    async (viewerId?: string) => {
      const [u, ta] = await Promise.all([
        api.listUsers({ requestingUserId: viewerId }),
        api.listTasks(),
      ]);
      setUsers(u);
      setTasks(ta);
    },
    [],
  );

  const refreshUnlocks = useCallback(async () => {
    if (!user) {
      setUnlocks([]);
      return;
    }
    try {
      const list = await api.listUnlocks(user.id);
      setUnlocks(list);
    } catch {
      /* non-fatal */
    }
  }, [user]);

  const refreshAll = useCallback(async () => {
    try {
      await loadCore(user?.id);
      if (user) {
        const mine = await api.listInterests({ userId: user.id });
        setMyInterests(new Set(mine.map((i) => i.postId)));
      }
      await refreshUnlocks();
    } catch {
      toast.error(t('errNetwork'));
    }
  }, [loadCore, refreshUnlocks, t, toast, user]);

  // Initial boot: restore session, then load everything.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const storedId = localStorage.getItem(LS.session);
      let restored: User | null = null;
      if (storedId) {
        try {
          restored = await api.getUser(storedId, storedId);
        } catch (e) {
          // Only a genuine "this account no longer exists" (404) should sign
          // someone out on their behalf. A network hiccup, a slow cold start,
          // or a transient server error must leave the stored session alone
          // — otherwise a bad connection or a server restart looks to the
          // user exactly like being logged out, when nothing about their
          // account actually changed. The next successful load restores them.
          if (e instanceof ApiError && e.status === 404) {
            localStorage.removeItem(LS.session);
          }
        }
      }
      if (cancelled) return;
      if (restored) setUser(restored);
      try {
        await loadCore(restored?.id);
      } catch {
        toast.error(t('errNetwork'));
      }
      if (!cancelled) setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reload viewer-dependent data whenever the account changes.
  useEffect(() => {
    if (loading) return;
    (async () => {
      await loadCore(user?.id);
      if (user) {
        try {
          const mine = await api.listInterests({ userId: user.id });
          setMyInterests(new Set(mine.map((i) => i.postId)));
        } catch {
          setMyInterests(new Set());
        }
      } else {
        setMyInterests(new Set());
      }
      await refreshUnlocks();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  // Drop unlocks the moment their 24h window closes.
  useEffect(() => {
    const id = window.setInterval(() => {
      setUnlocks((list) => {
        const live = list.filter((u) => new Date(u.expiresAt).getTime() > Date.now());
        return live.length === list.length ? list : live;
      });
    }, 15000);
    return () => window.clearInterval(id);
  }, []);

  /* ----------------------------- geo ----------------------------- */
  const locateMe = useCallback(() => {
    if (!('geolocation' in navigator)) {
      setLocating(false);
      return;
    }
    setLocating(true);

    const onFix = (pos: GeolocationPosition) => {
      const { latitude, longitude } = pos.coords;
      setGps({ lat: latitude, lng: longitude });
      const place = reverseGeocode(latitude, longitude);
      setHomeCity(place.city);
      setLocating(false);
    };

    // Browser geolocation is denied or unavailable — try free, keyless
    // IP-based lookups next so the user still lands on their real
    // approximate city instead of a hard-coded Douala, which was wrong for
    // anyone actually located elsewhere. Two independent providers are
    // tried (each can be flaky, rate-limited, or blocked by a privacy
    // extension on its own) before Douala is ever used, and the whole thing
    // is silent either way — no toast, it just resolves in the background.
    const tryIpLookup = async (url: string, parse: (d: any) => { lat: number; lng: number; city?: string } | null) => {
      try {
        const res = await fetch(url);
        if (!res.ok) return false;
        const data = await res.json();
        const parsed = parse(data);
        if (!parsed) return false;
        setGps({ lat: parsed.lat, lng: parsed.lng });
        const place = reverseGeocode(parsed.lat, parsed.lng);
        setHomeCity(parsed.city || place.city);
        setLocating(false);
        return true;
      } catch {
        return false;
      }
    };

    const onGiveUp = async () => {
      if (await tryIpLookup('https://ipapi.co/json/', (d) =>
        typeof d.latitude === 'number' && typeof d.longitude === 'number' ? { lat: d.latitude, lng: d.longitude, city: d.city } : null,
      )) return;
      if (await tryIpLookup('https://get.geojs.io/v1/ip/geo.json', (d) =>
        d.latitude && d.longitude ? { lat: Number(d.latitude), lng: Number(d.longitude), city: d.city } : null,
      )) return;

      setLocating(false);
      const fallback = coordsFor('Douala', 'Akwa', 'fallback');
      setGps(fallback);
      setHomeCity('Douala');
    };

    navigator.geolocation.getCurrentPosition(
      onFix,
      (err) => {
        // A denied permission won't succeed on retry, so give up right away.
        // A timeout or a transient "position unavailable" often *does*
        // succeed with a longer timeout and a coarser (non-GPS-chip) fix —
        // retry once with more lenient settings before falling back to
        // Douala, instead of giving up on the very first hiccup.
        if (err.code === err.PERMISSION_DENIED) {
          onGiveUp();
          return;
        }
        navigator.geolocation.getCurrentPosition(onFix, onGiveUp, {
          enableHighAccuracy: false,
          timeout: 15000,
          maximumAge: 0,
        });
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 },
    );
  }, []);

  useEffect(() => {
    // Try once on load; a refusal is handled quietly with a Douala fallback.
    locateMe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // Keep tracking afterwards so "professionals near me" re-sorts as the
    // user actually moves, instead of freezing on their location at signup.
    if (!('geolocation' in navigator)) return;
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setGps({ lat: latitude, lng: longitude });
        const place = reverseGeocode(latitude, longitude);
        setHomeCity(place.city);
      },
      () => undefined,
      { enableHighAccuracy: false, timeout: 20000, maximumAge: 60000 },
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  const distanceTo = useCallback(
    (item: { city?: string; area?: string; lat?: number; lng?: number; id?: string }) => {
      if (!gps) return null;
      const lat = item.lat ?? coordsFor(item.city, item.area, item.id).lat;
      const lng = item.lng ?? coordsFor(item.city, item.area, item.id).lng;
      return haversineKm(gps.lat, gps.lng, lat, lng);
    },
    [gps],
  );

  /* --------------------------- session --------------------------- */
  const signIn = useCallback(
    (u: User) => {
      localStorage.setItem(LS.session, u.id);
      setUser(u);
      toast.success(`${t('loggedInAs')} ${u.name}`);
    },
    [t, toast],
  );

  const signOut = useCallback(() => {
    localStorage.removeItem(LS.session);
    setUser(null);
    setSection('hub');
    toast.info(t('loggedOut'));
  }, [t, toast]);

  const afterAuth = useCallback(
    (u: User) => {
      localStorage.setItem(LS.session, u.id);
      setUser(u);
      goTo('hub');
      toast.success(`${t('loggedInAs')} ${u.name}`);
      const action = pendingAction.current;
      pendingAction.current = null;
      if (action) window.setTimeout(() => action(u), 120);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [t, toast],
  );

  const requireAuth = useCallback(
    (action: (u: User) => void) => {
      if (user) {
        action(user);
        return;
      }
      pendingAction.current = action;
      goTo('auth');
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [user],
  );

  /* --------------------------- filters --------------------------- */
  const setFilters = useCallback((patch: Partial<Filters>) => {
    setFiltersState((f) => ({ ...f, ...patch }));
  }, []);
  const resetFilters = useCallback(() => setFiltersState(EMPTY_FILTERS), []);

  const goTo = useCallback((s: Section, opts?: Partial<Filters>) => {
    if (opts) setFiltersState((f) => ({ ...f, ...opts }));
    setProfileId(null);
    setSection(s);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const openProfile = useCallback((id: string) => {
    setProfileId(id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);
  const closeProfile = useCallback(() => setProfileId(null), []);

  /* ---------------------------- saved ---------------------------- */
  const toggleSaved = useCallback((id: string) => {
    setSaved((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      localStorage.setItem(LS.saved, JSON.stringify([...next]));
      return next;
    });
  }, []);

  /* -------------------------- derived feeds ---------------------- */
  const related = useMemo(() => relatedCategories(filters.query), [filters.query]);

  const viewerCity = (user?.city ?? homeCity ?? '').toLowerCase();

  const applyFilters = useCallback(
    (items: Task[]): Task[] => {
      const scored = items
        .map((item) => {
          if (filters.category && item.category !== filters.category && !related.includes(item.category))
            return null;
          if (filters.city && !item.city.toLowerCase().includes(filters.city.toLowerCase())) return null;
          if (filters.urgency && item.urgency !== filters.urgency) return null;
          const score = scoreMatch(item, filters.query, related);
          if (score <= 0) return null;
          const dist = distanceTo(item);
          if (filters.nearMe && dist !== null && dist > NEARBY_RADIUS_KM) return null;
          // Same-city listings surface first so a poster's own area is never buried.
          const sameArea = viewerCity && item.city.toLowerCase() === viewerCity ? 0 : 1;
          return { item, score, dist: dist ?? Infinity, sameArea };
        })
        .filter(Boolean) as { item: Task; score: number; dist: number; sameArea: number }[];

      scored.sort((a, b) => {
        if (filters.query && b.score !== a.score) return b.score - a.score;
        if (a.sameArea !== b.sameArea) return a.sameArea - b.sameArea;
        if (a.dist !== b.dist) return a.dist - b.dist;
        return +new Date(b.item.createdAt) - +new Date(a.item.createdAt);
      });
      return scored.map((s) => s.item);
    },
    [filters, related, distanceTo, viewerCity],
  );

  const visibleTasks = useMemo(() => applyFilters(tasks), [applyFilters, tasks]);

  /**
   * "Professionals" are simply users who declared themselves available for
   * work — not separate posts. Sorted by live distance first, since this is
   * the "who's near me right now" view and gps keeps updating (see the
   * watchPosition effect above), not a one-time snapshot from signup.
   */
  const professionalScore = useCallback((u: User, query: string, related: string[]): number => {
    const q = query.trim().toLowerCase();
    if (!q) return 1;
    const haystack = [u.name, u.specialty, u.bio, ...(u.serviceSubcategories ?? [])]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();
    let score = 0;
    if (haystack.includes(q)) score += 10;
    for (const word of q.split(/\s+/)) if (word.length > 1 && haystack.includes(word)) score += 3;
    if (related.some((c) => (u.servicesOffered ?? []).includes(c))) score += 5;
    return score;
  }, []);

  const visibleProfessionals = useMemo(() => {
    const scored = users
      .filter((u) => u.roleType !== 'client')
      .map((u) => {
        if (
          filters.category &&
          !(u.servicesOffered ?? []).includes(filters.category) &&
          !related.some((c) => (u.servicesOffered ?? []).includes(c))
        )
          return null;
        if (filters.city && !u.city.toLowerCase().includes(filters.city.toLowerCase())) return null;
        const score = professionalScore(u, filters.query, related);
        if (score <= 0) return null;
        const dist = distanceTo(u);
        if (filters.nearMe && dist !== null && dist > NEARBY_RADIUS_KM) return null;
        const sameArea = viewerCity && u.city.toLowerCase() === viewerCity ? 0 : 1;
        return { u, score, dist: dist ?? Infinity, sameArea };
      })
      .filter(Boolean) as { u: User; score: number; dist: number; sameArea: number }[];

    scored.sort((a, b) => {
      if (filters.query && b.score !== a.score) return b.score - a.score;
      if (a.dist !== b.dist) return a.dist - b.dist;
      if (a.sameArea !== b.sameArea) return a.sameArea - b.sameArea;
      return b.u.ratingAvg - a.u.ratingAvg;
    });
    return scored.map((s) => s.u);
  }, [users, filters, related, distanceTo, viewerCity, professionalScore]);

  const userById = useCallback((id: string) => users.find((u) => u.id === id), [users]);

  /* --------------------------- unlocking ------------------------- */
  const isUnlocked = useCallback(
    (userId: string) => {
      if (!user) return false;
      if (user.id === userId) return true;
      return unlocks.some((u) => u.unlockedUserId === userId && new Date(u.expiresAt).getTime() > Date.now());
    },
    [unlocks, user],
  );

  const unlockRemaining = useCallback(
    (userId: string) => {
      const row = unlocks.find((u) => u.unlockedUserId === userId);
      if (!row) return 0;
      return Math.max(0, new Date(row.expiresAt).getTime() - Date.now());
    },
    [unlocks],
  );

  const requestUnlock = useCallback((target: User) => {
    setUnlockRequest({ target });
  }, []);
  const closeUnlock = useCallback(() => setUnlockRequest(null), []);

  const openContactLink = useCallback(
    async (target: User, mode: 'whatsapp' | 'call', viewerId: string) => {
      try {
        const full = await api.getUser(target.id, viewerId);
        const rawNumber = mode === 'whatsapp' ? full.whatsapp || full.phone : full.phone;
        const digits = rawNumber.replace(/\D/g, '');
        if (digits.length < 8) {
          toast.error(t('errGeneric'));
          return;
        }
        const intl = digits.startsWith('237') ? digits : `237${digits}`;
        if (mode === 'whatsapp') {
          const text =
            lang === 'fr'
              ? `Bonjour ${full.name}, je vous contacte via QuickLink Cameroun.`
              : `Hello ${full.name}, I found you on QuickLink Cameroon.`;
          window.open(`https://wa.me/${intl}?text=${encodeURIComponent(text)}`, '_blank', 'noopener');
        } else {
          window.location.href = `tel:+${intl}`;
        }
      } catch {
        toast.error(t('errGeneric'));
      }
    },
    [lang, t, toast],
  );

  const contact = useCallback(
    (target: User, mode: 'whatsapp' | 'call') => {
      requireAuth((me) => {
        if (target.id === me.id || isUnlocked(target.id)) {
          void openContactLink(target, mode, me.id);
          return;
        }
        // No `after` here on purpose — once payment is confirmed, UnlockModal
        // opens both WhatsApp and the dialer itself. Nothing should wait on
        // a "Done" click, and nothing should re-open a second time when it's
        // clicked anyway.
        setUnlockRequest({ target });
      });
    },
    [isUnlocked, openContactLink, requireAuth],
  );

  /* --------------------------- interest -------------------------- */
  const expressInterest = useCallback(
    (postId: string, postType: 'task') => {
      requireAuth(async (me) => {
        if (myInterests.has(postId)) return;
        try {
          const res = await api.addInterest({ userId: me.id, postId, postType });
          setMyInterests((prev) => new Set(prev).add(postId));
          setTasks((list) => list.map((x) => (x.id === postId ? { ...x, interestedCount: res.interestedCount } : x)));
          toast.success(t('interestedDone'));
        } catch (e) {
          toast.error(e instanceof ApiError ? e.localized(lang) : t('errGeneric'));
        }
      });
    },
    [lang, myInterests, requireAuth, t, toast],
  );

  const addCustomCategory = useCallback((c: CategoryOption) => {
    setCustomCategories((prev) => {
      const next = [...prev, c];
      localStorage.setItem(LS.categories, JSON.stringify(next));
      return next;
    });
  }, []);

  const value: StoreValue = {
    users,
    tasks,
    categories,
    unlocks,
    myInterests,
    loading,
    refreshAll,
    refreshUnlocks,
    user,
    signIn,
    signOut,
    requireAuth,
    section,
    goTo,
    profileId,
    openProfile,
    closeProfile,
    filters,
    setFilters,
    resetFilters,
    gps,
    homeCity,
    locating,
    locateMe,
    distanceTo,
    saved,
    toggleSaved,
    visibleTasks,
    visibleProfessionals,
    userById,
    isUnlocked,
    unlockRemaining,
    requestUnlock,
    unlockRequest,
    closeUnlock,
    contact,
    expressInterest,
    accountsOpen,
    setAccountsOpen,
    citiesOpen,
    setCitiesOpen,
    professionsOpen,
    setProfessionsOpen,
    interestsFor,
    setInterestsFor,
    lightbox,
    setLightbox,
    videoFor,
    setVideoFor,
    addCustomCategory,
    afterAuth,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used inside StoreProvider');
  return ctx;
}

/** Local ticking countdown so only the badge re-renders each second. */
export function useCountdown(expiresAt?: string | null): number {
  const [remaining, setRemaining] = useState(() =>
    expiresAt ? Math.max(0, new Date(expiresAt).getTime() - Date.now()) : 0,
  );
  useEffect(() => {
    if (!expiresAt) {
      setRemaining(0);
      return;
    }
    const tick = () => setRemaining(Math.max(0, new Date(expiresAt).getTime() - Date.now()));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [expiresAt]);
  return remaining;
}
