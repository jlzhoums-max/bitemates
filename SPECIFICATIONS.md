# BiteMates — Couples Nutrition Tracker

## Specifications Document

**Version:** 2.0 (post-restart reconciliation)
**Last Updated:** May 8, 2026
**Tagline:** "Your Shared Sanctuary for Nutrition"
**MVP Ship Target:** June 20, 2026 (pre-Vietnam dogfood)
**Build Window:** ~6.5 weeks, ~120 hours of after-work time

---

## 0. MVP Decision Record (Pinned)

This v2.0 supersedes v1.0 (March 23, 2026). Six decisions made on May 8, 2026 reshape the build:

| # | Decision | Choice | Why |
|---|----------|--------|-----|
| 1 | Photo nutrition scanning | AI estimate with editable result + "estimate" badge, in MVP | Differentiation; honesty bar met via user override of result |
| 2 | Ship deadline | June 20, 2026 | Pre-Vietnam; the trip stress-tests the app |
| 3 | Half-and-half meals | True atomic co-log (one entry → both diaries linked by `shared_meal_id`) | Matches summer + Vietnam co-located use case |
| 4 | Data model | `shared_spaces` with N members, enforced 2 in v1 | 30 min today saves multi-day migration later |
| 5 | Nutrition fields stored | Full USDA payload as JSONB + 10 curated columns displayed | Storage cost is zero, future features unlock free |
| 6 | Build strategy | Trim design polish for MVP; v1.1 polish pass in August | Functional June 20 > pixel-perfect July 25 |

### What's IN MVP (June 20)

Auth (email + Google OAuth), PWA scaffold (manifest + installable, no offline), schema with shared_spaces and full nutrition, diary with USDA + Open Food Facts search, manual entry, barcode scan, partner pairing via invite link, partner feed, Add to Mine, atomic co-log for shared meals, photo capture + AI nutrition estimate (editable, badged), daily totals view, simple dashboard.

### What's OUT of MVP (deferred to v1.1, August)

Streak trees and tree visualization (show streak number only in MVP), reports / weight trajectory / charts, custom meals, username search for pairing (invite link is enough), AI Smart Adjust, Mutual Milestones widget, full bento grid layout, pixel-perfect glassmorphism on every screen, sidebar partner card, mobile bottom nav (use top nav with hamburger drawer), Recent Meals widget on dashboard, edit-in-place on entries (delete + re-add for MVP).

### Design polish trim — what "trimmed" means concretely

Keep: color tokens, Manrope, rounded-3xl/2.5rem cards, glass-panel utility for ONE hero element per page (e.g., daily total), botanical sage-green palette, no 1px borders.

Skip in MVP: pixel-perfect bento grid layouts, glassmorphism on every card, custom SVG tree art, sidebar partner card with avatar/progress, Mutual Milestones decorative card, complex slider styling. Use clean stacked layouts with generous whitespace.

---

## 1. Product Overview

### 1.1 What it is

BiteMates is a couples-focused nutrition tracking PWA. Two partners independently track daily food intake and share visibility, meals, and motivation through a connected experience. Built on a botanical sage-green design system (the "Shared Sanctuary").

### 1.2 Core value proposition

Traditional calorie trackers are solo tools. BiteMates makes nutrition a shared lifestyle: see each other's progress, share or co-log meals, photo-scan unfamiliar foods for AI nutrition estimates, and gently hold each other accountable.

### 1.3 Primary users (real, named)

Justin and Nhi. Long-distance most of 2026–2028 (Nhi at ECU dental school in Greenville, NC starting Aug 2026; Justin in Mississippi until Aug 2028). Co-located: summer 2026 (May–Aug), Vietnam trip (Jun 25–Jul 22, 2026), holidays. The product must work for both: async partner visibility when apart, atomic co-log when together.

---

## 2. Tech Stack

| Layer | Technology | Notes |
|-------|-----------|-------|
| Framework | Next.js 14+ (App Router) | File routing, SSR, API routes, Vercel-native |
| Language | TypeScript (strict) | Catch errors early |
| Styling | Tailwind CSS | Design tokens map to Tailwind config |
| Database | Supabase (PostgreSQL) | Postgres + Auth + RLS + Storage |
| Auth | Supabase Auth | Email/password + Google OAuth from Phase 1 |
| File Storage | Supabase Storage | Meal photos in `meal-photos` bucket |
| Food Data (Primary) | USDA FoodData Central | Free with API key, research-grade. Endpoint: `https://api.nal.usda.gov/fdc/v1/foods/search` |
| Food Data (Fallback) | Open Food Facts | Free, no key, 2.8M+ products with barcodes |
| Barcode Scanning | html5-qrcode (client) + Open Food Facts | EAN-13, UPC-A, EAN-8 |
| AI Photo Nutrition | Anthropic API (claude-sonnet-4-6 or claude-opus-4-7) | Vision input + JSON output, ~$0.005–0.02 per scan |
| PWA | next-pwa or manual manifest | Installable on mobile, no offline mode in MVP |
| Deployment | Vercel | One-click Next.js deploy |
| Font | Manrope (Google Fonts) | Geometric humanist |
| Icons | Material Symbols Outlined | Already in mockup |

### 2.1 Cost estimate (Justin + Nhi only, monthly)

- Supabase free tier: $0 (well within 500MB DB + 1GB storage + 50k monthly active users)
- Vercel hobby tier: $0
- USDA API: $0 (free with key)
- Open Food Facts: $0 (no key required)
- Anthropic API for photo scans: ~$0.60–$2.40/month at 4 scans/day combined. Negligible.
- Domain (optional): ~$12/year if registering bitemates.app

**Total ongoing: <$3/month.** Scales to ~$10–30/month if user count grows to a few hundred.

---

## 3. Design System

Full system in DESIGN.md. MVP uses tokens + Manrope + simple stacked layouts. Pixel-perfect bento and full glassmorphism deferred to v1.1.

### 3.1 Color tokens (Tailwind)

```javascript
colors: {
  "surface":                  "#ebfeee",
  "surface-container-lowest": "#ffffff",
  "surface-bright":           "#ebfeee",
  "surface-container-high":   "#cff0d7",
  "surface-container":        "#d7f5de",
  "surface-container-low":    "#e0fae5",
  "surface-container-highest":"#c5ecd0",
  "surface-variant":          "#c5ecd0",
  "surface-dim":              "#bde3c7",
  "surface-tint":             "#516356",
  "on-surface":               "#173926",
  "on-surface-variant":       "#446650",
  "on-background":            "#173926",
  "background":               "#ebfeee",
  "primary":                  "#516356",
  "primary-dim":              "#45574a",
  "primary-container":        "#d3e8d7",
  "on-primary":               "#eafeed",
  "on-primary-container":     "#445649",
  "secondary":                "#4f6455",
  "secondary-container":      "#d1e8d5",
  "on-secondary-container":   "#425648",
  "tertiary":                 "#556536",
  "tertiary-container":       "#ebfec1",
  "on-tertiary-container":    "#536334",
  "error":                    "#a83836",
  "error-container":          "#fa746f",
  "outline":                  "#60836b",
  "outline-variant":          "#96bba0",
}
```

(Full token set including `-fixed`, `-fixed-dim`, `-fixed-variant`, `inverse-*` variants is in v1.0 spec; reuse it directly.)

### 3.2 Typography

```javascript
fontFamily: {
  "headline": ["Manrope"],
  "body":     ["Manrope"],
  "label":    ["Manrope"],
}
```

Display (text-5xl, font-extrabold) for daily calorie totals and page titles. Headline (text-2xl/3xl, font-bold) for section headings. Title (text-xl, font-bold) for cards. Body (text-sm/base) for lists. Label (text-xs, font-bold) for micro-data.

### 3.3 MVP design rules (trimmed)

1. No 1px solid borders. Use surface token shifts.
2. No pure black/grey shadows. Tinted on-surface (#173926) at 4–8% opacity, blur 24–40px.
3. No divider lines between list items. 1rem vertical whitespace.
4. Glassmorphism: ONE hero element per page maximum in MVP (e.g., daily total card). `.glass-panel` utility = `backdrop-blur(12px) + rgba(255,255,255,0.4)`.
5. Pill buttons (rounded-full) for primary actions.
6. Cards rounded-3xl or rounded-[2rem]. Skip the 2.5rem-everywhere rule for MVP.
7. Interactive rows: `surface` → `surface-container-low` on hover/tap.

---

## 4. Information Architecture & Routes

### 4.1 Public

| Page | Route | Purpose |
|------|-------|---------|
| Landing | `/` | Marketing + sign-up CTA |
| Login | `/login` | Email/password + Google OAuth |
| Sign Up | `/signup` | Create account, optional invite code prefill |
| Accept Invite | `/invite/[code]` | Public link → sign-up/login → join shared space |

### 4.2 Authenticated

| Page | Route | Purpose |
|------|-------|---------|
| Dashboard | `/dashboard` | Today's totals, streak number, partner snippet |
| Diary | `/diary` | Today's full log, date nav, Add Food button |
| Add Food | `/diary/add` | Tabs: Search, Barcode, Photo, Manual, Favorites |
| Goals | `/goals` | Calorie target + macro % sliders |
| Partner Feed | `/partners/feed` | Partner's log, Add to Mine, Co-log indicator |
| Partners | `/partners` | Pair via invite link, manage space |
| Settings | `/settings` | Profile, sign out, leave space |

---

## 5. Feature Specifications

### 5.1 Authentication

**Sign-up flow:**
1. Email + password OR "Continue with Google" button
2. If Google OAuth: Supabase handles redirect, returns to `/onboarding/profile` to set username + display name
3. If email: form for email, password, display name, username
4. Supabase Auth creates auth user; trigger creates `profiles` row
5. If sign-up came from invite link: auto-join shared space
6. Otherwise redirect to `/dashboard`

**Username rules:** 3–20 chars, lowercase alphanumeric + underscore, unique. Validated client-side and via DB CHECK constraint.

**Google OAuth setup:** Enable Google provider in Supabase dashboard, paste Google OAuth client ID + secret, redirect URL = `{NEXT_PUBLIC_APP_URL}/auth/callback`. Single button on login page calls `supabase.auth.signInWithOAuth({ provider: 'google' })`.

### 5.2 Shared Spaces (Partner Pairing)

**Data model:** `shared_spaces` table + `shared_space_members` join table. v1 enforces N=2 in application logic; DB allows N members for future flexibility.

**Pairing flow (invite link only in v1):**
1. User taps "Invite Partner" on `/partners`
2. App creates a `shared_spaces` row (if user isn't in one) and an `invites` row with 8-char code, 48h expiry
3. User shares the link `bitemates.app/invite/[CODE]`
4. Partner clicks link. If not signed in, sign-up flow includes invite code; on completion, joins the space. If signed in, one-tap join.
5. Both users now in the space. Partner feed becomes available.

**Constraints (application-enforced in v1):**
- One active space per user (will relax in v1.1)
- Maximum 2 members per space (will relax in v1.1 to N members)
- Either partner can leave from `/settings`. Their entries persist; the space is archived if both leave.

### 5.3 Goals (Per-User)

Each user independently configures:

| Setting | Default | Range |
|---------|---------|-------|
| Daily calorie target | 2000 | 1000–5000 kcal |
| Protein % | 30 | 5–60 |
| Carbs % | 45 | 5–70 |
| Fat % | 25 | 5–60 |

Validation: protein + carbs + fat = 100. Linked sliders in UI auto-balance.

Macro grams: protein_g = target × (protein_pct/100) ÷ 4, carbs_g = target × (carbs_pct/100) ÷ 4, fat_g = target × (fat_pct/100) ÷ 9.

### 5.4 Diary (Food Log)

**Meal categories:** Breakfast, Lunch, Dinner, Snacks. Fixed.

**Five ways to add a food (in MVP):**

1. **Search** — type a name, query USDA first, fall back to Open Food Facts if zero results. Normalize and display.
2. **Barcode** — html5-qrcode camera scanner. Decoded code → `/api/food/barcode/[code]` → Open Food Facts.
3. **Photo + AI estimate** — capture photo, optional description, send to Anthropic API, get nutrition estimate, show editable form with "AI estimate" badge. User confirms or edits before save.
4. **Manual** — fill fields by hand. Required: name, calories. Optional: macros, serving.
5. **Favorites** — quick re-log of starred items.

**MVP simplification:** Edit-in-place is OUT for v1. To change an entry, delete and re-add. Saves ~3 hrs of build time.

### 5.5 Photo Nutrition Estimate (AI)

**UX flow:**
1. User taps "Photo" tab on Add Food
2. Camera opens (or file picker on desktop). User captures or uploads image.
3. Optional text input: "Describe what's in it (ingredients, sauces, sides)"
4. User taps "Estimate"
5. Photo uploads to Supabase Storage, returns public URL
6. POST to `/api/food/photo-estimate` with `{ photoUrl, description }`
7. Server calls Anthropic API (vision + JSON mode); response parsed
8. Loading state ~3–8 seconds
9. Result form pre-fills with: food name, serving size, calories, macros, fiber/sugar/sodium/sat fat/cholesterol, AI confidence (high/medium/low), items identified
10. Form is fully editable. "AI estimate" badge displays prominently. Confirm to save.

**Honest framing in UI:** Badge text reads "AI estimate — review before saving." If confidence is "low," badge turns warning color. Never claim "scientifically accurate."

**Anthropic prompt structure** (server-side):

```
You are a nutritionist analyzing a meal photo. Estimate calories and macros for the food shown.

Optional user description: {description or 'none provided'}

Return ONLY a JSON object:
{
  "food_name": "<short name>",
  "estimated_serving": "<e.g., 1 bowl, ~300g>",
  "confidence": "high" | "medium" | "low",
  "calories": <number>,
  "protein_g": <number>,
  "carbs_g": <number>,
  "fat_g": <number>,
  "fiber_g": <number or null>,
  "sugar_g": <number or null>,
  "sodium_mg": <number or null>,
  "saturated_fat_g": <number or null>,
  "cholesterol_mg": <number or null>,
  "items_identified": ["<item1>", "<item2>"],
  "notes": "<1-sentence note about accuracy or assumptions>"
}

Confidence rubric:
- high: clearly identifiable food, common preparation, description matches
- medium: identifiable but ambiguous portion or preparation
- low: unclear photo, unusual food, or description conflicts with image

If you cannot estimate, return: {"error": "unable_to_estimate", "reason": "<why>"}
```

**Cost control:** Rate limit per user to 20 photo estimates per day (more than enough for normal use). Cache by image hash for 24 hours so re-uploading the same photo doesn't re-bill.

### 5.6 Atomic Co-Log (Shared Meals)

**UX flow:**
1. User on `/diary/add` taps "Co-log with partner" toggle (only visible if paired)
2. Adds food normally (search, barcode, photo, manual)
3. Default split: 0.5 / 0.5. Adjustable: e.g., 0.6 / 0.4 if Justin ate more
4. Tap save → server creates TWO `food_log_entries` rows in a transaction:
   - One for current user with `serving_quantity = 0.6`, `source = 'co_log'`, `shared_meal_id = <new uuid>`, `shared_with_user_id = <partner>`
   - One for partner with `serving_quantity = 0.4`, same `shared_meal_id`, `shared_with_user_id = <current user>`
5. Both diaries update. Both entries display a "Shared with [partner]" tag.

**Edit/delete behavior in v1:**
- Delete: each user can independently delete their own entry. Original initiator's deletion does NOT cascade to partner's entry.
- Edit: out of MVP scope. To change a co-logged meal, both users delete and re-create.

**v1.1 enhancements (deferred):** Synchronized edit (one user updates serving size, partner sees a notification to confirm/decline). Atomic delete option.

### 5.7 Partner Feed + Add to Mine

**Partner feed (`/partners/feed`):**
- Shows partner's `food_log_entries` for selected date, grouped by meal category
- Each entry: food name, calories, macros, photo (if any), source badge
- Co-logged entries show "Shared with you" tag
- Date navigation (today, yesterday, etc.)

**Add to Mine:**
- Button on each non-co-logged partner entry
- Opens modal: adjust quantity, choose meal category (defaults to partner's category)
- POST to `/api/partner/add-meal` → creates a copy in current user's diary with `source = 'shared'`
- Independent row; editing or deleting the original does not affect the copy

### 5.8 Streak (Number Only in MVP)

A day is "tracked" if the user has at least one `food_log_entry` for that calendar date.

- **Personal streak:** Consecutive tracked days ending today (today's streak doesn't break until day ends with no entries)
- **Shared streak:** Consecutive days where BOTH partners have at least one entry

Calculated on-the-fly from `food_log_entries`, no separate counter. Display: simple text "🔥 7 day streak · 5 day shared streak". Tree visualization deferred to v1.1.

---

## 6. Data Model

### 6.1 Schema

```sql
-- ============================================================
-- PROFILES
-- ============================================================
CREATE TABLE profiles (
  id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username        TEXT UNIQUE NOT NULL CHECK (username ~ '^[a-z0-9_]{3,20}$'),
  display_name    TEXT NOT NULL,
  avatar_url      TEXT,
  calorie_target  INTEGER NOT NULL DEFAULT 2000 CHECK (calorie_target BETWEEN 1000 AND 5000),
  protein_pct     INTEGER NOT NULL DEFAULT 30 CHECK (protein_pct BETWEEN 5 AND 60),
  carbs_pct       INTEGER NOT NULL DEFAULT 45 CHECK (carbs_pct BETWEEN 5 AND 70),
  fat_pct         INTEGER NOT NULL DEFAULT 25 CHECK (fat_pct BETWEEN 5 AND 60),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT macro_sum CHECK (protein_pct + carbs_pct + fat_pct = 100)
);

-- ============================================================
-- SHARED SPACES (N-member; v1 app-enforced N=2)
-- ============================================================
CREATE TABLE shared_spaces (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT,
  status      TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived')),
  created_by  UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE shared_space_members (
  space_id    UUID NOT NULL REFERENCES shared_spaces(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  joined_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  role        TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'member')),
  PRIMARY KEY (space_id, user_id)
);

-- ============================================================
-- INVITES (link to a shared space)
-- ============================================================
CREATE TABLE invites (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code        TEXT UNIQUE NOT NULL,
  space_id    UUID NOT NULL REFERENCES shared_spaces(id) ON DELETE CASCADE,
  created_by  UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  expires_at  TIMESTAMPTZ NOT NULL,
  used_by     UUID REFERENCES profiles(id),
  used_at     TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- FOOD LOG ENTRIES (the diary)
-- ============================================================
CREATE TABLE food_log_entries (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  date                DATE NOT NULL DEFAULT CURRENT_DATE,
  meal_category       TEXT NOT NULL CHECK (meal_category IN ('breakfast','lunch','dinner','snacks')),
  food_name           TEXT NOT NULL,
  serving_size        TEXT,
  serving_quantity    NUMERIC NOT NULL DEFAULT 1 CHECK (serving_quantity > 0),

  -- Curated displayed nutrition (10 fields, always considered)
  calories            NUMERIC NOT NULL DEFAULT 0,
  protein_g           NUMERIC NOT NULL DEFAULT 0,
  carbs_g             NUMERIC NOT NULL DEFAULT 0,
  fat_g               NUMERIC NOT NULL DEFAULT 0,
  fiber_g             NUMERIC,
  sugar_g             NUMERIC,
  sodium_mg           NUMERIC,
  saturated_fat_g     NUMERIC,
  cholesterol_mg      NUMERIC,

  -- Full nutrition payload (USDA returns 30+ nutrients; preserve)
  nutrition_full      JSONB,

  -- Source tracking
  source              TEXT NOT NULL DEFAULT 'manual'
    CHECK (source IN ('usda','openfoodfacts','manual','barcode','shared','co_log','ai_estimate')),
  source_food_id      TEXT,

  -- Photo + AI
  photo_url           TEXT,
  photo_description   TEXT,
  ai_confidence       TEXT CHECK (ai_confidence IN ('high','medium','low')),

  -- Co-log linkage
  shared_meal_id      UUID,
  shared_with_user_id UUID REFERENCES profiles(id),

  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- FAVORITES
-- ============================================================
CREATE TABLE favorites (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  food_name       TEXT NOT NULL,
  serving_size    TEXT,
  calories        NUMERIC NOT NULL,
  protein_g       NUMERIC NOT NULL DEFAULT 0,
  carbs_g         NUMERIC NOT NULL DEFAULT 0,
  fat_g           NUMERIC NOT NULL DEFAULT 0,
  fiber_g         NUMERIC,
  sugar_g         NUMERIC,
  sodium_mg       NUMERIC,
  saturated_fat_g NUMERIC,
  cholesterol_mg  NUMERIC,
  nutrition_full  JSONB,
  source          TEXT,
  source_food_id  TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX idx_food_log_user_date ON food_log_entries(user_id, date);
CREATE INDEX idx_food_log_shared_meal ON food_log_entries(shared_meal_id) WHERE shared_meal_id IS NOT NULL;
CREATE INDEX idx_space_members_user ON shared_space_members(user_id);
CREATE INDEX idx_space_members_space ON shared_space_members(space_id);
CREATE INDEX idx_invites_code ON invites(code) WHERE used_by IS NULL;
CREATE INDEX idx_profiles_username ON profiles(username);
CREATE INDEX idx_favorites_user ON favorites(user_id);
```

### 6.2 Helper Functions

```sql
-- Get the user's current active shared space (v1: 1 per user)
CREATE OR REPLACE FUNCTION get_user_space(uid UUID)
RETURNS UUID AS $$
  SELECT m.space_id
  FROM shared_space_members m
  JOIN shared_spaces s ON s.id = m.space_id
  WHERE m.user_id = uid AND s.status = 'active'
  LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER;

-- Get the user's partner IDs in their current space (v1 returns 1, v2 may return many)
CREATE OR REPLACE FUNCTION get_partner_ids(uid UUID)
RETURNS SETOF UUID AS $$
  SELECT user_id FROM shared_space_members
  WHERE user_id != uid
    AND space_id = get_user_space(uid);
$$ LANGUAGE sql SECURITY DEFINER;

-- Auto-create profile on auth.users insert
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, username, display_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || substring(NEW.id::text, 1, 8)),
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'full_name', NEW.email)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

(Trigger uses fallbacks because Google OAuth users won't have `username` in metadata — they fill it in `/onboarding/profile` after first sign-in.)

### 6.3 Row Level Security (high-level)

| Table | SELECT | INSERT | UPDATE | DELETE |
|-------|--------|--------|--------|--------|
| profiles | Own row + space members | Auto (trigger) | Own only | None |
| shared_spaces | Where user is a member | App-controlled | Status only | None |
| shared_space_members | Spaces user is in | App-controlled | None | Self only (leave) |
| invites | Created by user OR matching code on redeem | Own only | Redeem (app) | None |
| food_log_entries | Own + space members | Own only (or co-log app-controlled) | Own only | Own only |
| favorites | Own only | Own | Own | Own |

Detailed RLS SQL written during Phase 2.

### 6.4 Supabase Storage

Bucket `meal-photos`, public read, authenticated write. Path convention: `{user_id}/{date}/{uuid}.jpg`. Auto-resize on upload via Supabase image transformations.

---

## 7. API Routes (Next.js Route Handlers)

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/auth/callback` | GET | Supabase OAuth callback handler |
| `/api/profile` | GET / PUT | Read/update own profile |
| `/api/goals` | GET / PUT | Read/update calorie + macro % |
| `/api/food/search?q={q}` | GET | USDA primary, OFF fallback. Normalized results. |
| `/api/food/barcode/[code]` | GET | OFF lookup; normalized |
| `/api/food/photo-estimate` | POST | `{ photoUrl, description? }` → AI nutrition estimate JSON |
| `/api/diary?date={d}` | GET | Today's (or any date) entries grouped by meal |
| `/api/diary` | POST | Create entry |
| `/api/diary/[id]` | DELETE | Delete entry (own only) |
| `/api/diary/co-log` | POST | Atomic dual-insert with `shared_meal_id` |
| `/api/space/invite` | POST | Generate invite code (creates space if user has none) |
| `/api/space/redeem` | POST | Redeem code, join space |
| `/api/space/leave` | POST | Leave space (archive if both members gone) |
| `/api/partner/feed?date={d}` | GET | Partner's entries for a date |
| `/api/partner/add-meal` | POST | Copy partner entry to own diary |
| `/api/streak` | GET | Returns `{ personal: number, shared: number }` |
| `/api/favorites` | GET / POST | List / add |
| `/api/favorites/[id]` | DELETE | Remove |

**Normalized food result schema:**

```typescript
interface FoodSearchResult {
  name: string;
  brand?: string;
  serving_size: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g?: number;
  sugar_g?: number;
  sodium_mg?: number;
  saturated_fat_g?: number;
  cholesterol_mg?: number;
  nutrition_full?: Record<string, unknown>;
  source: 'usda' | 'openfoodfacts';
  source_food_id: string;
}
```

USDA nutrient IDs to capture for `nutrition_full`: 1008 (energy), 1003 (protein), 1004 (fat), 1005 (carbs), 1079 (fiber), 2000 (sugar), 1093 (sodium), 1258 (sat fat), 1253 (cholesterol), plus any others returned. Store the entire nutrient array.

---

## 8. Component Architecture (MVP, simplified)

| Component | Purpose |
|-----------|---------|
| `TopNav` | Logo, page links, sign-out, mobile hamburger |
| `Page` | Wrapper with consistent padding + max-width |
| `Card` | Rounded container with surface-container background |
| `GlassPanel` | Hero element only — daily total card |
| `Button` | Primary (pill, gradient), secondary, danger |
| `Input` | Text/number/email with bottom-only focus state |
| `MacroSliders` | Three linked sliders, sum=100 |
| `CalorieRing` | SVG ring, consumed vs target |
| `MealSection` | Category header + entries + subtotal |
| `FoodEntryRow` | Name, kcal, macros, delete button |
| `FoodSearch` | Debounced search input + result list |
| `BarcodeScanner` | html5-qrcode wrapper |
| `PhotoCapture` | Camera/file input + preview |
| `AIEstimateForm` | Editable form with "AI estimate" badge |
| `AddToMineModal` | Quantity + category for partner entry copy |
| `CoLogToggle` | Toggle + split slider in Add Food |
| `InvitePartnerCard` | Shows code + copyable link |

Components NOT in MVP: TreeVisual, StreakDisplay, BottomNav (mobile), Sidebar, Mutual Milestones, AI Smart Adjust panel, Reports charts.

---

## 9. Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# USDA FoodData Central
USDA_API_KEY=

# Anthropic API (photo nutrition estimate)
ANTHROPIC_API_KEY=

# App
NEXT_PUBLIC_APP_URL=https://bitemates.vercel.app
```

Open Food Facts requires no key. Google OAuth credentials live in Supabase dashboard, not env vars.

---

## 10. Non-Functional Requirements

| Requirement | Target |
|-------------|--------|
| Performance | First Contentful Paint <1.5s on 4G; Lighthouse >85 (>90 in v1.1) |
| Responsiveness | Mobile (360px+), tablet, desktop (1440px+) |
| Accessibility | WCAG 2.1 AA on critical paths (login, add food, diary). Full audit in v1.1 |
| Browser support | Chrome, Safari, Firefox, Edge (latest 2 versions). Camera APIs require HTTPS |
| Privacy | All entries private to user + space members. RLS at DB level |
| PWA | Installable on mobile (manifest + icons + service worker stub). Offline mode in v2 |
| Photo storage | Public-read URLs from Supabase Storage. User-only write |
| AI cost ceiling | Per-user rate limit: 20 photo estimates/day |

---

## 11. Out of Scope (MVP) — Reaffirmed

These are explicitly deferred. Architecture should not prevent their addition.

- Streak tree visualization (number only in MVP)
- Reports / weight trajectory / charts
- Custom meals (shared between space members)
- Username-based pairing search (invite link only in v1)
- AI Smart Adjust (recommendations based on history)
- Mutual Milestones / rewards
- Edit-in-place on entries (delete + re-add in MVP)
- Sidebar with partner card
- Mobile bottom nav (top nav with hamburger drawer in MVP)
- Recent Meals widget on dashboard
- Dark mode
- Push notifications
- Water tracking
- Exercise / activity logging
- Weight & body measurements
- Recipe URL import
- N>2 shared spaces (data model supports it; UI/app logic enforces 2 in v1)
- Synchronized edit/delete on co-logged meals
- Offline mode

---

## 12. References

- DESIGN.md — full design system
- TODO.md — phased build plan with dates
- code.html — visual reference (defer pixel-perfect implementation to v1.1)
- screen.png — reference mockup of Goals page
