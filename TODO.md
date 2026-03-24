# BiteMates — Development TODO

**Tracking document for building BiteMates step by step.**
Check off tasks as they are completed. Each phase builds on the previous one.
Do not skip phases — later features depend on earlier infrastructure.

---

## Phase 0: Project Setup & Infrastructure
*Goal: Get a working Next.js app deployed to Vercel with Supabase connected.*

- [ ] **0.1** Create a new Next.js 14+ project with App Router and TypeScript
  ```bash
  npx create-next-app@latest bitemates --typescript --tailwind --eslint --app --src-dir
  ```
- [ ] **0.2** Install core dependencies
  ```bash
  npm install @supabase/supabase-js @supabase/ssr
  ```
- [ ] **0.3** Configure Tailwind with the full BiteMates design token set
  - Copy all color tokens from SPECIFICATIONS.md Section 3.1 into `tailwind.config.ts`
  - Add Manrope font family under `fontFamily.headline`, `fontFamily.body`, `fontFamily.label`
  - Add custom border radius values (`rounded-[2.5rem]`)
- [ ] **0.4** Add Manrope font via Google Fonts in `app/layout.tsx`
- [ ] **0.5** Add Material Symbols Outlined font via Google Fonts in `app/layout.tsx`
- [ ] **0.6** Create global CSS with the `.glass-panel` utility class
  ```css
  .glass-panel {
    background: rgba(255, 255, 255, 0.4);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
  }
  ```
- [ ] **0.7** Create a Supabase project at supabase.com
- [ ] **0.8** Add environment variables to `.env.local`
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
- [ ] **0.9** Create Supabase client utilities
  - `lib/supabase/client.ts` — browser client (uses anon key)
  - `lib/supabase/server.ts` — server client (uses cookies for auth)
- [ ] **0.10** Push project to GitHub repository
- [ ] **0.11** Connect GitHub repo to Vercel and deploy
  - Add environment variables in Vercel dashboard
  - Confirm the app loads at the Vercel URL
- [ ] **0.12** Create a basic `app/page.tsx` placeholder landing page with the BiteMates name and background color (#ebfeee) to verify Tailwind tokens work

**Phase 0 Checkpoint:** A blank Next.js app with correct colors and font is live on Vercel.

---

## Phase 1: Database Schema & Authentication
*Goal: Users can sign up, log in, and have a profile with a unique username.*

- [ ] **1.1** Run the full SQL schema from SPECIFICATIONS.md Section 6.1 in Supabase SQL Editor
  - Create tables: profiles, couples, pair_requests, invites, food_log_entries, custom_meals, favorites
  - Create all indexes
- [ ] **1.2** Enable Row Level Security on ALL tables in Supabase dashboard
- [ ] **1.3** Write and apply RLS policies for the `profiles` table
  - Users can SELECT their own row
  - Users can UPDATE their own row
  - Partner can SELECT via couples join (can add this policy later when couples exist)
- [ ] **1.4** Write and apply RLS policies for `food_log_entries`
  - Users can CRUD their own entries
  - Partner can SELECT via couples join
- [ ] **1.5** Write and apply RLS policies for remaining tables (couples, pair_requests, invites, custom_meals, favorites) per SPECIFICATIONS.md Section 6.2
- [ ] **1.6** Create the `handle_new_user()` trigger function and trigger so profiles are auto-created on sign-up (SPECIFICATIONS.md Section 6.3)
- [ ] **1.7** Create the `get_partner_id()` and `has_log_on_date()` helper functions
- [ ] **1.8** Build the Sign Up page (`app/signup/page.tsx`)
  - Form fields: email, password, display name, username
  - Client-side validation: username 3-20 chars, alphanumeric + underscore, lowercase
  - Call `supabase.auth.signUp()` with username and display_name in `options.data`
  - On success redirect to `/dashboard`
  - On error show inline error messages (username taken, email in use, etc.)
- [ ] **1.9** Build the Login page (`app/login/page.tsx`)
  - Form fields: email, password
  - Call `supabase.auth.signInWithPassword()`
  - On success redirect to `/dashboard`
  - Show error for invalid credentials
- [ ] **1.10** Create auth middleware (`middleware.ts`)
  - Protect all routes except `/`, `/login`, `/signup`, `/invite/[code]`
  - Redirect unauthenticated users to `/login`
  - Redirect authenticated users away from `/login` and `/signup` to `/dashboard`
- [ ] **1.11** Create a sign-out action (server action or API route)
- [ ] **1.12** Style the Login and Sign Up pages following the design system
  - Surface background, no borders on inputs (use soft-filled surface-variant or bottom-only focus state)
  - Primary pill button for submit
  - Manrope typography

**Phase 1 Checkpoint:** Users can sign up with a unique username, log in, and be redirected to a protected dashboard route. Profile row exists in database.

---

## Phase 2: App Shell & Navigation
*Goal: The shared layout (top nav, sidebar, bottom nav, page structure) is built and working.*

- [ ] **2.1** Create the authenticated layout (`app/(authenticated)/layout.tsx`)
  - This layout wraps all protected pages
  - Includes TopNav, Sidebar, BottomNav components
- [ ] **2.2** Build the `TopNav` component
  - Fixed position, h-20, bg-surface with backdrop-blur
  - BiteMates logo/text on the left (text-2xl font-bold tracking-tighter)
  - Nav links center: Dashboard, Diary, Goals, Reports, Partners
  - Active link style: font-bold, border-b-2 border-tertiary
  - Right side: "Log Meal" pill button + user avatar circle
  - Reference: code.html nav element
- [ ] **2.3** Build the `Sidebar` component
  - Fixed left, w-72, hidden below xl breakpoint
  - Partner status section at top (avatar, name, progress text)
  - Nav links: Partner Status, Quick Log, Nutrients, Settings
  - Active link: bg-primary text-white rounded-2xl
  - Bottom CTA card: tertiary-container background, partner nudge message, "Cheer Partner" button
  - If no partner paired yet, show "Connect a Partner" CTA instead
  - Reference: code.html aside element
- [ ] **2.4** Build the `BottomNav` component
  - Fixed bottom, md:hidden, h-20
  - 5 icon tabs: Dashboard, Diary, Goals, Partners, Settings
  - Active tab: tertiary color with fill
  - Reference: code.html bottom nav element
- [ ] **2.5** Create placeholder pages for all authenticated routes
  - `/dashboard`, `/diary`, `/goals`, `/reports`, `/partners`, `/settings`
  - Each shows the page name as a heading so navigation can be tested
- [ ] **2.6** Implement active-link highlighting in all nav components
  - Use `usePathname()` from next/navigation to detect current route
- [ ] **2.7** Fetch and display the current user's display name and avatar in TopNav and Sidebar
  - Create a `useProfile` hook or server component that fetches from `profiles` table

**Phase 2 Checkpoint:** Full navigation shell is working. Clicking nav links routes between placeholder pages. Layout matches the mockup structure.

---

## Phase 3: Goals & Profile Settings
*Goal: Users can set and view their calorie target and macro ratios.*

- [ ] **3.1** Build the Goals page (`app/(authenticated)/goals/page.tsx`)
  - Match the mockup's "Health Blueprint" header with the bento grid layout
  - Page title: display-lg scale, tracking-tight
- [ ] **3.2** Build the `MacroSliders` component
  - Three range sliders: Protein, Carbs, Fat
  - Each shows percentage and calculated grams
  - Linked behavior: adjusting one slider redistributes the remaining percentage across the other two so the total always equals 100
  - Color-coded dots: primary (protein), secondary (carbs), tertiary (fat)
  - Custom slider styling matching the mockup (see code.html CSS for range inputs)
- [ ] **3.3** Build the calorie target input
  - Large display number (text-3xl font-black) showing current target
  - Increment/decrement controls or editable field
  - Range: 1000-5000
- [ ] **3.4** Create the `PUT /api/goals` route handler
  - Validate: protein_pct + carbs_pct + fat_pct = 100
  - Validate: calorie_target between 1000-5000
  - Update the profiles table for the authenticated user
- [ ] **3.5** Create the `GET /api/goals` route handler
  - Return calorie_target, protein_pct, carbs_pct, fat_pct and calculated grams
- [ ] **3.6** Wire up the Goals page to read and save via the API routes
  - Load current goals on mount
  - Save on button click or auto-save on slider release
  - Show success toast on save
- [ ] **3.7** Build a basic Settings page (`app/(authenticated)/settings/page.tsx`)
  - Edit display name
  - View username (read-only)
  - Sign out button
  - Unlink partner button (disabled if no partner)

**Phase 3 Checkpoint:** Users can adjust their calorie target and macro ratios with sliders. Values persist to the database and reload correctly.

---

## Phase 4: Food Search API & Manual Entry
*Goal: Users can search for foods and manually enter them. The food data pipeline works end to end.*

- [ ] **4.1** Sign up for a free USDA FoodData Central API key at `https://fdc.nal.usda.gov/api-key-signup.html`
  - Add `USDA_API_KEY` to `.env.local` and Vercel environment variables
- [ ] **4.2** Create the `GET /api/food/search` route handler
  - Accept query param `q`
  - Call USDA FoodData Central API: `https://api.nal.usda.gov/fdc/v1/foods/search?query={q}&pageSize=10&api_key={key}`
  - Normalize USDA results into the `FoodSearchResult` interface (see SPECIFICATIONS.md Section 7.1)
  - Handle USDA nutrient data structure: calories = nutrientId 1008, protein = 1003, fat = 1004, carbs = 1005
- [ ] **4.3** Add Open Food Facts fallback in the search route
  - If USDA returns 0 results, query OFF: `https://world.openfoodfacts.org/cgi/search.pl?search_terms={q}&json=1&page_size=10`
  - Normalize OFF results into same `FoodSearchResult` interface
  - OFF nutrient fields: `nutriments.energy-kcal_100g`, `nutriments.proteins_100g`, etc.
- [ ] **4.4** Build the Add Food page (`app/(authenticated)/diary/add/page.tsx`)
  - Tab navigation: Search, Favorites, Custom Meals, Manual
  - Default to Search tab
- [ ] **4.5** Build the `FoodSearch` component
  - Text input with debounced search (300ms delay)
  - Loading state while API call is in flight
  - Result list showing: food name, brand (if available), calories, and serving size
  - Each result is tappable to select
- [ ] **4.6** Build the food confirmation/edit view
  - When a search result is selected, show editable fields: serving quantity, serving size
  - Display calculated totals: calories, protein, carbs, fat (based on quantity)
  - Meal category selector: Breakfast, Lunch, Dinner, Snacks
  - Date picker (defaults to today)
  - "Add to Diary" primary button
- [ ] **4.7** Build the manual entry form
  - Fields: food name (required), calories (required), protein_g, carbs_g, fat_g, serving_size
  - Meal category selector and date picker
  - "Add to Diary" primary button
- [ ] **4.8** Create the `POST /api/diary` route handler
  - Insert into food_log_entries table
  - Validate required fields (food_name, calories, meal_category, date)
  - Return the created entry
- [ ] **4.9** Test the full flow: search for "apple" -> select result -> confirm -> entry saved to database

**Phase 4 Checkpoint:** Users can search for foods (USDA primary, OFF fallback), see nutrition data, and log entries to the database. Manual entry also works.

---

## Phase 5: Daily Diary View
*Goal: Users see their full food diary for a day with subtotals and daily total.*

- [ ] **5.1** Create the `GET /api/diary` route handler
  - Accept query param `date` (YYYY-MM-DD format, default today)
  - Return entries grouped by meal_category
  - Include subtotals per category and grand total for the day
- [ ] **5.2** Build the Diary page (`app/(authenticated)/diary/page.tsx`)
  - Date navigation: left/right arrows to change day, date display in center
  - "Add Food" button linking to `/diary/add`
- [ ] **5.3** Build the daily summary header
  - `CalorieRing` component: SVG circle showing consumed vs. target
  - Macro summary bar or mini-rings for protein, carbs, fat (consumed vs. goal grams)
  - Large calorie number in display-lg scale
- [ ] **5.4** Build the `MealSection` component
  - Section header: meal category name (Breakfast, Lunch, Dinner, Snacks) with subtotal calories
  - Collapsible: tap header to expand/collapse the entry list
  - "Add" button per section that navigates to `/diary/add?category={category}`
- [ ] **5.5** Build the `FoodEntryRow` component
  - Display: food name, calories, serving info
  - Tap to expand and show macro breakdown (protein, carbs, fat)
  - Edit button: opens inline editing or a modal to adjust quantity
  - Delete button: removes the entry with a confirmation
  - No divider lines — use spacing-4 vertical gap between rows
  - Hover/tap state: surface to surface-container-low transition
- [ ] **5.6** Create the `PUT /api/diary/[id]` route handler
  - Update serving_quantity, or recalculate macros based on new quantity
  - Validate the entry belongs to the authenticated user
- [ ] **5.7** Create the `DELETE /api/diary/[id]` route handler
  - Soft or hard delete (hard delete for MVP is fine)
  - Validate the entry belongs to the authenticated user
- [ ] **5.8** Wire everything together: diary page loads entries, sections render, edit/delete work, totals update

**Phase 5 Checkpoint:** Users see a complete daily diary view. They can navigate between days, see subtotals per meal, and edit or delete entries. The calorie ring reflects progress.

---

## Phase 6: Favorites & Custom Meals
*Goal: Users can save favorites and create reusable custom meals.*

- [ ] **6.1** Create the favorites API routes
  - `GET /api/favorites` — list all favorites for the authenticated user
  - `POST /api/favorites` — add a food to favorites
  - `DELETE /api/favorites/[id]` — remove from favorites
- [ ] **6.2** Add a "star" / favorite toggle to the `FoodEntryRow` component
  - Tapping the star on a logged entry saves it to favorites
  - If already favorited, tapping removes it
- [ ] **6.3** Add a "star" toggle to food search results
  - User can favorite a food directly from search without logging it first
- [ ] **6.4** Build the Favorites tab on the Add Food page
  - List all favorited foods
  - Tapping a favorite pre-fills the confirmation form (same as selecting a search result)
  - User picks category, adjusts quantity, and confirms to log
- [ ] **6.5** Create the custom meals API routes
  - `GET /api/custom-meals` — list all custom meals for the user's couple
  - `POST /api/custom-meals` — create a new custom meal (body: name, meal_items array)
  - `PUT /api/custom-meals/[id]` — update a custom meal
  - `DELETE /api/custom-meals/[id]` — delete a custom meal
- [ ] **6.6** Build the "Create Custom Meal" flow
  - User enters a meal name
  - User adds items via search, favorites, or manual entry (mini version of Add Food)
  - Each item is added to a list with its nutrition info
  - "Save Custom Meal" button creates the record
- [ ] **6.7** Build the Custom Meals tab on the Add Food page
  - List all custom meals for the couple (both partners' creations)
  - Show meal name and total calories
  - Tapping a custom meal shows the item breakdown
  - "Log This Meal" button creates individual food_log_entries for each item in the meal
- [ ] **6.8** Handle the edge case: if user has no partner yet, custom meals section shows a message encouraging them to pair up (custom meals require a couple_id)

**Phase 6 Checkpoint:** Users can favorite foods for quick re-logging. Users can create named custom meals composed of multiple items. Custom meals are visible to both partners.

---

## Phase 7: Couple Pairing
*Goal: Two users can connect as partners via username search or invite code.*

- [ ] **7.1** Build the Partners page (`app/(authenticated)/partners/page.tsx`)
  - Two sections: "Find Your Partner" and "Pending Requests"
  - If already paired: show partner info and link to partner feed instead
- [ ] **7.2** Build the username search component
  - Text input for username search
  - `GET /api/partner/search?username={q}` route handler
  - Show matching user (display name, username) with "Send Request" button
  - Validate: cannot send to self, cannot send if already in a couple
- [ ] **7.3** Create the `POST /api/partner/request` route handler
  - Insert into pair_requests table
  - Validate: no existing pending request between these users, neither is in an active couple
- [ ] **7.4** Build the incoming requests list
  - Query pair_requests where to_user_id = current user and status = pending
  - Show requester's display name and username
  - Accept and Decline buttons per request
- [ ] **7.5** Create the `POST /api/partner/request/[id]/respond` route handler
  - Accept: create couples row, update request status to "accepted"
  - Decline: update request status to "declined"
  - Validate: only the recipient can respond
- [ ] **7.6** Build the invite code generation feature
  - "Generate Invite Code" button on Partners page
  - `POST /api/invite/generate` — creates 8-char alphanumeric code with 48h expiry
  - Display the code and a copyable link: `bitemates.app/invite/[CODE]`
- [ ] **7.7** Build the invite redemption page (`app/invite/[code]/page.tsx`)
  - Public route (accessible without auth)
  - If not logged in: show sign-up/login prompt with the code preserved
  - If logged in: validate the code and pair the users
  - `POST /api/invite/redeem` — validate code, create couple, mark invite as used
- [ ] **7.8** Create the `POST /api/partner/unlink` route handler
  - Set couple status to "archived"
  - Both users become unpaired and can pair with someone new
- [ ] **7.9** Update the Sidebar to show real partner data when paired
  - Fetch partner profile and today's calorie progress
  - Show partner avatar, name, and progress text
  - Show the "Cheer Partner" / nudge CTA
- [ ] **7.10** Update RLS policies now that couples exist
  - Profiles: allow SELECT of partner's row via couples join
  - Food log entries: allow SELECT of partner's entries via couples join

**Phase 7 Checkpoint:** Two users can pair via username search or invite code. The sidebar shows live partner status. Users can unlink if needed.

---

## Phase 8: Partner Feed & Meal Sharing
*Goal: Users can see their partner's logged meals and copy them to their own diary.*

- [ ] **8.1** Create the `GET /api/partner/feed` route handler
  - Accept query param `date` (default today)
  - Return the partner's food_log_entries for that date, grouped by meal_category
  - Include partner's display name and daily totals
- [ ] **8.2** Build the Partner Feed page (`app/(authenticated)/partners/feed/page.tsx`)
  - Header showing partner's name and date
  - Date navigation (same as diary page)
  - Partner's entries grouped by meal category
  - Each entry shows: food name, calories, macros
- [ ] **8.3** Build the "Add to Mine" button on each partner entry
  - Tapping opens the `AddToMineModal`
- [ ] **8.4** Build the `AddToMineModal` component
  - Shows the food item details (name, calories, macros)
  - Adjustable serving quantity
  - Meal category selector (defaults to same category as the original)
  - "Add to My Diary" confirmation button
- [ ] **8.5** Create the `POST /api/partner/add-meal` route handler
  - Accept: entryId (the partner's entry to copy), mealCategory (optional override), quantity (optional override)
  - Create a new food_log_entry for the current user with source = "shared"
  - Return the created entry
- [ ] **8.6** Create the `GET /api/partner/status` route handler
  - Return partner's profile info, today's calorie total vs. target, macro percentages, streak counts
- [ ] **8.7** Add "shared" visual indicator on diary entries that came from a partner
  - Small icon or label on `FoodEntryRow` when source = "shared"

**Phase 8 Checkpoint:** Users can browse their partner's daily food log and copy meals to their own diary with one tap. Shared entries are visually tagged.

---

## Phase 9: Streak System & Tree Visualization
*Goal: Personal and shared streaks are tracked and displayed as growing trees.*

- [ ] **9.1** Create the `GET /api/streak` route handler
  - Calculate personal streak: count consecutive days (backwards from today) where user has at least one food_log_entry
  - Calculate shared streak: count consecutive days where BOTH partners have entries
  - Return: personalStreak, sharedStreak, personalStage, sharedStage, personalAppleCount, sharedAppleCount
  - Use the stage/apple formulas from SPECIFICATIONS.md Section 5.7
- [ ] **9.2** Create the streak calculation utility function (`lib/streaks.ts`)
  - `calculatePersonalStreak(userId: string): Promise<number>`
  - `calculateSharedStreak(coupleId: string): Promise<number>`
  - `getTreeStage(streakDays: number): { stage: string, appleCount: number }`
  - Handle the grace period: today's streak is not broken until the day ends
- [ ] **9.3** Design and build the `TreeVisual` SVG component
  - Props: `stage: 'empty' | 'seed' | 'germinating' | 'sprout' | 'sapling' | 'full_tree'` and `appleCount: number`
  - Create SVG artwork for each stage using tertiary color palette
  - Trunk/soil: tertiary-dim (#49582b)
  - Leaves: tertiary (#556536) and tertiary-container (#ebfec1)
  - Apples: error (#a83836)
  - Style: organic/hand-drawn feel, consistent with botanical aesthetic
  - Smooth CSS transitions between stages
- [ ] **9.4** Create the wilting tree variant for shared streak breaks
  - Desaturated colors, drooping branches/leaves
  - Shown when shared streak was recently broken (yesterday had a streak, today it's 0)
- [ ] **9.5** Build the `StreakDisplay` component
  - Shows two trees side by side: "My Tree" and "Our Garden"
  - Streak day count below each tree
  - Label for the current stage name
- [ ] **9.6** Integrate the StreakDisplay into the Dashboard page
  - Prominent placement in the bento grid
  - Fetch streak data on page load
- [ ] **9.7** Add streak info to the Sidebar partner card
  - Show the shared streak day count as a subtle badge or text

**Phase 9 Checkpoint:** Personal and shared streaks are calculated correctly. Trees grow through all stages. The dashboard prominently displays both trees.

---

## Phase 10: Dashboard
*Goal: A polished dashboard combining all daily data into the bento grid layout.*

- [ ] **10.1** Build the Dashboard page (`app/(authenticated)/dashboard/page.tsx`)
  - Match the bento grid layout from the mockup (grid-cols-12 with gap-6)
  - Page header: "Health Blueprint" or "Daily Sanctuary" in display scale
- [ ] **10.2** Build the daily calorie summary card (glassmorphic panel, col-span-7)
  - `CalorieRing` showing consumed vs. target
  - Macro breakdown: protein, carbs, fat with colored indicators and progress bars
  - Current calorie number in text-3xl font-black
  - "KCAL TARGET" label below
- [ ] **10.3** Build the streak/milestones card (col-span-5, tertiary-container background)
  - Shared streak display with tree visualization
  - Personal streak info
  - Progress bars for milestone tracking
  - "Next Reward" teaser (can be static for MVP)
- [ ] **10.4** Build the quick-actions section
  - "Log Meal" shortcut button
  - "View Diary" shortcut
  - "Partner Feed" shortcut (if paired)
- [ ] **10.5** Build the partner status card
  - Partner's calorie progress for today
  - Quick summary: "Jamie is at 75% of their calorie goal"
  - Link to partner feed
- [ ] **10.6** Add the "recent meals" mini-section
  - Show last 3-5 logged entries for quick reference
  - Link to full diary
- [ ] **10.7** Handle the unpaired state gracefully
  - If no partner, replace partner-related cards with a "Connect with your partner" CTA card
  - Still show personal streak and calorie tracking

**Phase 10 Checkpoint:** The dashboard is a polished, data-rich home screen. All bento cards show real data. Layout matches the mockup aesthetic.

---

## Phase 11: Barcode Scanning
*Goal: Users can scan product barcodes with their phone camera to look up food data.*

- [ ] **11.1** Install the html5-qrcode library
  ```bash
  npm install html5-qrcode
  ```
- [ ] **11.2** Create the `GET /api/food/barcode/[code]` route handler
  - Call Open Food Facts: `GET https://world.openfoodfacts.org/api/v2/product/{code}?fields=product_name,nutriments,serving_size`
  - Normalize response into FoodSearchResult format
  - Return 404 if product not found (status !== 1)
- [ ] **11.3** Build the `BarcodeScanner` component
  - Request camera permission via getUserMedia
  - Initialize html5-qrcode with a viewfinder element
  - On successful decode: send barcode to the API route
  - Show loading state during API lookup
  - On result found: navigate to the food confirmation view with pre-filled data
  - On not found: show friendly message with option to enter manually
  - Stop/clean up camera on component unmount
- [ ] **11.4** Add the barcode scanner as an option on the Add Food page
  - "Scan Barcode" button/tab alongside Search, Favorites, Custom Meals, Manual
  - Button opens the BarcodeScanner component
- [ ] **11.5** Handle edge cases
  - Camera permission denied: show instructions for enabling camera access
  - No camera available (desktop): hide the barcode scanning option
  - Slow/failed API lookup: timeout after 5 seconds, offer manual entry
- [ ] **11.6** Test with real product barcodes to verify the full flow

**Phase 11 Checkpoint:** Users can scan a product barcode using their phone camera. If the product is in Open Food Facts, nutrition data is auto-filled. If not, they can enter manually.

---

## Phase 12: Reports & Data Visualization
*Goal: Users can see weekly and monthly summaries of their nutrition and streak data.*

- [ ] **12.1** Build the Reports page (`app/(authenticated)/reports/page.tsx`)
  - Toggle between "Weekly" and "Monthly" views
  - Match the mockup's Weight Trajectory section styling (but for calorie/macro data)
- [ ] **12.2** Create the reporting API route
  - `GET /api/reports?range=week|month&date={YYYY-MM-DD}`
  - Return: daily calorie totals for the range, average macros, streak history, days logged vs. days in range
- [ ] **12.3** Build a calorie trend chart
  - Line chart showing daily calorie intake over the selected range
  - Target line overlay showing the calorie goal
  - Use the same SVG curve style as the mockup (smooth paths with primary color stroke)
  - Optional: partner's line in tertiary color (dashed)
- [ ] **12.4** Build macro average cards
  - Average protein, carbs, fat intake over the period
  - Compare against goals (percentage of goal met)
- [ ] **12.5** Build the consistency score
  - Days tracked / total days in the range = consistency percentage
  - Display as a large bold number (matching the "92%" in the mockup)
- [ ] **12.6** Show streak history
  - Longest streak in the period
  - Current streak
  - Streak calendar heatmap (optional but nice to have)

**Phase 12 Checkpoint:** Users see meaningful visualizations of their nutrition trends over time. The page is visually consistent with the rest of the app.

---

## Phase 13: Landing Page & Polish
*Goal: A polished public landing page and overall UX refinements.*

- [ ] **13.1** Build the public landing page (`app/page.tsx`)
  - Hero section: BiteMates name, tagline, brief description, sign-up CTA
  - Feature highlights: calorie tracking, partner sharing, streak trees, barcode scanning
  - Use the sage-green palette with glassmorphic elements
  - Mobile-responsive
- [ ] **13.2** Add loading states throughout the app
  - Skeleton loaders for diary entries, dashboard cards
  - Spinner for search results and API calls
  - Use surface-container-low as skeleton base color
- [ ] **13.3** Add error states and empty states
  - No entries for today: "Start logging your meals!" with Add Food CTA
  - No partner: "Connect with your partner to start your shared journey"
  - API errors: friendly error messages with retry options
  - No search results: "No foods found. Try a different search or add manually."
- [ ] **13.4** Add toast notifications for success actions
  - "Meal logged!", "Goals updated!", "Partner request sent!", etc.
  - Use tertiary-container background with on-tertiary-container text
- [ ] **13.5** Review all pages against the DESIGN.md rules
  - No 1px borders anywhere
  - No pure black/grey shadows
  - No list divider lines
  - Correct tonal layering
  - All buttons are pill-shaped where specified
  - Typography scale is consistent
- [ ] **13.6** Accessibility audit
  - Check color contrast ratios (WCAG AA)
  - Ensure all interactive elements are keyboard accessible
  - Add appropriate ARIA labels
  - Test with screen reader
- [ ] **13.7** Performance optimization
  - Verify Lighthouse score above 90
  - Optimize images (if any)
  - Check bundle size
  - Add appropriate caching headers for API routes

**Phase 13 Checkpoint:** The app feels polished and complete. All states are handled. The landing page converts visitors to sign-ups.

---

## Phase 14: Testing & Launch Prep
*Goal: The app is tested, documented, and ready for real use.*

- [ ] **14.1** Manual end-to-end testing checklist
  - [ ] Sign up as User A with unique username
  - [ ] Sign up as User B with different unique username
  - [ ] User A sends pair request to User B via username
  - [ ] User B accepts the request
  - [ ] User A sets custom calorie target and macro ratios
  - [ ] User A searches for and logs a food item
  - [ ] User A manually enters a food item
  - [ ] User A favorites a food item
  - [ ] User A creates a custom meal with 3 items
  - [ ] User B sees User A's entries in Partner Feed
  - [ ] User B taps "Add to Mine" on one of User A's entries
  - [ ] User B sees the copied entry in their own diary with "shared" tag
  - [ ] User B logs a custom meal created by User A
  - [ ] Verify both personal streaks are at 1
  - [ ] Verify shared streak is at 1
  - [ ] Verify personal trees show "Seed planted" stage
  - [ ] Navigate reports and verify charts show data
  - [ ] Test invite code flow: User A generates code, User C redeems it
  - [ ] Test unlinking: User A unlinks from User B
  - [ ] Test barcode scan with a real product
- [ ] **14.2** Test responsive design
  - [ ] Mobile (360px width)
  - [ ] Tablet (768px width)
  - [ ] Desktop (1440px width)
  - [ ] Verify bottom nav shows on mobile, sidebar shows on xl+
- [ ] **14.3** Set up a custom domain on Vercel (if desired)
  - Configure DNS for bitemates.app (or chosen domain)
  - Enable HTTPS (automatic on Vercel)
- [ ] **14.4** Write a README.md for the repository
  - Setup instructions, environment variables, deployment guide
- [ ] **14.5** Final deploy to Vercel production

**Phase 14 Checkpoint:** BiteMates is live and working. Both partners can track together.**

---

## Future Phases (Post-MVP)

These are noted here for planning but are NOT part of the initial build:

- [ ] **F.1** Water tracking
- [ ] **F.2** Exercise / activity logging
- [ ] **F.3** Weight and body measurement logging
- [ ] **F.4** AI-powered meal suggestions ("AI Smart Adjust" from mockup)
- [ ] **F.5** Push notifications and email reminders
- [ ] **F.6** Dark mode implementation
- [ ] **F.7** PWA (Progressive Web App) support for mobile home screen install
- [ ] **F.8** Upgrade barcode API to FatSecret for better coverage
- [ ] **F.9** Recipe import from URLs
- [ ] **F.10** Photo-based food recognition
- [ ] **F.11** Shared grocery list feature
- [ ] **F.12** Weekly meal planning together
