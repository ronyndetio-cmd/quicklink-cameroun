import type { DataStore } from './dataStore';
import { createMemoryStore } from './memoryStore';
import { createSupabaseStore } from './supabaseStore';

const url = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_KEY;

export const usingSupabase = Boolean(url && serviceKey);

/**
 * The one place that decides where data lives. Everything else
 * (server.ts, scripts/seed.ts) imports `store` and never knows or cares
 * which backend is active.
 */
export const store: DataStore = usingSupabase ? createSupabaseStore(url!, serviceKey!) : createMemoryStore();
