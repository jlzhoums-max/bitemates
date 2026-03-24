# BiteMates — Couples Calorie & Macro Tracker

## Specifications Document

**Version:** 1.0
**Last Updated:** March 23, 2026
**App Name:** BiteMates
**Tagline:** "Your Shared Sanctuary for Nutrition"

---

## 1. Product Overview

### 1.1 What Is BiteMates?

BiteMates is a couples-focused calorie and macro tracking web application. It allows two partners to independently track their daily food intake while sharing visibility, meals, and motivation through a connected experience. The design language follows a botanical, editorial aesthetic — a "Shared Sanctuary" — that replaces the clinical feel of traditional fitness apps with a calm, breathable interface rooted in sage greens and soft glassmorphism.

### 1.2 Core Value Proposition

Traditional calorie trackers are solitary tools. BiteMates makes nutrition a shared lifestyle by letting couples see each other's progress, share custom meals, grow a visual streak together (represented by a living tree), and gently hold each other accountable — all within an interface that feels like a wellness magazine, not a spreadsheet.

### 1.3 Target Users

Couples (romantic partners, accountability partners, or housemates) who want to track calories and macros together. The app assumes users have limited technical background and prioritizes simplicity over power-user features.

---

## 2. Tech Stack

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| **Framework** | Next.js 14+ (App Router) | File-based routing, SSR/SSG flexibility, API routes built-in, excellent Vercel integration. Beginner-friendly with clear conventions. |
| **Styling** | Tailwind CSS | Matches the existing design system. Utility-first approach avoids context-switching. Design tokens from DESIGN.md map directly to Tailwind config. |
| **Language** | TypeScript | Catches bugs early, improves autocomplete, scales well. Strict mode recommended. |
| **Database** | Supabase (PostgreSQL) | Managed Postgres with built-in Auth, Row Level Security, and real-time subscriptions for partner syncing. |
| **Auth** | Supabase Auth | Email/password sign-up. Each user gets a unique username for partner pairing. |
| **Food Data API (Primary)** | USDA FoodData Central | Free, no API key for basic use, research-grade US food data. Endpoint: `https://api.nal.usda.gov/fdc/v1/foods/search` |
| **Food Data API (Fallback)** | Open Food Facts | Free, crowd-sourced, 2.8M+ products, barcode lookup. Endpoint: `https://world.openfoodfacts.org/api/v2/` |
| **Barcode Scanning** | html5-qrcode (client-side) + Open Food Facts barcode API | Camera-based scanning runs entirely in the browser (free, MIT license). Decoded barcode looked up via Open Food Facts `GET /api/v2/product/{barcode}`. Zero cost. |
| **Deployment** | Vercel | One-click deploy from GitHub, automatic previews, zero-config for Next.js. Most beginner-friendly option. |
| **Font** | Manrope (Google Fonts) | Per design system — geometric yet humanist. |
| **Icons** | Material Symbols Outlined (Google Fonts) | Already used in the design mockup. |

---

## 3. Design System Reference

The full design system is defined in DESIGN.md and the reference implementation in stitch.zip (containing code.html and screen.png). All implementation MUST follow these rules.

### 3.1 Color Tokens (Tailwind Config)

All colors are defined as Tailwind `extend.colors` entries. The primary palette is botanical sage green:

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
  "primary-fixed":            "#d3e8d7",
  "primary-fixed-dim":        "#c5d9c9",
  "on-primary":               "#eafeed",
  "on-primary-container":     "#445649",
  "on-primary-fixed":         "#324337",
  "on-primary-fixed-variant": "#4e6053",
  "secondary":                "#4f6455",
  "secondary-dim":            "#435849",
  "secondary-container":      "#d1e8d5",
  "secondary-fixed":          "#d1e8d5",
  "secondary-fixed-dim":      "#c3dac8",
  "on-secondary":             "#e7ffeb",
  "on-secondary-container":   "#425648",
  "on-secondary-fixed":       "#304436",
  "on-secondary-fixed-variant":"#4c6052",
  "tertiary":                 "#556536",
  "tertiary-dim":             "#49582b",
  "tertiary-container":       "#ebfec1",
  "tertiary-fixed":           "#ebfec1",
  "tertiary-fixed-dim":       "#ddf0b4",
  "on-tertiary":              "#f0ffcd",
  "on-tertiary-container":    "#536334",
  "on-tertiary-fixed":        "#415024",
  "on-tertiary-fixed-variant":"#5e6e3e",
  "error":                    "#a83836",
  "error-dim":                "#67040d",
  "error-container":          "#fa746f",
  "on-error":                 "#fff7f6",
  "on-error-container":       "#6e0a12",
  "outline":                  "#60836b",
  "outline-variant":          "#96bba0",
  "inverse-surface":          "#031108",
  "inverse-on-surface":       "#8fa193",
  "inverse-primary":          "#eaffed",
}
```

### 3.2 Typography

```javascript
fontFamily: {
  "headline": ["Manrope"],
  "body":     ["Manrope"],
  "label":    ["Manrope"],
}
```

Scale usage:
- **Display (text-5xl, font-extrabold):** Daily calorie totals, page titles
- **Headline (text-2xl/3xl, font-bold):** Section headings like "Macro Balance", "Weight Trajectory"
- **Title (text-xl, font-bold):** Card titles, meal category names
- **Body (text-sm/base):** Meal entries, descriptions, nutrient details
- **Label (text-xs, font-bold):** Micro-data like grams, percentages, timestamps

### 3.3 Mandatory Design Rules

1. **No 1px solid borders.** Section boundaries defined solely through background color shifts between surface tokens (e.g., surface-container-low on surface background).
2. **No pure black or grey shadows.** All shadows tinted with on-surface (#173926) at 4-8% opacity, blur 24-40px.
3. **No divider lines between list items.** Use 1rem (spacing-4) vertical whitespace.
4. **Glassmorphism** for floating/overlay elements: `backdrop-blur-[12px]` + `rgba(255,255,255,0.4)` background. CSS class: `.glass-panel`.
5. **Tonal layering** over drop shadows: nest surface-container-highest inside surface-container-low for depth.
6. **High-pill buttons** (rounded-full) with subtle gradient from primary to primary-dim. No borders on primary buttons.
7. **Rounded containers** use `rounded-[2.5rem]` border-radius matching the bento grid in the mockup.
8. **Interactive rows** shift from surface to surface-container-low on hover/tap.
9. **Ghost borders** only if accessibility requires: outline-variant at 15% opacity.

### 3.4 Layout Structure

```
+--------------------------------------------------+
| Top Nav (fixed, h-20, bg-surface, backdrop-blur)  |
| Logo (left) - Nav Links (center) - Actions (R)    |
+----------+---------------------------------------+
| Sidebar  | Main Content Area                      |
| (w-72,   | (pt-28, pb-12, px-6, xl:pl-80)         |
| partner  |                                        |
| context, |  +----------------------------------+  |
| nav,     |  | Bento Grid (grid-cols-12)        |  |
| nudge    |  | gap-6, rounded-[2.5rem] cards    |  |
| CTA)     |  +----------------------------------+  |
|          |                                        |
| hidden   |                                        |
| below xl |                                        |
+----------+----------------------------------------+
| Bottom Nav (mobile only, md:hidden, h-20)         |
+---------------------------------------------------+
```

---

## 4. Information Architecture & Routes

### 4.1 Public Pages (Unauthenticated)

| Page | Route | Purpose |
|------|-------|---------|
| Landing | `/` | Marketing/hero page with sign-up CTA |
| Login | `/login` | Email + password login |
| Sign Up | `/signup` | Create account with unique username |
| Accept Invite | `/invite/[code]` | Partner accepts invite, creates or links account |

### 4.2 Authenticated Pages

| Page | Route | Purpose |
|------|-------|---------|
| Dashboard | `/dashboard` | Daily overview: calorie ring, macro summary, personal tree, shared tree, partner status card |
| Diary | `/diary` | Full daily food log with Breakfast, Lunch, Dinner, Snacks sections and running totals |
| Add Food | `/diary/add` | Search USDA/OFF, barcode scan, manual entry, favorites tab, custom meals tab |
| Goals | `/goals` | Set calorie target and macro ratios per person (slider UI from mockup) |
| Reports | `/reports` | Weekly/monthly charts for weight trajectory, consistency score, streaks over time |
| Partners | `/partners` | Manage pairing (search username or generate invite code), view partner diary |
| Partner Feed | `/partners/feed` | See partner's logged meals for today with "Add to Mine" button per entry |
| Settings | `/settings` | Profile editing, account management, unlink partner |

---

## 5. Feature Specifications

### 5.1 Authentication & User Accounts

**Sign Up Flow:**
1. User provides: email, password, display name, unique username.
2. Supabase Auth creates the auth user.
3. A database trigger creates a `profiles` row with username, display name, and default goal values.
4. User is redirected to `/dashboard`.

**Username Rules:**
- 3-20 characters, alphanumeric + underscores only.
- Case-insensitive uniqueness (stored lowercase).
- Validated client-side and enforced at database level with CHECK constraint.
- Used for partner pairing (search by username).

**Login:** Email + password via Supabase Auth. Session persisted via Supabase session cookie with middleware-based route protection.

**Password Reset:** Via Supabase Auth built-in email flow.

---

### 5.2 Couple Pairing

Two methods for connecting partners:

**Method A — Username Search:**
1. User navigates to `/partners` and types their partner's username.
2. System validates username exists and is not already paired.
3. A `pair_requests` row is created with status "pending".
4. Partner sees the incoming request on their `/partners` page.
5. Partner accepts: `couples` row created linking both users. Request status updated to "accepted".
6. Partner declines: request status set to "declined".

**Method B — Invite Code:**
1. User taps "Generate Invite Code" on `/partners`.
2. System generates a unique 8-character alphanumeric code stored in `invites` table with 48-hour expiry.
3. User shares the code or the link: `bitemates.app/invite/[CODE]`.
4. Recipient visits the link. If not logged in, redirected to sign-up/login with the invite code preserved in URL.
5. After authentication, the invite is validated (not expired, not used) and the couple is linked.

**Constraints:**
- A user can only be in ONE active couple at a time.
- The couples table enforces this via application logic (check before insert).
- Either partner can "unlink" from `/settings` which sets couple status to "archived". Individual data (logs, favorites) is preserved.
- After unlinking, users can pair with someone new.

---

### 5.3 Goal Setting (Per Person)

Each user independently configures their nutrition goals:

| Setting | Default | Range | Unit |
|---------|---------|-------|------|
| Daily Calorie Target | 2,000 | 1,000-5,000 | kcal |
| Protein Ratio | 30 | 5-60 | % |
| Carbohydrate Ratio | 45 | 5-70 | % |
| Fat Ratio | 25 | 5-60 | % |

**Validation Rule:** protein_pct + carbs_pct + fat_pct must always equal 100. The UI uses linked sliders (matching the mockup's Macro Balance section) that adjust proportionally when one slider moves.

**Macro Gram Auto-Calculation:**
- Protein grams = (calorie_target * protein_pct / 100) / 4
- Carb grams = (calorie_target * carbs_pct / 100) / 4
- Fat grams = (calorie_target * fat_pct / 100) / 9

**UI Reference:** The Goals page matches the mockup's glassmorphic "Macro Balance" panel with sliders, percentage labels, and gram sub-labels.

---

### 5.4 Meal Logging (Diary)

**Meal Categories:** Each day is divided into four fixed sections:
- Breakfast
- Lunch
- Dinner
- Snacks

Each section shows a running subtotal of calories. The top of the diary page shows the daily total vs. target with a visual ring/progress indicator.

**Adding a Food Item — Three Methods:**

**Method 1: Search (API Lookup)**
- User types a food name (e.g., "chicken breast").
- Frontend sends query to `/api/food/search?q=chicken+breast`.
- API route queries USDA FoodData Central first: `https://api.nal.usda.gov/fdc/v1/foods/search?query={q}&pageSize=10&api_key={USDA_API_KEY}`.
- Results are normalized and returned (food name, calories, protein, carbs, fat per 100g or per serving).
- If USDA returns 0 results, the API route automatically falls back to Open Food Facts: `https://world.openfoodfacts.org/cgi/search.pl?search_terms={q}&json=1&page_size=10`.
- User selects a result, adjusts serving size/quantity, and confirms.

**Method 2: Barcode Scan**
- User taps "Scan Barcode" which triggers browser camera permission and opens html5-qrcode viewfinder.
- Library decodes EAN-13 / UPC-A barcode from the video stream.
- Decoded barcode sent to `/api/food/barcode/[code]` which queries Open Food Facts: `GET https://world.openfoodfacts.org/api/v2/product/{barcode}?fields=product_name,nutriments`.
- If found: nutrition data pre-filled in the Add Food form. User confirms.
- If not found: user prompted to enter data manually with a friendly informational message.

**Method 3: Manual Entry**
- User fills in: food name (required), calories (required), protein_g, carbs_g, fat_g, serving_size.
- Non-required macro fields default to 0.
- Always available as a fallback.

**Editing & Deleting:**
- Users can tap any logged entry to edit its quantity or details.
- Users can swipe or tap a delete icon to remove an entry.
- Both actions only affect the current user's log.

---

### 5.5 Custom Meals & Favorites

**Custom Meals:**
- A user can group multiple food entries into a "Custom Meal" with a name (e.g., "Morning Smoothie", "Taco Tuesday").
- Stored in the `custom_meals` table with a `meal_items` JSONB array containing each item's name, calories, and macros.
- **Shared between partners:** Custom meals belong to the couple_id. If User A creates a custom meal, User B sees it when searching or browsing custom meals on the Add Food screen.
- Logging a custom meal creates individual `food_log_entries` for each item in the meal (not a single aggregate entry), so the diary shows the full breakdown.

**Favorites:**
- Any individual food can be starred as a "Favorite" from the diary or from search results.
- Favorites appear in a dedicated "Favorites" tab on the Add Food screen.
- Favorites are **per-user** (not shared) — personal quick-access list.
- Re-logging from favorites pre-fills all fields; user just picks the meal category and confirms.

---

### 5.6 Partner Meal Sharing ("Add to Mine")

**Flow:**
1. User A logs "Grilled Salmon, 350 kcal" under Dinner.
2. User B opens the Partner Feed (`/partners/feed`) and sees User A's logged meals for today, grouped by meal category.
3. User B taps "Add to Mine" on the Grilled Salmon entry.
4. A modal appears allowing User B to adjust quantity and choose which meal category to file it under (defaults to same category).
5. On confirm, a copy of the food entry is created in User B's diary with `source: 'shared'`.

**Technical Notes:**
- The partner feed queries food_log_entries where user_id equals the partner's ID and date equals today.
- RLS policies allow read access to a partner's entries via the couples table join.
- The copied entry is a full independent row. Editing or deleting the original does not affect the copy.

---

### 5.7 Streak System & Tree Visualization

#### 5.7.1 Core Streak Logic

A day is "tracked" if the user has at least one food_log_entry for that calendar date.

**Personal Streak:** Count of consecutive tracked days ending with today (or yesterday if today has no entries yet — the streak is not broken until the day ends with no entries).

**Shared Streak:** Count of consecutive days where BOTH partners in a couple have at least one log entry. If either partner misses a day, the shared streak resets to 0.

**Calculation:** Streaks are computed on-the-fly from food_log_entries. No separate counter that could drift out of sync.

```sql
-- Personal streak: count consecutive days with entries backwards from today
WITH daily_logs AS (
  SELECT DISTINCT date FROM food_log_entries
  WHERE user_id = :user_id AND date <= CURRENT_DATE
  ORDER BY date DESC
)
-- Walk backwards from today counting consecutive dates

-- Shared streak: count consecutive days where BOTH users logged
WITH user1_dates AS (
  SELECT DISTINCT date FROM food_log_entries WHERE user_id = :user1_id
),
user2_dates AS (
  SELECT DISTINCT date FROM food_log_entries WHERE user_id = :user2_id
),
both_dates AS (
  SELECT date FROM user1_dates INTERSECT SELECT date FROM user2_dates
  ORDER BY date DESC
)
-- Walk backwards counting consecutive shared dates
```

#### 5.7.2 Tree Growth Stages (Personal Tree)

| Streak Days | Stage Name | Visual Description |
|-------------|------------|-------------------|
| 0 | Empty plot | Bare soil circle, muted tertiary colors |
| 1 | Seed planted | Small seed icon sitting in tilled soil |
| 2-4 | Germinating | Seed with visible crack, tiny root below |
| 5-14 | Sprout | Small green sprout with 2-3 leaves, thin stem |
| 15-29 | Sapling | Young tree with thin trunk, 4-6 small branches, visible leaf clusters |
| 30+ | Full apple tree | Lush tree with thick trunk, full rounded canopy, rich foliage |
| 45 (30 + 15x1) | 1 apple | Full tree + 1 red apple visible in canopy |
| 60 (30 + 15x2) | 2 apples | Full tree + 2 apples |
| 75 (30 + 15x3) | 3 apples | Full tree + 3 apples |
| ... | Pattern continues | +1 apple every 15 days |
| 180+ (30 + 15x10) | 10 apples (max) | Full tree with 10 apples, visual cap |

**Apple Formula:** `apple_count = min(10, floor((streak_days - 30) / 15))` (only when streak >= 30)

#### 5.7.3 Shared Tree (Couple Tree)

The shared tree follows the exact same growth stages but:
- Is displayed in a prominent "Our Garden" section on the Dashboard.
- Uses both partners' accent colors or a blended visual to represent togetherness.
- **Tree wilting:** When the shared streak breaks, the tree visually wilts (desaturated colors, drooping leaves/branches) for one transition frame before resetting to empty plot on the next day. This creates gentle visual accountability without being punitive.

#### 5.7.4 Visual Style

- All tree illustrations are **SVG-based** for scalability across devices.
- Color palette uses tertiary tokens: trunk/soil in tertiary-dim (#49582b), leaves in tertiary (#556536) and tertiary-container (#ebfec1), apples in error (#a83836).
- Style should feel organic/hand-drawn, consistent with the botanical sanctuary aesthetic.
- Trees are rendered as React components with props for `stage` and `appleCount`, enabling smooth transitions between stages via CSS transitions or framer-motion.

---

## 6. Database Schema (Supabase / PostgreSQL)

### 6.1 Complete Table Definitions

```sql
-- ============================================================
-- PROFILES — extends Supabase auth.users
-- ============================================================
CREATE TABLE profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username    TEXT UNIQUE NOT NULL CHECK (username ~ '^[a-z0-9_]{3,20}$'),
  display_name TEXT NOT NULL,
  avatar_url  TEXT,
  calorie_target INTEGER NOT NULL DEFAULT 2000
    CHECK (calorie_target BETWEEN 1000 AND 5000),
  protein_pct INTEGER NOT NULL DEFAULT 30
    CHECK (protein_pct BETWEEN 5 AND 60),
  carbs_pct   INTEGER NOT NULL DEFAULT 45
    CHECK (carbs_pct BETWEEN 5 AND 70),
  fat_pct     INTEGER NOT NULL DEFAULT 25
    CHECK (fat_pct BETWEEN 5 AND 60),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT macros_sum_100 CHECK (protein_pct + carbs_pct + fat_pct = 100)
);

-- ============================================================
-- COUPLES — links two users
-- ============================================================
CREATE TABLE couples (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user1_id   UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  user2_id   UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status     TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'archived')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT different_users CHECK (user1_id <> user2_id),
  CONSTRAINT unique_active_pair UNIQUE (user1_id, user2_id)
);

-- ============================================================
-- PAIR REQUESTS — pending partnership invitations
-- ============================================================
CREATE TABLE pair_requests (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  to_user_id   UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status       TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'accepted', 'declined', 'cancelled')),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- INVITES — shareable invite codes
-- ============================================================
CREATE TABLE invites (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code       TEXT UNIQUE NOT NULL,
  created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  expires_at TIMESTAMPTZ NOT NULL,
  used_by    UUID REFERENCES profiles(id),
  used_at    TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- FOOD LOG ENTRIES — the core diary data
-- ============================================================
CREATE TABLE food_log_entries (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  date             DATE NOT NULL DEFAULT CURRENT_DATE,
  meal_category    TEXT NOT NULL
    CHECK (meal_category IN ('breakfast', 'lunch', 'dinner', 'snacks')),
  food_name        TEXT NOT NULL,
  calories         NUMERIC NOT NULL DEFAULT 0,
  protein_g        NUMERIC NOT NULL DEFAULT 0,
  carbs_g          NUMERIC NOT NULL DEFAULT 0,
  fat_g            NUMERIC NOT NULL DEFAULT 0,
  serving_size     TEXT,
  serving_quantity NUMERIC NOT NULL DEFAULT 1,
  source           TEXT NOT NULL DEFAULT 'manual'
    CHECK (source IN ('usda', 'openfoodfacts', 'manual', 'shared', 'custom_meal')),
  source_food_id   TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- CUSTOM MEALS — shared between couple
-- ============================================================
CREATE TABLE custom_meals (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_id  UUID NOT NULL REFERENCES couples(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  meal_items JSONB NOT NULL DEFAULT '[]',
  -- meal_items example: [
  --   { "food_name": "Banana", "calories": 105, "protein_g": 1.3,
  --     "carbs_g": 27, "fat_g": 0.4, "serving_size": "1 medium" },
  --   { "food_name": "Peanut Butter", "calories": 190, "protein_g": 7,
  --     "carbs_g": 7, "fat_g": 16, "serving_size": "2 tbsp" }
  -- ]
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- FAVORITES — per-user quick-access foods
-- ============================================================
CREATE TABLE favorites (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  food_name      TEXT NOT NULL,
  calories       NUMERIC NOT NULL,
  protein_g      NUMERIC NOT NULL DEFAULT 0,
  carbs_g        NUMERIC NOT NULL DEFAULT 0,
  fat_g          NUMERIC NOT NULL DEFAULT 0,
  serving_size   TEXT,
  source         TEXT,
  source_food_id TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX idx_food_log_user_date ON food_log_entries(user_id, date);
CREATE INDEX idx_food_log_date ON food_log_entries(date);
CREATE INDEX idx_couples_user1 ON couples(user1_id) WHERE status = 'active';
CREATE INDEX idx_couples_user2 ON couples(user2_id) WHERE status = 'active';
CREATE INDEX idx_profiles_username ON profiles(username);
CREATE INDEX idx_pair_requests_to ON pair_requests(to_user_id)
  WHERE status = 'pending';
CREATE INDEX idx_invites_code ON invites(code) WHERE used_by IS NULL;
CREATE INDEX idx_custom_meals_couple ON custom_meals(couple_id);
CREATE INDEX idx_favorites_user ON favorites(user_id);
```

### 6.2 Row Level Security (RLS) Policies

All tables have RLS enabled. Key policy logic:

| Table | SELECT | INSERT | UPDATE | DELETE |
|-------|--------|--------|--------|--------|
| profiles | Own row + partner's row (via couples join) | Auto via trigger | Own row only | Not allowed |
| food_log_entries | Own entries + partner's entries | Own entries only | Own entries only | Own entries only |
| custom_meals | Meals belonging to user's couple | If user is in the couple | If user created it | If user created it |
| favorites | Own favorites only | Own only | Own only | Own only |
| couples | Where user is user1 or user2 | Via application logic | Status changes only | Not allowed |
| pair_requests | Where user is sender or recipient | Own outgoing only | Recipient can accept/decline | Sender can cancel |
| invites | Created by user | Own only | Redeem via application logic | Not allowed |

### 6.3 Database Functions

```sql
-- Helper: get partner ID for a user
CREATE OR REPLACE FUNCTION get_partner_id(uid UUID)
RETURNS UUID AS $$
  SELECT CASE
    WHEN user1_id = uid THEN user2_id
    WHEN user2_id = uid THEN user1_id
  END
  FROM couples
  WHERE (user1_id = uid OR user2_id = uid) AND status = 'active'
  LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER;

-- Helper: check if a date has log entries for a user
CREATE OR REPLACE FUNCTION has_log_on_date(uid UUID, check_date DATE)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM food_log_entries
    WHERE user_id = uid AND date = check_date
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- Trigger: auto-create profile on auth.users insert
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, username, display_name)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'username',
    NEW.raw_user_meta_data->>'display_name'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

---

## 7. API Routes (Next.js Route Handlers)

All server-side logic lives in `app/api/` using Next.js Route Handlers. Supabase client is initialized server-side with the user's session cookie.

### 7.1 Food Search & Barcode

| Endpoint | Method | Purpose | External API |
|----------|--------|---------|-------------|
| `/api/food/search?q={query}` | GET | Search foods by name. Try USDA first, fall back to OFF. Return normalized results. | USDA FDC then OFF |
| `/api/food/barcode/[code]` | GET | Look up a barcode. Return normalized nutrition data or 404. | Open Food Facts |

**Normalized Food Result Schema:**
```typescript
interface FoodSearchResult {
  name: string;
  brand?: string;
  calories: number;       // per serving
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  serving_size: string;   // e.g., "100g", "1 cup (240ml)"
  source: 'usda' | 'openfoodfacts';
  source_food_id: string; // external ID for re-lookup
}
```

### 7.2 Diary (Food Log)

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/diary?date={YYYY-MM-DD}` | GET | Get all entries for the user on a given date, grouped by meal_category |
| `/api/diary` | POST | Add a new food log entry |
| `/api/diary/[id]` | PUT | Update an existing entry (quantity, macros, etc.) |
| `/api/diary/[id]` | DELETE | Delete an entry |

### 7.3 Goals

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/goals` | GET | Get current user's calorie target and macro ratios |
| `/api/goals` | PUT | Update calorie target and/or macro ratios (validates sum equals 100) |

### 7.4 Streaks

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/streak` | GET | Returns personal streak, shared streak, tree stages, and apple counts |

### 7.5 Partner & Pairing

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/partner/status` | GET | Get partner's profile and today's progress summary |
| `/api/partner/feed?date={YYYY-MM-DD}` | GET | Get partner's food log entries for a date |
| `/api/partner/add-meal` | POST | Copy a partner's entry to own diary |
| `/api/partner/search?username={q}` | GET | Search for a user by username (for pairing) |
| `/api/partner/request` | POST | Send a pairing request |
| `/api/partner/request/[id]/respond` | POST | Accept or decline a pairing request |
| `/api/partner/unlink` | POST | Archive the current couple |

### 7.6 Invites

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/invite/generate` | POST | Generate an 8-char invite code (48h expiry) |
| `/api/invite/redeem` | POST | Redeem a code and create couple |

### 7.7 Custom Meals & Favorites

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/custom-meals` | GET | List all custom meals for the user's couple |
| `/api/custom-meals` | POST | Create a new custom meal |
| `/api/custom-meals/[id]` | PUT | Update a custom meal |
| `/api/custom-meals/[id]` | DELETE | Delete a custom meal |
| `/api/favorites` | GET | List user's favorite foods |
| `/api/favorites` | POST | Add a food to favorites |
| `/api/favorites/[id]` | DELETE | Remove from favorites |

---

## 8. Barcode Scanning — Technical Detail

### 8.1 Architecture

```
[User Camera] -> [html5-qrcode in browser] -> decoded barcode string
     |
     v
[/api/food/barcode/0071859004044] -> [Open Food Facts API] -> nutrition data
     |
     v
[Pre-filled Add Food form] -> User confirms -> [/api/diary POST]
```

### 8.2 Cost

**$0 total.** Both components are free:
- html5-qrcode: MIT license, runs client-side, no server cost.
- Open Food Facts API: Free, no API key required, no rate limits for reasonable traffic. 2.8M+ products with barcode data.

### 8.3 Supported Barcode Formats

EAN-13 (international standard), UPC-A (US/Canada), EAN-8. These cover virtually all grocery products.

### 8.4 Future Extensibility

The barcode feature is isolated behind a single API route (`/api/food/barcode/[code]`). To upgrade later:
- Swap Open Food Facts for FatSecret (90%+ barcode success rate, free basic tier) by changing only the route handler.
- Add a paid tier like Chomp API as a secondary fallback after Open Food Facts.
- The client-side scanner and UI remain completely untouched during any backend swap.

---

## 9. Component Architecture

### 9.1 Shared Layout Components

| Component | Description |
|-----------|-------------|
| `TopNav` | Fixed top bar: BiteMates logo, nav links (Dashboard, Diary, Goals, Reports, Partners), "Log Meal" CTA button, user avatar |
| `Sidebar` | Desktop-only (xl+) left sidebar: partner status card, quick nav, partner nudge CTA |
| `BottomNav` | Mobile-only bottom tab bar: Dashboard, Diary, Goals, Partners, Settings icons |
| `GlassPanel` | Reusable glassmorphic container (backdrop-blur + semi-transparent bg) |
| `BentoCard` | Rounded container (rounded-[2.5rem]) with tonal background for bento grid sections |

### 9.2 Feature Components

| Component | Description |
|-----------|-------------|
| `CalorieRing` | SVG circular progress showing calories consumed vs. target |
| `MacroSliders` | Linked sliders for protein/carbs/fat with auto-balancing to 100% |
| `TreeVisual` | SVG tree component accepting `stage` and `appleCount` props |
| `MealSection` | Collapsible section for a meal category with entry list and subtotal |
| `FoodEntryRow` | Single food item row: name, calories, macros, edit/delete actions |
| `FoodSearch` | Search input with debounced API calls and result list |
| `BarcodeScanner` | Camera viewfinder with html5-qrcode integration |
| `PartnerCard` | Compact card: partner name, today's progress percentage, streak |
| `StreakDisplay` | Shows personal and shared trees side by side with streak day counts |
| `AddToMineModal` | Modal for copying partner's food entry with quantity/category adjustment |

---

## 10. Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# USDA FoodData Central
# Free key: https://fdc.nal.usda.gov/api-key-signup.html
USDA_API_KEY=your-usda-api-key

# App
NEXT_PUBLIC_APP_URL=https://bitemates.app
```

Note: Open Food Facts requires no API key.

---

## 11. Non-Functional Requirements

| Requirement | Target |
|-------------|--------|
| Performance | First Contentful Paint under 1.5s on 4G. Lighthouse score above 90. |
| Responsiveness | Fully functional on mobile (360px+), tablet, and desktop (1440px+). |
| Accessibility | WCAG 2.1 AA. Ghost borders at 15% opacity where visual boundaries are needed. |
| Browser Support | Chrome, Safari, Firefox, Edge (latest 2 versions). Camera API for barcode scanning requires HTTPS. |
| Data Privacy | All food logs private to user and paired partner. RLS enforced at database level. |
| Offline | Not required for MVP. Future: service worker for cached diary viewing. |

---

## 12. Out of Scope (MVP)

These features are explicitly excluded from v1 but the architecture should not prevent their future addition:

- Water tracking
- Exercise / activity logging
- Weight logging and body measurements
- AI-powered meal suggestions (the mockup's "AI Smart Adjust" is a post-MVP feature)
- Push notifications / email reminders
- Social features beyond the partner pair (no groups, no public profiles)
- Recipe import from URLs
- Photo-based food recognition
- Dark mode (the design tokens support it but implementation is deferred)
- Native mobile app (PWA could be a quick win post-MVP)
