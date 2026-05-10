# BiteMates — Build Plan

**Target ship date:** June 20, 2026 (5 days before Vietnam departure on June 25)
**Build window:** May 8 — June 20 (6 weeks 5 days)
**Available time:** ~120 hours of after-work / weekend dev time
**Strategy:** Functional-first. Design polish pass becomes v1.1 in August.

---

## Schedule At-a-Glance

| Week | Dates | Phase | Hours | Output |
|------|-------|-------|-------|--------|
| 1 | May 8–14 | Phase 0 finish + Phase 1 (Auth) | ~15 | Live deploy + sign-up + Google OAuth |
| 2 | May 15–21 | Phase 2 (Schema/RLS) + Phase 3 start (Diary) | ~20 | Database live; can log a manual meal |
| 3 | May 22–28 | Phase 3 finish (Search + Barcode) | ~22 | Full diary working solo |
| 4 | May 29 – Jun 4 | Phase 4 (Pairing) + Phase 5 start (Feed) | ~20 | Justin & Nhi paired; partner feed visible |
| 5 | Jun 5–11 | Phase 5 finish (Co-log) + Phase 6 (Photo AI) | ~22 | Full feature set complete |
| 6 | Jun 12–18 | Phase 7 (Dashboard + dogfood + bug fixes) | ~18 | Justin & Nhi using daily |
| Buffer | Jun 19–20 | Final fixes, Vietnam prep | ~5 | Ship |

**Total budget:** ~122 hours. **Slack:** ~5 hours. **No padding.**

---

## Phase 0 — Finish Setup
**Window:** May 8–10 (this weekend) · ~3 hours
**Goal:** Project deployed and live on Vercel. Installable PWA shell.

### Already done (carried from v1.0)
- [x] **0.1** Next.js 14+ scaffolded with TypeScript + Tailwind + App Router + src dir
- [x] **0.2** Supabase deps installed (`@supabase/supabase-js`, `@supabase/ssr`)
- [x] **0.3** Tailwind config has full color tokens
- [x] **0.4** Manrope font loaded in `app/layout.tsx`
- [x] **0.5** Material Symbols Outlined loaded
- [x] **0.6** `.glass-panel` utility in global CSS
- [x] **0.8** `.env.local` with placeholders
- [x] **0.9** `lib/supabase/client.ts` and `lib/supabase/server.ts`
- [x] **0.12** Placeholder landing page

### Finish this weekend
- [ ] **0.7** Create Supabase project at supabase.com. Paste real `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` into `.env.local`
- [ ] **0.10** `git init`, push to a private GitHub repo `bitemates`
- [ ] **0.11** Connect repo to Vercel. Add env vars in Vercel dashboard. Confirm deploy succeeds and the placeholder page loads at the Vercel URL
- [ ] **0.13** Get a free USDA FoodData Central API key at https://fdc.nal.usda.gov/api-key-signup.html. Add `USDA_API_KEY` to `.env.local` and Vercel
- [ ] **0.14** Create an Anthropic API key at console.anthropic.com. Add `ANTHROPIC_API_KEY` to `.env.local` and Vercel. Set $20 monthly budget cap.
- [ ] **0.15** PWA scaffold: install `next-pwa` OR add manifest manually
  - [ ] Create `public/manifest.json` with name, short_name, theme_color #ebfeee, background_color #ebfeee, display: "standalone", start_url: "/"
  - [ ] Generate two PNG icons (192×192, 512×512) — simple sage-green "B" on white background is fine for v1, refine in v1.1
  - [ ] Add `<link rel="manifest" href="/manifest.json">` and apple-touch-icon meta in `app/layout.tsx`
  - [ ] Verify on iPhone Safari: "Add to Home Screen" should show the icon

**Phase 0 Checkpoint:** Live URL works. App is installable on phone home screen. All env vars set in Vercel. No features yet.

---

## Phase 1 — Auth (Email + Google OAuth)
**Window:** May 11–14 · ~12 hours
**Goal:** Users can sign up via email or Google, log in, get redirected to dashboard. Profile row auto-created.

- [ ] **1.1** Run profiles table SQL from SPECIFICATIONS.md §6.1 in Supabase SQL Editor
- [ ] **1.2** Run `handle_new_user()` trigger function and `on_auth_user_created` trigger from §6.2
- [ ] **1.3** Enable Google OAuth in Supabase dashboard
  - Create Google OAuth credentials in Google Cloud Console (OAuth 2.0 client, Web app)
  - Authorized redirect URI: `https://[supabase-project].supabase.co/auth/v1/callback`
  - Paste client ID + secret into Supabase Auth providers
- [ ] **1.4** Create auth callback route handler (`app/auth/callback/route.ts`) for OAuth redirects
- [ ] **1.5** Build `/login` page with two paths:
  - "Continue with Google" button → `supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: <APP_URL>/auth/callback } })`
  - Email + password form → `supabase.auth.signInWithPassword()`
  - On error: inline message
- [ ] **1.6** Build `/signup` page:
  - "Continue with Google" button (same flow, then route to `/onboarding/profile`)
  - Email/password form with display name + username fields → `supabase.auth.signUp()` with metadata
  - Username validation client-side (3–20, lowercase alphanumeric + underscore)
  - On signup: trigger creates profile, redirect to `/dashboard` (or `/invite/[code]` if invite param present)
- [ ] **1.7** Build `/onboarding/profile` page (for OAuth users who don't have username yet)
  - Fields: username (validated), display name (prefilled from OAuth)
  - On submit: update profiles row, redirect to `/dashboard`
  - Skip this page if profile already has username
- [ ] **1.8** Create middleware (`middleware.ts`) protecting authenticated routes
  - Public: `/`, `/login`, `/signup`, `/invite/[code]`, `/auth/callback`
  - Auth users on `/login` or `/signup` redirect to `/dashboard`
  - Unauth users on protected routes redirect to `/login`
- [ ] **1.9** Sign-out: server action that calls `supabase.auth.signOut()` and redirects to `/`
- [ ] **1.10** Top nav with sign-out button (placed in dropdown / hamburger)

**Phase 1 Checkpoint:** Sign up via email or Google works end-to-end. Profile row exists. Username is set. Sign out works. Justin and Nhi can both create accounts.

---

## Phase 2 — Schema, RLS, Goals
**Window:** May 15–18 · ~10 hours
**Goal:** Full database schema is live with RLS. Goals page works.

- [ ] **2.1** Run remaining schema from SPECIFICATIONS.md §6.1: `shared_spaces`, `shared_space_members`, `invites`, `food_log_entries`, `favorites`. All indexes.
- [ ] **2.2** Run `get_user_space()` and `get_partner_ids()` helper functions from §6.2
- [ ] **2.3** Enable RLS on all tables in Supabase dashboard _(partial: `profiles` enabled 2026-05-09 to unblock Phase 1.7; other tables pending)_
- [ ] **2.4** Write RLS policies (SQL in Supabase) per §6.3:
  - profiles: own row + same-space rows (via `shared_space_members` join) _(partial: own-row SELECT/UPDATE done 2026-05-09; same-space SELECT deferred until 2.1 lands `shared_space_members`)_
  - food_log_entries: own + same-space members can SELECT, only owner CRUD their own
  - shared_space_members: see members of own spaces
  - invites: see own created OR own redeemed
  - favorites: own only
- [ ] **2.5** Create Supabase Storage bucket `meal-photos` (public read, authenticated write)
- [ ] **2.6** Build `/goals` page
  - Calorie target input (number, range 1000–5000)
  - Three macro % sliders (protein, carbs, fat) with linked auto-balance to 100
  - Calculated grams shown live next to each
  - Save button → POST `/api/goals`
- [ ] **2.7** `GET /api/goals` and `PUT /api/goals` route handlers. Validate sum=100.
- [ ] **2.8** Quick smoke test: insert a fake `food_log_entry` for self via SQL, verify it returns from `/api/diary` (after Phase 3.1 stub) but NOT for other users.

**Phase 2 Checkpoint:** All tables live with RLS. Goals page reads/writes correctly. Each user's data is isolated.

---

## Phase 3 — Diary Core (Search, Manual, Barcode)
**Window:** May 19–28 · ~22 hours
**Goal:** Solo logging works fully. Three of five add-food methods implemented (Search, Manual, Barcode).

- [ ] **3.1** `GET /api/diary?date={YYYY-MM-DD}` route handler — return entries grouped by `meal_category` with subtotals
- [ ] **3.2** `POST /api/diary` — create entry (validate required fields)
- [ ] **3.3** `DELETE /api/diary/[id]` — delete own entry
- [ ] **3.4** Build `/diary` page
  - Date nav (prev/today/next)
  - Daily totals at top: calories, protein, carbs, fat (consumed vs goal)
  - Four `MealSection` components (Breakfast, Lunch, Dinner, Snacks) with subtotals
  - "Add Food" button per section linking to `/diary/add?category={cat}`
- [ ] **3.5** Build `/diary/add` page with tabbed UI: **Search**, **Barcode**, **Photo** (placeholder for now), **Manual**, **Favorites**
  - Pre-select the right tab based on `?tab=` param
  - Pre-fill meal category from `?category=` param

### Search

- [ ] **3.6** `GET /api/food/search?q={q}` — call USDA, normalize, fall back to OFF if zero results
  - USDA endpoint: `https://api.nal.usda.gov/fdc/v1/foods/search?query={q}&pageSize=10&api_key={USDA_API_KEY}`
  - Capture full nutrient array into `nutrition_full` JSONB
  - Map curated 10 fields from USDA nutrient IDs (1008, 1003, 1004, 1005, 1079, 2000, 1093, 1258, 1253)
  - OFF fallback: `https://world.openfoodfacts.org/cgi/search.pl?search_terms={q}&json=1&page_size=10`
  - Both return `FoodSearchResult[]` per SPECIFICATIONS.md §7
- [ ] **3.7** `FoodSearch` component: debounced (300ms) input + result list
- [ ] **3.8** Food confirmation form: serving quantity, meal category, date. Calculated totals update live. "Add to Diary" button.

### Manual

- [ ] **3.9** Manual entry form: name (required), calories (required), all macro fields (optional, default 0), serving size, meal category, date

### Barcode

- [ ] **3.10** `npm install html5-qrcode`
- [ ] **3.11** `GET /api/food/barcode/[code]` — query OFF: `https://world.openfoodfacts.org/api/v2/product/{code}?fields=product_name,nutriments,serving_size`
  - Normalize to `FoodSearchResult`
  - Capture full `nutriments` object as `nutrition_full`
  - Return 404 if product status !== 1
- [ ] **3.12** `BarcodeScanner` component: camera viewfinder + html5-qrcode → decoded code → API lookup → confirmation form
  - Handle camera permission denied (instructions to enable)
  - Hide tab if no camera available (desktop)

**Phase 3 Checkpoint:** Justin can log a full day of food via search, barcode, or manual entry. Daily totals reflect entries. Delete works.

---

## Phase 4 — Partner Pairing (Invite Link Only)
**Window:** May 29 – Jun 1 · ~8 hours
**Goal:** Justin and Nhi can pair via shared invite link.

- [ ] **4.1** `POST /api/space/invite` — create or reuse user's active `shared_space`, create `invites` row with random 8-char code, 48h expiry. Return code + link.
- [ ] **4.2** `POST /api/space/redeem` — validate code (not expired, not used, not self-issued), insert into `shared_space_members`, mark invite used. Reject if user already has active space (v1 constraint).
- [ ] **4.3** `POST /api/space/leave` — delete from `shared_space_members`. If space has 0 members, archive it.
- [ ] **4.4** Build `/partners` page:
  - If not in space: "Invite your partner" button → calls invite API → displays code + copyable link
  - If in space: shows partner's display name, button to leave space
- [ ] **4.5** Build `/invite/[code]` public route:
  - If not signed in: redirect to `/signup?invite=[code]` (or `/login?invite=[code]`)
  - If signed in: validate code via redeem API, show success, redirect to `/partners`
- [ ] **4.6** Update sign-up flow (Phase 1.6) to auto-redeem invite if `?invite=` param present after profile creation
- [ ] **4.7** Verify with Justin and Nhi: both create accounts, Justin generates link, sends to Nhi, Nhi joins. Both see each other in `/partners`.

**Phase 4 Checkpoint:** Justin and Nhi paired. Partner relationship visible in app.

---

## Phase 5 — Partner Feed + Add to Mine + Atomic Co-Log
**Window:** Jun 2–8 · ~14 hours
**Goal:** Both partners can see each other's logs and create shared meals.

### Partner Feed

- [ ] **5.1** `GET /api/partner/feed?date={d}` — return partner's `food_log_entries` for date, grouped by meal category, with display name
- [ ] **5.2** Build `/partners/feed` page
  - Same date nav as diary
  - Four meal sections showing partner's entries (read-only)
  - "Add to Mine" button on each non-co-logged entry
  - Co-logged entries show "Shared with you" tag

### Add to Mine

- [ ] **5.3** `POST /api/partner/add-meal` — accept `{ entryId, mealCategory?, quantity? }`. Read partner's entry, validate it belongs to a same-space user, create new entry in current user's diary with `source = 'shared'`.
- [ ] **5.4** `AddToMineModal` component: shows partner entry, lets user adjust quantity + category, submit

### Co-Log

- [ ] **5.5** `POST /api/diary/co-log` — accept `{ entry, partnerQuantity, ownQuantity }`. In a Supabase transaction, insert two `food_log_entries` rows with shared `shared_meal_id` UUID. Set `source = 'co_log'`, `shared_with_user_id` = the other user.
- [ ] **5.6** Add `CoLogToggle` component to `/diary/add`:
  - Toggle visible only if user is in a shared space
  - When enabled, adds split slider (default 0.5/0.5)
  - Form submit calls co-log API instead of regular diary API
- [ ] **5.7** Update `FoodEntryRow` to show "Shared with [partner name]" tag when `shared_meal_id` is set
- [ ] **5.8** End-to-end test: Justin co-logs a 60/40 meal with Nhi. Both diaries reflect the right portions. Tags display correctly.

**Phase 5 Checkpoint:** Justin and Nhi can see each other's logs, copy partner meals, and atomically co-log shared meals.

---

## Phase 6 — Photo Capture + AI Nutrition Estimate
**Window:** Jun 9–14 · ~16 hours
**Goal:** Photo + optional description → editable AI nutrition estimate.

- [ ] **6.1** `npm install @anthropic-ai/sdk`
- [ ] **6.2** Build `PhotoCapture` component:
  - Camera/file input (use `<input type="file" accept="image/*" capture="environment" />` for mobile camera)
  - Preview thumbnail
  - Upload to Supabase Storage `meal-photos/{user_id}/{YYYY-MM-DD}/{uuid}.jpg`
  - Return public URL
- [ ] **6.3** Add Photo tab to `/diary/add`:
  - PhotoCapture above an optional description textarea ("Describe what's in it (ingredients, sauces, sides) — optional but improves accuracy")
  - "Estimate Nutrition" button (disabled until photo present)
- [ ] **6.4** `POST /api/food/photo-estimate` route handler:
  - Body: `{ photoUrl, description? }`
  - Server-side rate limit: max 20 requests per user per day (track in-memory or Redis or a simple `ai_estimate_log` table)
  - Cache by photo SHA-256 hash for 24h to avoid double-billing
  - Call Anthropic API with vision input + the prompt from SPECIFICATIONS.md §5.5
  - Parse JSON response (fail gracefully if not valid JSON)
  - Return: `{ food_name, estimated_serving, confidence, calories, protein_g, ..., items_identified, notes }`
- [ ] **6.5** Build `AIEstimateForm` component:
  - All fields pre-filled from API response, fully editable
  - Prominent badge: "AI estimate — review before saving" (warning color if confidence is low)
  - Show items identified + notes from API
  - Confirm button → save as `food_log_entry` with `source = 'ai_estimate'`, `photo_url`, `photo_description`, `ai_confidence`
- [ ] **6.6** Error handling: if API fails or returns `{ error: "unable_to_estimate" }`, show friendly message and route user to manual entry with photo + description preserved
- [ ] **6.7** Test with 5 real meals each (Justin and Nhi). Calibrate prompt if confidence calibration feels off. Document accuracy observations for v1.1 improvements.

**Phase 6 Checkpoint:** Photo nutrition estimate works. Confidence levels are honest. Editable form catches errors. Cost is trackable in Anthropic console.

---

## Phase 7 — Dashboard, Streak, Dogfood, Ship
**Window:** Jun 15–20 · ~18 hours
**Goal:** Polished daily home screen. Both users using the app daily. Bugs fixed.

### Dashboard

- [ ] **7.1** Build `/dashboard` page (simple stacked layout, not bento)
  - Hero card (use `.glass-panel`): today's calorie ring + macro breakdown vs goals
  - Streak text: "🔥 7 day streak · 5 day shared streak"
  - Quick "Log Meal" button → `/diary/add`
  - If paired: small partner card showing "Nhi: 1,250 / 1,800 kcal today" with link to feed
  - If not paired: "Invite your partner" CTA card
- [ ] **7.2** `GET /api/streak` route handler
  - Calculate personal streak (consecutive days with at least one entry, ending today; today doesn't break)
  - Calculate shared streak (consecutive days where BOTH users have entries)
  - Return `{ personal: number, shared: number }`

### Favorites

- [ ] **7.3** `GET / POST /api/favorites` and `DELETE /api/favorites/[id]`
- [ ] **7.4** Star toggle on `FoodEntryRow` and food search results
- [ ] **7.5** Favorites tab on `/diary/add`

### Polish (functional only)

- [ ] **7.6** Loading states everywhere (skeleton or spinner)
- [ ] **7.7** Empty states: no entries today, no partner yet, no search results, no favorites
- [ ] **7.8** Toast notifications: meal logged, goals saved, partner joined, etc.
- [ ] **7.9** Top nav with mobile hamburger drawer (no separate bottom nav in MVP)
- [ ] **7.10** Public `/` landing page: simple hero with name, tagline, sign-up CTA, brief feature list. Mobile-friendly. Polish in v1.1.

### Dogfood + Ship

- [ ] **7.11** Justin and Nhi use the app daily for at least 4 days (Jun 15–18)
- [ ] **7.12** Bug list captured during dogfood, prioritized
- [ ] **7.13** Critical bugs fixed
- [ ] **7.14** README.md committed: setup, env vars, deploy instructions
- [ ] **7.15** Final Vercel production deploy on Jun 19
- [ ] **7.16** Confirm with Nhi: ready for Vietnam dogfood

**Phase 7 Checkpoint:** App is shippable. Justin and Nhi are using it daily. Bugs are documented. Ready to use for the entire 28-day Vietnam trip.

---

## During Vietnam (Jun 25 – Jul 22): Real-World Dogfood

This is not a build phase — it's data collection. Track in a notes file:
- Photo AI accuracy hits and misses (which cuisines work, which don't)
- Friction points in adding food (too slow? wrong defaults?)
- Co-log usage patterns (do you use it as much as expected?)
- Bugs encountered
- Feature ideas that come up naturally

This list becomes the v1.1 backlog.

---

## Post-Vietnam: v1.1 Polish Pass (Late July – August)

Re-prioritize based on Vietnam dogfood notes. Likely v1.1 work:

- [ ] **F.1** Design polish pass: bento grid layouts, sidebar, full glassmorphism, custom slider styling
- [ ] **F.2** Streak tree visualization (SVG component with stages and apples)
- [ ] **F.3** Mobile bottom nav
- [ ] **F.4** Custom meals (shared between space members)
- [ ] **F.5** Edit-in-place on entries
- [ ] **F.6** Reports / weight trajectory / charts
- [ ] **F.7** Username search for pairing
- [ ] **F.8** Dark mode
- [ ] **F.9** Photo AI calibration based on Vietnam observations
- [ ] **F.10** Sync edit/delete on co-logged meals
- [ ] **F.11** AI Smart Adjust panel
- [ ] **F.12** N>2 shared spaces (relax v1 constraint)
- [ ] **F.13** Service worker offline mode
- [ ] **F.14** Mutual Milestones / rewards
- [ ] **F.15** Push notifications
- [ ] **F.16** Water tracking
- [ ] **F.17** Exercise / activity logging
- [ ] **F.18** Weight & body measurements
- [ ] **F.19** Recipe URL import

---

## Decision Log

If anything in this plan needs to change mid-build, append to this section with date + decision + reason. Don't silently drift.

| Date | Change | Reason |
|------|--------|--------|
| 2026-05-08 | v2.0 spec freeze | 6 decisions made; baseline for build |
| 2026-05-09 | Phase 1.5 / 1.6 built in opposite order from spec | Can't test login email/password without an email account first |
| 2026-05-09 | Email confirmation disabled in Supabase for MVP | Email/password is a first-class path equal to Google, not a fallback. Re-enable in v1.1 if app opens beyond Justin and Nhi |
| 2026-05-09 | Sign-out helper built in Phase 1.5 instead of waiting for 1.10 top nav | Needed to test auth state transitions without manual cookie clearing |
| 2026-05-09 | profiles RLS pulled forward from Phase 2 to unblock Phase 1.7 onboarding | Server-side profile reads in OAuth callback and `/onboarding/profile` were silently returning null because RLS was on with zero policies. Own-row SELECT/UPDATE policies added now; same-space policy stays in Phase 2.4 (depends on `shared_space_members` from 2.1). |
| | | |
