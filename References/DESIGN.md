# Design System Document

## 1. Overview & Creative North Star

### Creative North Star: "The Shared Sanctuary"
This design system moves away from the clinical, high-friction nature of traditional fitness trackers. Instead of a rigid database, we are building a "Shared Sanctuary"—a digital space that feels like a calm, sun-drenched kitchen morning. The goal is to facilitate collaboration between partners through a UI that breathes. 

We break the "standard app" mold by rejecting heavy borders and boxy containers. Instead, we use **Tonal Layering**, **Soft Asymmetry**, and **Glassmorphism** to create an editorial feel. Imagine an architectural floor plan where spaces flow into one another without harsh walls. We prioritize whitespace (breathing room) over dense data packing, ensuring that calorie tracking feels like a lifestyle choice rather than a chore.

---

## 2. Colors

The palette is rooted in botanical tones, leveraging a sophisticated range of sage greens and off-whites to maintain a low-cortisol user experience.

*   **Background (`#ebfeee`):** Our primary canvas. It is intentionally soft to reduce eye strain.
*   **Primary (`#516356`) & Secondary (`#4f6455`):** These muted forest tones are used for high-level information and navigation.
*   **Tertiary (`#556536`):** Reserved for "growth" metrics, such as meeting protein goals or positive progress indicators.
*   **Neutral Roles:** Used for subtle hierarchy shifts rather than visual decoration.

### The "No-Line" Rule
**Explicit Instruction:** Designers are prohibited from using 1px solid borders to define sections. Traditional dividers are a sign of uninspired design. Boundaries must be defined solely through background color shifts. For example, a `surface-container-low` section should sit directly on a `surface` background to denote a change in context.

### Surface Hierarchy & Nesting
Treat the UI as a physical stack of fine papers.
*   **Nesting:** Place a `surface-container-highest` card inside a `surface-container-low` section to create focal depth.
*   **The "Glass & Gradient" Rule:** Floating elements (like a "Quick Add" meal button) should utilize `surface-blur` effects. Use a subtle linear gradient transitioning from `primary` to `primary-container` (at 15% opacity) for headers to give the UI a "soul" that flat hex codes cannot achieve.

---

## 3. Typography

We use **Manrope** exclusively for its modern, geometric-yet-humanist qualities. It balances technical precision with warmth.

*   **Display (lg/md/sm):** Used for large "Daily Total" calorie counts. These should feel like a headline in a premium wellness magazine—confident and airy.
*   **Headline & Title:** Used for meal categories (Breakfast, Lunch). These provide the structural anchor for the page.
*   **Body (lg/md):** All meal entries and nutrient details. We use a generous line-height to ensure lists don't feel cluttered.
*   **Label (md/sm):** Reserved for micro-data (e.g., "g" in 20g Protein). 

**Identity through Scale:** By using a high-contrast scale (e.g., `display-lg` for calories vs. `label-md` for macros), we create an editorial hierarchy that guides the eye naturally to what matters most.

---

## 4. Elevation & Depth

Depth in this system is organic, mimicking natural light and shadow.

*   **The Layering Principle:** Avoid "Drop Shadows" as a default. Use Tonal Layering. A `surface-container-lowest` card on a `surface-container-low` background creates a "soft lift" that feels architectural.
*   **Ambient Shadows:** If a floating action requires a shadow, it must be highly diffused. Use a blur of `24px` to `40px` with an opacity of `4-8%`. The shadow color must be a tinted version of `on-surface` (`#173926`), never pure black.
*   **The "Ghost Border" Fallback:** If accessibility requires a stroke, use the `outline-variant` token at **15% opacity**. It should be felt, not seen.
*   **Glassmorphism:** For the collaborative "Partner Feed" or "Quick Actions," use a backdrop-blur of `12px` combined with a semi-transparent `surface` color. This allows the sage-green background to bleed through, making the app feel like a single, cohesive environment.

---

## 5. Components

### Buttons
*   **Primary:** High-pill shape (`rounded-full`). Use a subtle gradient of `primary` to `primary-dim`. No borders.
*   **Secondary:** `surface-container-highest` background with `on-surface` text.
*   **Collaborative Action:** Buttons that notify a partner should use a `tertiary-container` to signify a shared "social" action.

### Lists & Meal Logging
*   **Forbid Dividers:** Do not use lines between meal items. Use `spacing-3` (1rem) of vertical whitespace to separate items.
*   **Interactive Row:** On hover/tap, a list item should shift from `surface` to `surface-container-low`.

### Data Visualization (Macros)
*   **The "Shared Ring":** Visualization of macros should use thick, rounded strokes (`rounded-full`) with `primary`, `secondary`, and `tertiary` colors. 
*   **Contextual Glass:** Macro summaries should sit in a glassmorphic container at the top of the dashboard to feel "above" the daily log.

### Input Fields
*   **Styling:** Use a "bottom-only" focus state or a soft-filled `surface-variant`.
*   **Error States:** Use `error-container` for the background of the field and `error` for the text. Avoid "loud" reds; keep the tone muted to match the sanctuary aesthetic.

---

## 6. Do's and Don'ts

### Do
*   **Do** use asymmetrical layouts. For example, align the "Calories Remaining" display to the left while keeping the "Partner Progress" slightly offset to the right.
*   **Do** use the full range of `surface-container` tokens to create "rooms" within the app.
*   **Do** prioritize the `manrope` typography scale to convey importance, rather than bold colors.

### Don't
*   **Don't** use 1px solid borders. Ever.
*   **Don't** use pure black or pure grey for shadows. Always tint them with the `on-surface` green.
*   **Don't** crowd the interface. If a screen feels full, use a `surface-container` to group elements or add more whitespace from the `spacing-8` scale.
*   **Don't** use traditional "Material" cards with heavy shadows. We are aiming for an editorial, flat-yet-layered look.