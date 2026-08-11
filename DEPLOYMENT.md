# Deploying QuickLink Cameroun

## File layout: there's no separate "backend folder" and "frontend folder"

This is one repository, and a handful of files are genuinely **shared** —
imported by both the Express API and the React app:

| Shared (used by both) | Backend only | Frontend only |
| --- | --- | --- |
| `src/types.ts` | `server.ts` | `index.html` |
| `src/data/` (cities, categories, professions, seed) | `src/server/` (dataStore, memoryStore, supabaseStore, store) | `src/main.tsx`, `src/App.tsx` |
| `src/lib/` (geo, search, generator, media) | `supabase/migrations/` | `src/store.tsx`, `src/api.ts`, `src/i18n.tsx`, `src/theme.tsx` |
| | `scripts/seed.ts` | `src/components/`, `src/views/` |
| | | `vite.config.ts`, `tailwind.config.js` |

Why shared: e.g. `src/lib/search.ts`'s ranking logic and `src/data/cities.ts`
run **client-side** in `src/store.tsx` (so filtering results feels instant
without a network round-trip per keystroke) — but the exact same files also
run **server-side** in `server.ts` for the initial fetch and for generating
filler technicians. One copy, two consumers.

In practice you don't need to think about this split by hand — each build
tool only pulls in what it actually imports:

- **Vite** (`npm run build:client`) walks the import graph starting from
  `index.html` → `src/main.tsx`, and bundles only what the browser needs
  into `dist/client`. It never touches `server.ts`.
- **esbuild** (`npm run build:server`) walks the import graph starting from
  `server.ts`, and bundles only what Node needs into `dist/server.cjs`. It
  never touches `src/views/` or `src/components/`.

So: same git repo, deployed twice — once to Netlify (it only runs
`build:client`), once to Railway (it only runs `build:server`, or the API
route handlers plus `server.ts`'s static-file fallback if you go with
Option A below).

---

## Two ways to deploy — pick one

**Option A — everything on Railway (simplest, one URL, no CORS to think about).**
`server.ts` already serves the built React app itself in production (see
the `isProd` block at the bottom of the file) — so one Railway deploy gives
you both the API and the site, same origin, no extra config. This is what
`railway.json` is already set up for.

**Option B — Netlify (frontend) + Railway (backend), split.** Two deploys,
two URLs, CORS in between. Worth it if you want Netlify's CDN for the
static site, independent scaling, or you're just used to this pattern. This
is what you asked about, and it's fully wired up now — `CORS_ORIGIN` on the
backend and `VITE_API_URL` on the frontend exist for exactly this.

Both options use the same Supabase database — **do Part 1 (Supabase)
regardless of which option you pick**, it's identical either way.

---

## Part 1 — Supabase (the database, same for both options)

### 1. Create the project

1. Go to [supabase.com](https://supabase.com) → sign in → **New project**.
2. Pick an organization, name it (e.g. `quicklink-cameroun`), set a database
   password (save it somewhere — you won't need it for this app, but you'll
   need it if you ever connect a Postgres client directly), pick a region
   close to your users (e.g. an EU region tends to have the best latency to
   Cameroon today), and hit **Create**. Takes about two minutes to provision.

### 2. Run the schema

1. In the project, open the **SQL Editor** (left sidebar).
2. Click **New query**.
3. Open `supabase/migrations/0001_init.sql` from this repo, copy the whole
   file, paste it into the editor.
4. Click **Run**. You should see "Success. No rows returned." This creates
   all 7 tables (`users`, `tasks`, `services`, `interests`,
   `contact_unlocks`, `payments`, `reviews`) with their indexes.
5. Confirm: **Table Editor** (left sidebar) should now list those 7 tables.

### 3. Get your API credentials

1. Go to **Project Settings** (gear icon) → **API**.
2. Copy the **Project URL** — this is `SUPABASE_URL`.
3. Under **Project API keys**, copy the **`service_role`** key (not the
   `anon` key — the server needs the service role key to bypass Row Level
   Security, since it's the only thing that talks to this database). This
   is `SUPABASE_SERVICE_KEY`.

   The service role key can read and write everything with no restrictions.
   Never put it in client-side code or commit it to git — it only ever goes
   into Railway's environment variables, or your local `.env`.

### 4. Seed demo data (optional but recommended)

This loads the same demo users/tasks/services you've been previewing
locally (Arlette Ngando and friends), so the deployed app isn't empty on
day one.

```bash
# In your local project folder:
cp .env.example .env
# edit .env, paste in SUPABASE_URL and SUPABASE_SERVICE_KEY from step 3

npm run db:seed
```

You'll see a line per table confirming how many rows were inserted. Safe
to re-run — it upserts by id, so running it twice doesn't duplicate rows.

### 5. Push this project to GitHub

Both Railway and Netlify deploy from a git repo. If this folder isn't a git
repo yet:

```bash
git init
git add .
git commit -m "Initial commit"
```

Create a new repo on GitHub, then:

```bash
git remote add origin https://github.com/<you>/quicklink-cameroun.git
git branch -M main
git push -u origin main
```

(`.env` is already in `.gitignore` — your Supabase key never gets committed.)

---

## Option A — everything on Railway

### 1. Create the Railway project

1. Go to [railway.app](https://railway.app) → sign in (GitHub login is
   easiest) → **New Project**.
2. Choose **Deploy from GitHub repo**, pick the repo you just pushed.
3. It'll fail the first build — expected, you haven't set variables yet.

### 2. Set environment variables

Service → **Variables** tab:

| Variable | Value | Required? |
| --- | --- | --- |
| `SUPABASE_URL` | from Part 1, step 3 | Yes, for persistence |
| `SUPABASE_SERVICE_KEY` | from Part 1, step 3 | Yes, for persistence |
| `NODE_ENV` | `production` | Yes |
| `FAPSHI_API_USER` / `FAPSHI_API_KEY` | from your Fapshi dashboard | No — simulated without it |
| `GEMINI_API_KEY` | from Google AI Studio | No — canned replies without it |

Don't set `PORT` — Railway sets it itself and `server.ts` already reads it.
Don't set `CORS_ORIGIN` or `VITE_API_URL` for this option — same-origin
means neither is needed.

### 3. Deploy and get your URL

Saving variables triggers a redeploy. Once it's green, **Settings** →
**Networking** → **Generate Domain**. Open it — you should see the app,
backed by Postgres.

Confirm it's using Supabase: **Deployments** → **View Logs**, look for:

```
data: Supabase (Postgres)
```

If it says `data: in-memory (...)` instead, double-check the two
`SUPABASE_*` variables against Part 1, step 3.

---

## Option B — Netlify (frontend) + Railway (backend)

### 1. Deploy the backend to Railway first (you'll need its URL for step 2)

Same as Option A, steps 1–3 above, with one addition: once you know your
Netlify URL (you'll get it in step 2 below, then come back and add this),
set one more variable:

| Variable | Value |
| --- | --- |
| `CORS_ORIGIN` | `https://your-site-name.netlify.app` |

You can also deploy Railway first with `CORS_ORIGIN` unset (it's permissive
by default), get everything working, then lock it down to your real
Netlify URL afterward — either order works.

### 2. Deploy the frontend to Netlify

1. Go to [netlify.com](https://netlify.com) → sign in → **Add new site** →
   **Import an existing project** → connect GitHub → pick the repo.
2. Netlify reads `netlify.toml` (already in the repo) automatically:
   - Build command: `npm run build:client`
   - Publish directory: `dist/client`
   - SPA redirect (so refreshing on any section still works): already configured.
3. Before the first deploy, add the one environment variable the frontend
   needs: **Site configuration** → **Environment variables** → add
   `VITE_API_URL` = `https://your-api-name.up.railway.app/api` (your Railway
   URL from step 1, with `/api` on the end).

   This has to be set **before** you build — Vite bakes it into the
   JavaScript bundle at build time, it's not read at runtime like the
   backend's variables are. If you add it after the first deploy, trigger a
   new deploy (**Deploys** → **Trigger deploy** → **Clear cache and deploy
   site**) so it actually takes effect.
4. Deploy. Netlify gives you a `https://<something>.netlify.app` URL.

### 3. Close the loop

Go back to Railway and set `CORS_ORIGIN` to that exact Netlify URL (no
trailing slash), if you haven't already. Redeploy Railway.

### 4. Verify

Open the Netlify URL. Open your browser's DevTools → Network tab, do
anything that hits the API (browse Prestataires, sign in) — requests should
go to your `*.up.railway.app` domain and succeed. If you see a CORS error
in the console, `CORS_ORIGIN` on Railway doesn't exactly match the Netlify
URL (check for `https://` vs `http://`, trailing slash, `www.` prefix).

---

## Keeping the database and the app in sync later

Any time you add a new field to `src/types.ts` that needs to be persisted:

1. Write a new file in `supabase/migrations/` (e.g. `0002_add_x.sql`) with
   an `alter table ... add column ...` statement.
2. Run it in the Supabase SQL Editor (same as Part 1, step 2).
3. Update the row-mapping functions in `src/server/supabaseStore.ts` to
   read/write the new column.
4. Update `src/server/memoryStore.ts` too, so local preview without
   Supabase still behaves the same way.

The route handlers in `server.ts` never need to change for this — they only
ever call through the `DataStore` interface in `src/server/dataStore.ts`.

## Rolling back to in-memory

If Postgres ever needs to be taken out of the loop temporarily (e.g.
debugging), just remove `SUPABASE_URL` / `SUPABASE_SERVICE_KEY` from
Railway's Variables tab and redeploy — the app falls back to in-memory
automatically, no code change required.
