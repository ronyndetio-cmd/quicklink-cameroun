# Go-live checklist

Everything below is already wired into the code. Nothing here needs a code
change — it's entirely about creating five accounts, copying a key back into
`.env` (locally) or your host's **Variables** tab (once deployed), and
deploying. Do the five phases in order.

| # | Phase | Unlocks | Code already does this |
| --- | --- | --- | --- |
| 1 | [Groq](#1-groq--ai-support-chat) | Real AI replies in the support chat + FR/EN translator | ✅ — falls back to canned replies without a key |
| 2 | [Supabase](#2-supabase--the-database) | A real Postgres database instead of in-memory (resets on restart) | ✅ — falls back to in-memory without credentials |
| 3 | [Fapshi](#3-fapshi--mobile-money-payments) | Real MTN MoMo / Orange Money charges for the 250 FCFA unlock | ✅ — falls back to a 4.5s auto-simulated payment without keys |
| 4 | [Resend](#4-resend--real-password-reset-emails) | Real password-reset emails instead of an on-screen code | ✅ — falls back to showing the code on-screen without a key |
| 5 | [Railway](#5-railway--deploying-it) | A public URL for the whole app | `railway.json` is already set up for this |

---

## 1. Groq — AI support chat

Groq runs open models (Llama, GPT-OSS) at very high speed, which is what
makes the in-app assistant feel instant instead of laggy. Free to start, no
card needed.

1. **Create your account** — go to [console.groq.com](
   → sign up with Google, GitHub, or email → verify if asked.
2. **Generate a key** — left sidebar → **API Keys** → **Create API Key** →
   name it something like `quicklink-support` → copy it now. Groq only shows
   the full key once; if you lose it, just make a new one.
3. **Hand it to the app:**

   ```bash
   GROQ_API_KEY=gsk_your_key_here
   # optional — swap models any time at console.groq.com/docs/models
   GROQ_MODEL=openai/gpt-oss-20b
   ```

Nothing else to build — the support chat and the FR/EN post translator both
call Groq the instant this key exists. Leave it unset and the app keeps
working with canned bilingual replies; it never breaks either way.

---

## 2. Supabase — the database

Free Postgres project. Without this, the app runs on in-memory data that
resets every restart — fine for testing, not for real users.

1. **Create the project** — [supabase.com](https://supabase.com) → sign in →
   **New project** → pick an organization, name it (e.g.
   `quicklink-cameroun`), set a database password (save it somewhere safe),
   pick a region close to Cameroon (an EU region usually has the best
   latency today) → **Create new project**. Takes about two minutes.
2. **Run the schema — five files, in order.** Left sidebar → **SQL Editor**
   → **New query**. Open each file below from `supabase/migrations/` in this
   repo, paste the whole thing, hit **Run** — then repeat with **New query**
   for the next one. Order matters; each file alters what the last one
   built.

   ```
   0001_init.sql                  # the 7 core tables
   0002_add_password.sql
   0003_add_whatsapp.sql
   0004_add_password_resets.sql
   0005_add_social_links.sql
   ```

   Confirm it worked: **Table Editor** should list `users`, `tasks`,
   `services`, `interests`, `contact_unlocks`, `payments`, `reviews`.
3. **Copy your credentials** — **Project Settings** (gear icon) → **API**.
   Copy the **Project URL**, and under "Project API keys" copy the
   **service_role** key — not the `anon` one.

   ```bash
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_SERVICE_KEY=your_service_role_key
   ```

   > **Never** put the service_role key in frontend code or commit it to
   > git — it bypasses every access restriction on the database. It only
   > ever goes in a local `.env` or your host's Variables tab (`.env` is
   > already in `.gitignore`).
4. **Seed it with demo data** (optional) — once the two variables above are
   in your local `.env`:

   ```bash
   npm run db:seed
   ```

   Safe to re-run — it upserts by id, so it won't duplicate rows.

---

## 3. Fapshi — Mobile Money payments

Powers the 250 FCFA contact-unlock. The moment the two keys below exist, the
app calls Fapshi's real `direct-pay` endpoint and pushes an actual
MoMo/Orange Money prompt to the payer's phone — right now it's a
4.5-second simulated confirmation instead.

1. **Create + activate your account** —
   [dashboard.fapshi.com/auth/signup](https://dashboard.fapshi.com/auth/signup)
   → sign up → activate via the confirmation step it sends you → log in.
2. **Create a service** — bottom-left → **Developers** → **New Service**.
   Give it a name (e.g. `QuickLink Cameroun`) and a domain — your future
   Railway or custom domain is fine even before it's live. Submit.
3. **Copy the Sandbox keys first** — open the new service → under
   **Sandbox**, copy the **API User** and **API Key**. Test the whole unlock
   flow with fake money before touching Live credentials.

   ```bash
   FAPSHI_API_USER=your_sandbox_api_user
   FAPSHI_API_KEY=your_sandbox_api_key
   FAPSHI_ENV=sandbox
   ```
4. **Point the webhook at your API** — once you have a live Railway URL
   (phase 5), open the service's settings and set the webhook/callback URL
   to:

   ```
   https://your-app.up.railway.app/api/payments/webhook
   ```

   If the dashboard lets you set a webhook secret, add it too — the app
   already checks the `x-wh-secret` header against it:

   ```bash
   FAPSHI_WEBHOOK_SECRET=your_webhook_secret
   ```

   Skippable for now — the app also self-heals by polling Fapshi's live
   payment status directly, so unlocks still confirm correctly even before
   a webhook is configured.
5. **Go live, when ready** — same service, switch to the credentials under
   **API** (labelled "Live"), then flip:

   ```bash
   FAPSHI_ENV=live
   FAPSHI_API_USER=your_live_api_user
   FAPSHI_API_KEY=your_live_api_key
   ```

   Fapshi disables *payouts* (money leaving your account) on Live until
   their support approves it — that only matters if you ever add a feature
   that pays users out. Money coming in from the contact-unlock works
   immediately.

---

## 4. Resend — real password-reset emails

"Forgot password" currently shows the 6-digit reset code right on-screen
instead of emailing it — fine for testing, but it means anyone who knows a
user's email can see their reset code too. Resend closes that gap.

1. **Create your account** — [resend.com](https://resend.com) → sign up →
   verify your own email if asked. Free tier, no card required.
2. **Generate a key** — Dashboard → **API Keys** → **Create API Key** →
   name it (e.g. `quicklink-reset`) → copy it now, it's shown once.

   ```bash
   EMAIL_API_KEY=re_your_key_here
   ```

   Nothing else to build — the moment this key exists, password-reset
   emails actually send. Leave it unset and the app keeps working exactly
   as now, code shown on-screen.
3. **Verify a domain** (needed before real users can reset) — Dashboard →
   **Domains** → **Add Domain** → enter any domain you own → add the DNS
   records it shows you at your domain registrar → wait for it to verify
   (usually minutes).

   ```bash
   EMAIL_FROM=QuickLink Cameroun <noreply@yourdomain.com>
   ```

   > Until a domain is verified, emails send from Resend's shared
   > `onboarding@resend.dev` address, which only delivers to the email your
   > own Resend account was created with. Good enough to test the flow
   > yourself; real users won't receive anything until you verify a domain
   > and set `EMAIL_FROM`.

---

## 5. Railway — deploying it

Simplest path: everything on Railway, one URL, no CORS to configure.
`server.ts` already serves the built React app itself in production, and
`railway.json` is already set up for this. (Want Netlify's CDN for the
frontend instead? See the Option B split-deploy walkthrough in
`DEPLOYMENT.md`.)

1. **Push this project to GitHub** (skip if it's already there):

   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/<you>/quicklink-cameroun.git
   git branch -M main
   git push -u origin main
   ```
2. **Create the Railway project** — [railway.app](https://railway.app) →
   sign in with GitHub → **New Project** → **Deploy from GitHub repo** →
   pick this repo. The first build will fail — expected, no variables are
   set yet.
3. **Set every variable at once** — your service → **Variables** tab →
   paste all of these in (values from phases 1–4 above):

   ```bash
   NODE_ENV=production
   SUPABASE_URL=…              # phase 2
   SUPABASE_SERVICE_KEY=…      # phase 2
   GROQ_API_KEY=…              # phase 1
   GROQ_MODEL=openai/gpt-oss-20b
   FAPSHI_API_USER=…           # phase 3
   FAPSHI_API_KEY=…            # phase 3
   FAPSHI_ENV=sandbox
   FAPSHI_WEBHOOK_SECRET=…     # phase 3 (optional)
   EMAIL_API_KEY=…             # phase 4
   EMAIL_FROM=…                # phase 4 (optional until you verify a domain)
   ```

   Don't set `PORT` — Railway assigns it and `server.ts` already reads it.
   Saving triggers a redeploy automatically.
4. **Get your domain** — once the deploy is green: **Settings** →
   **Networking** → **Generate Domain**. Open it — the live app, backed by
   Postgres and real payments.
5. **Close the loop with Fapshi** — copy that new Railway domain and go
   back to phase 3, step 4 — paste it into the Fapshi webhook URL field.

---

## You'll know it's really live when

- `/api/meta` on your domain returns `"aiEnabled": true` — Groq is
  answering, not the canned fallback.
- Railway → Deployments → View Logs shows `data: Supabase (Postgres)`, not
  `in-memory`.
- Unlocking a contact sends a real MoMo/Orange Money prompt to your phone —
  not the old 4.5-second auto-confirm.
- The support bubble replies with something that isn't one of the three
  canned scripted answers.
- "Forgot password" with an email account delivers a real email — the code
  no longer shows up on-screen.

If any of these don't check out, the fix is almost always a mismatched
variable name — compare against the exact keys in the code blocks above.

*A polished, clickable version of this same guide is also published as a
Claude artifact from the session that wrote it, if you'd rather read it
there.*
