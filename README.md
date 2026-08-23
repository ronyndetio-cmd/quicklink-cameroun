# QuickLink Cameroun (QL)

A bilingual (FR/EN), mobile-first marketplace that connects households with local
technicians and artisans across Cameroon. Browsing is free; a professional's phone
number stays masked (`677 *** ***`) until it is unlocked for **250 FCFA** via Mobile
Money. Every member — client or professional — declares their own profession at
signup, because everyone has one. Accounts are phone number + password; there's no
separate "post a service" flow — professionals are simply user profiles, and everyone
posts tasks.

---

## Run it

```bash
npm install
npm run dev          # http://localhost:5173  (Express + Vite middleware, HMR)
```

If port 5173 is already taken on your machine, set `PORT` to anything else:

```bash
PORT=5180 npm run dev
```

Production:

```bash
npm run build        # vite build + esbuild-bundled dist/server.cjs
npm start            # node dist/server.cjs
```

Optional — the support assistant and translation both prefer Groq but work without
it (canned bilingual replies / a free MyMemory API fallback, respectively):

```bash
cp .env.example .env    # then set GROQ_API_KEY, SUPABASE_URL/SUPABASE_SERVICE_KEY, etc.
```

Data lives in memory on the server and resets on restart unless `SUPABASE_URL` /
`SUPABASE_SERVICE_KEY` are set. AI support chat, real Mobile Money payments, and real
password-reset emails all work the same way — fully simulated out of the box, and
switched on for real the moment their respective key is set. See **`GO_LIVE.md`** for
the exact step-by-step (which account to create, what to click, what to paste where) for
all five: Groq, Supabase, Fapshi, Resend, Railway. `DEPLOYMENT.md` covers the deploy
mechanics specifically (Railway vs. Netlify+Railway, file layout, keeping the DB schema
in sync).

---

## The one rule everything hangs off

`unlockStatus(viewer, target)` in `server.ts` is **computed on every read** from
`unlockedAt + 24h` — never stored as a boolean or an expiry flag. Consequences:

- Contacts relock by themselves; nothing has to run a cleanup job.
- A client that claims "payment succeeded" gets nothing. The `ContactUnlock` record is
  only ever created inside `POST /api/payments/webhook` (or, in simulated mode, the
  server's own stand-in timer calling the same code path — see **Payments** below).
- Replaying a webhook returns `alreadyProcessed` instead of charging twice.
- You always see your own number.
- The 24-hour window is real and enforced server-side, but the app deliberately never
  *advertises* "valid for 24 hours" anywhere in the UI — the copy just says the contact
  is unlocked.

There is no subscription tier — every unlock is a single 250 FCFA Mobile Money payment.

## Layout

```
server.ts               Express API; in-memory or Supabase store; Vite middleware in dev
src/
  types.ts               Domain model shared by client and server
  api.ts                 Typed fetch client
  store.tsx              Session, filters, live geolocation, unlock + contact flows
  i18n.tsx                FR/EN dictionary (265 keys, kept in lockstep between FR/EN),
                          relative time, countdown, FCFA formatting
  data/                   215+ cities w/ quarters, 337+ categories, 490+ professions, seed dataset
  lib/                    Haversine + reverse geocode, fuzzy search, technician generator,
                          SVG media generator, image compression + watermarking
  assets/                 Uploaded brand assets (logo, hero background)
  components/             UI primitives, feed card, professional card, modals
  views/                  Hub, Categories, Tasks, Professionals, Map, Saved, Profile,
                          ProfileEdit, ProfileSettings, MyTasks, PublicProfile, Support,
                          Auth (full-page login, "Créer un compte" to switch to signup)
```

### Notes on a few decisions

**Payments call the real Fapshi API.** `POST /api/payments/initiate` calls
[Fapshi](https://fapshi.com)'s `/direct-pay` endpoint the moment `FAPSHI_API_KEY` is
set — a real MoMo/Orange Money prompt goes to the payer's phone, Fapshi's webhook (with
optional `x-wh-secret` signature verification) drives confirmation, and
`/api/payments/status/:transId` self-heals by polling Fapshi directly too, so unlocks
still confirm correctly even before a public webhook URL exists. Without the keys, the
server schedules its own short timer that resolves the payment the same way a real
webhook would — there are no manual "I approved" buttons in the UI either way. The
moment the payment resolves (real or simulated), the contact unlocks and WhatsApp + the
phone dialer both open automatically; nothing waits on a button click.

**The AI support chat and translator run on Groq.** `POST /api/ai/chat` and `POST
/api/translate` both call [Groq](https://console.groq.com) (`openai/gpt-oss-20b` by
default) the moment `GROQ_API_KEY` is set. Without it, chat falls back to canned
bilingual replies and translation falls back to the free, keyless MyMemory API — the
features never break, they just get smarter with a key.

**Forgot password sends a real email once Resend is configured.** The reset flow
accepts a phone or an email, generates a 6-digit code good for 10 minutes, and — for
email — calls [Resend](https://resend.com) to actually send it once `EMAIL_API_KEY` is
set. Without a key (or for phone-based resets, which have no SMS gateway wired), the
code comes back directly in the API response (`devCode`) and shows on-screen instead —
convenient for local testing, but **do not deploy with real users on this path**:
anyone who knows an account's phone/email can otherwise see its reset code.

**Everyone declares a profession.** Signup requires a profession for every account,
because on QuickLink a "client" today is often a professional tomorrow. Categories are
never hand-administered — if what someone types at signup isn't close to an existing
category, one is minted on the spot (`Auth.tsx`'s `resolveOrCreateCategory`) and reused
by anyone who types something similar afterward.

**Accounts are one phone + one optional email + a password.** Passwords are
bcrypt-hashed server-side and never returned to the client (`publicUser()` strips
`passwordHash` from every response). Both the phone and the email (when given) are
enforced unique across accounts server-side — signup rejects a duplicate of either with
a 409 naming whose account already has it. There's no session token — the client
remembers a signed-in user's id in `localStorage`, same as the rest of the app's
local-first state, just gated by a real password check at login now instead of "any
known phone number logs in." The auth page itself shows only the login form by default
(no tab switcher); "Créer un compte" / "Se connecter" links at the bottom of each form
swap between them.

**"Professionals" are user profiles, not posts.** There's no separate service-listing
type to create or moderate. `visibleProfessionals` in `store.tsx` filters `users` by
role and category and sorts by live distance — geolocation uses `watchPosition`, not a
one-time fix, so the list actually re-sorts as someone moves around.

**Imagery is generated or watermarked, never bare.** `lib/media.ts` produces avatars,
cover bands, category art and work samples as deterministic SVG data URIs when there's
no real photo. Real uploads go through `readAndCompressImage()`, which downscales large
phone photos to keep payloads small and stamps a semi-transparent QuickLink watermark
in the corner — every photo on the site carries one.

**Every town feels inhabited.** Ask for a city+trade with too few real listings and
`ensureFillers()` fabricates plausible local technicians, with name pools that follow
the region (Sahel, Grassfields, Beti, coastal, Anglophone) and English job titles in the
North-West and South-West.

**Search widens before it narrows.** `relatedCategories()` maps a free-text query
("fuite", "benskin", "écran cassé") onto trades via synonyms, subcategories and the
profession list; `scoreMatch()` then ranks by field weight.

**Everyone gets a default location, and the map respects it.** `coordsFor()` seeds a
deterministic position around each user's declared city/quarter; if the browser's
geolocation prompt is denied or unavailable, the app falls back to Douala rather than
leaving location blank anywhere. `MapView` filters both professionals and tasks to a
7 km radius around the resolved location, re-centering with a POI-friendly street-level
zoom on "Recentrer sur moi." One Google-Maps-style button opens a small picker with a
live tile preview of all three styles (Plan/Clair/Satellite) instead of three separate
buttons, and two more buttons ("Professionnels (N)" / "Tâches (N)") jump straight into
the filtered list for whichever's on the map, counts included, where category/area
sorting continues.

**There is no notification system.** It was tried and removed. Instead, a signed-in
user's profile shows their work photos and posted tasks directly — no bell, no unread
badge, nothing to check. Adding a work photo never requires opening edit mode: pick a
file from the profile page and it saves immediately, same pattern as changing the
avatar. "Tâches publiées" and "Paramètres" are both their own full pages (`MyTasks.tsx`,
`ProfileSettings.tsx`), not inline accordions — the profile hub is a menu, not a form.

**Design.** Roboto throughout (headings render at 800 weight via `.font-display`, and
the hero H1/lead are sized up further so the home page opens with real visual weight);
deep petrol `brand`, a single consistent `gold`-token blue for anything that costs or
unlocks (no orange/amber left in the app), `forest` for verified/open. The home hero is
a full-bleed background photo with no gap above it and no "direct connection" eyebrow
badge or stat boxes cluttering it — the search panel is the one prominent element left,
and it lifts slightly on hover. Task/professional cards and category tiles all have a
visible border so their edges read clearly, plus one internal divider above the
WhatsApp/Call row. The home category strip is a heading-free, swipeable row of circular
icons (no boxes); the full Categories page uses bordered, centered tiles with no
technician/task counts cluttering them, and no manual "add a category" admin flow —
categories are only ever created automatically from what someone types at signup. The
footer is a dark (`brand-950`) band that only appears on the home page, with a
white/inverted version of the (genuinely transparent-background) logo. The header is a
fixed 56px strip that never grows; on mobile, the account/sign-in entry point lives
inside the hamburger panel instead of a second "My profile" link. On the profile page,
the avatar is directly clickable to change the photo in both view and edit mode (no
need to enter edit mode first — outside edit mode the change saves immediately), and
"Delete my account" only appears once "Modifier le profil" is open, not on the plain
view.

---

## API

| Method | Route | Notes |
| --- | --- | --- |
| GET/POST/PUT/DELETE | `/api/users`, `/api/users/:id` | phone globally unique; profession + photo + password required on create; masked unless `?requestingUserId=` has it unlocked |
| POST | `/api/auth/login` | phone + password; never returns the password hash |
| POST | `/api/users/:id/video` | set or clear the video bio |
| GET/POST/DELETE | `/api/tasks` | filter by category/city/urgency/search, newest first |
| GET/POST/DELETE | `/api/services` | internal only now — powers filler-technician generation, not a user-facing post type |
| GET/POST | `/api/interests` | free, idempotent per user+post |
| GET | `/api/unlocks/check?userA&userB` | status + remaining ms |
| GET | `/api/unlocks?userId` | active contacts with expiry |
| POST | `/api/payments/initiate` | pending tx + Fapshi-shaped `transId`; auto-resolves in simulated mode |
| POST | `/api/payments/webhook` | **the only place unlocks are created** — real Fapshi calls this in production |
| GET | `/api/payments/status/:transId` | polled by the client while a payment is pending |
| GET | `/api/payments/history?userId` | |
| GET/POST | `/api/reviews`, `/api/reviews/:userId` | 1–5 stars, no self-review, recomputes average |
| POST | `/api/support` | WhatsApp deep link to a human |
| POST | `/api/ai/chat` | bilingual; appends a safety reminder to money/hiring replies |
| POST | `/api/translate` | Groq if configured, else a free MyMemory API fallback — always available |

## Try this first

1. Open the app — it asks for location, and falls back to Douala if you decline (and
   keeps tracking afterwards, so distance-sorted lists update as you actually move).
2. Tap **Se connecter** → **Créer un compte**. Add a photo (required), a phone number,
   a WhatsApp number (optional, defaults to your phone), a password, your profession,
   and whether you're a client or a professional.
3. Open **Professionnels**, tap **WhatsApp** or **Appeler** on any card — this triggers
   the unlock paywall if you haven't paid for that contact yet.
4. Enter a payment number and tap **Payer 250 FCFA**. In simulated mode (no Fapshi keys)
   the payment resolves itself after a few seconds, exactly like a real Mobile Money
   confirmation would — the number appears and WhatsApp/the dialer open on their own.
5. Open **Carte** to see professionals and tasks placed on a lightweight generated map,
   filterable by category.
6. Flip the header language toggle at any point; every string, including generated
   listings in the North-West, follows.

---

## Roadmap to production

- **Fapshi.** `server.ts`'s `/api/payments/initiate` and `/api/payments/webhook` are
  already shaped like Fapshi's collect API. Wiring the real thing means calling Fapshi's
  `/initiate-pay` endpoint with `FAPSHI_API_USER` / `FAPSHI_API_KEY`, and pointing
  Fapshi's webhook at `/api/payments/webhook`. See `DEPLOYMENT.md` for how to do this
  once deployed to Railway (including using Railway's own domain as the webhook URL —
  no purchased domain required).
- **Supabase.** Already wired — `src/server/supabaseStore.ts` implements the same
  `DataStore` interface as the in-memory store, and is selected automatically once
  `SUPABASE_URL` / `SUPABASE_SERVICE_KEY` are set. Run the migrations in
  `supabase/migrations/` in order against a new Supabase project.
