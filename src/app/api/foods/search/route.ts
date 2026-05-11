import { NextResponse } from "next/server";

const USDA_ENDPOINT = "https://api.nal.usda.gov/fdc/v1/foods/search";
const PAGE_SIZE = 25;
const RESULT_CAP = 20;

const NUTRIENT_MAP: Record<number, NutrientKey> = {
  // Energy (1008/2047/2048) handled separately in normalize() with priority fallback
  // + macro-derived last resort. Not in this map because first-write-wins is wrong here.
  1003: "protein_g",
  1004: "fat_g",
  1005: "carbs_g",
  1079: "fiber_g",
  2000: "sugar_g",
  1093: "sodium_mg",
  1258: "saturated_fat_g",
  1253: "cholesterol_mg",
};

// USDA occasionally reports macros as small negatives (e.g. "Carbohydrate, by difference"
// can land at -0.4 g from rounding in the source data). Real values are never negative.
const NEGATIVE_CLAMP_KEYS: NutrientKey[] = [
  "protein_g",
  "carbs_g",
  "fat_g",
  "fiber_g",
  "sugar_g",
  "sodium_mg",
  "saturated_fat_g",
  "cholesterol_mg",
];

const DATA_TYPE_RANK: Record<string, number> = {
  Foundation: 0,
  "SR Legacy": 1,
  "Survey (FNDDS)": 2,
  Branded: 3,
};

type NutrientKey =
  | "calories"
  | "protein_g"
  | "carbs_g"
  | "fat_g"
  | "fiber_g"
  | "sugar_g"
  | "sodium_mg"
  | "saturated_fat_g"
  | "cholesterol_mg";

type USDAFoodNutrient = {
  nutrientId?: number;
  nutrientName?: string;
  nutrientNumber?: string;
  unitName?: string;
  value?: number;
  nutrient?: { id?: number; name?: string };
};

type USDAFood = {
  fdcId: number;
  description?: string;
  dataType?: string;
  brandName?: string;
  brandOwner?: string;
  servingSize?: number;
  servingSizeUnit?: string;
  householdServingFullText?: string;
  foodNutrients?: USDAFoodNutrient[];
};

type USDAResponse = {
  totalHits?: number;
  foods?: USDAFood[];
};

export type SearchResult = {
  source: "usda";
  source_food_id: string;
  food_name: string;
  brand_name: string | null;
  data_type: string;
  serving_size: string | null;
  calories: number | null;
  protein_g: number | null;
  carbs_g: number | null;
  fat_g: number | null;
  fiber_g: number | null;
  sugar_g: number | null;
  sodium_mg: number | null;
  saturated_fat_g: number | null;
  cholesterol_mg: number | null;
  nutrition_full: { foodNutrients: USDAFoodNutrient[] };
};

function roundTo(n: number, digits: number): number {
  const f = 10 ** digits;
  return Math.round(n * f) / f;
}

function normalize(food: USDAFood): SearchResult {
  const nutrients: Record<NutrientKey, number | null> = {
    calories: null,
    protein_g: null,
    carbs_g: null,
    fat_g: null,
    fiber_g: null,
    sugar_g: null,
    sodium_mg: null,
    saturated_fat_g: null,
    cholesterol_mg: null,
  };

  const energyCandidates: Record<number, number> = {};

  const arr = food.foodNutrients ?? [];
  for (const n of arr) {
    const id = n.nutrientId ?? n.nutrient?.id;
    if (id == null) continue;
    if (typeof n.value !== "number" || !Number.isFinite(n.value)) continue;

    // Energy IDs collected and resolved after the loop with a priority fallback.
    //  1008 — Energy KCAL (Branded, SR Legacy)
    //  2047 — Energy (Atwater General Factors) KCAL (Foundation)
    //  2048 — Energy (Atwater Specific Factors) KCAL (Foundation)
    //  1062 — Energy kJ — deliberately ignored (different unit; no conversion).
    if (id === 1008 || id === 2047 || id === 2048) {
      if ((n.unitName ?? "").toUpperCase() === "KCAL") {
        energyCandidates[id] = n.value;
      }
      continue;
    }

    const key = NUTRIENT_MAP[id];
    if (!key) continue;
    nutrients[key] = roundTo(n.value, 2);
  }

  // Clamp negative rounding artifacts to 0 BEFORE macro-derived energy reads them.
  for (const k of NEGATIVE_CLAMP_KEYS) {
    const v = nutrients[k];
    if (v != null && v < 0) nutrients[k] = 0;
  }

  // Energy fallback chain: precomputed kcal first, macro-derived only when all three
  // macros are present (no fabricating from partial data).
  const energy =
    energyCandidates[1008] ?? energyCandidates[2047] ?? energyCandidates[2048];
  if (energy != null) {
    nutrients.calories = Math.round(energy);
  } else if (
    nutrients.protein_g != null &&
    nutrients.carbs_g != null &&
    nutrients.fat_g != null
  ) {
    nutrients.calories = Math.round(
      nutrients.protein_g * 4 + nutrients.carbs_g * 4 + nutrients.fat_g * 9
    );
  }

  let serving_size: string | null = null;
  if (food.householdServingFullText && food.householdServingFullText.trim()) {
    serving_size = food.householdServingFullText.trim();
  } else if (typeof food.servingSize === "number") {
    const unit = food.servingSizeUnit ?? "";
    serving_size = `${food.servingSize} ${unit}`.trim();
  }

  return {
    source: "usda",
    source_food_id: String(food.fdcId),
    food_name: food.description ?? "Unknown food",
    brand_name: food.brandName ?? food.brandOwner ?? null,
    data_type: food.dataType ?? "Unknown",
    serving_size,
    ...nutrients,
    nutrition_full: { foodNutrients: arr },
  };
}

function rankFor(dataType: string): number {
  return DATA_TYPE_RANK[dataType] ?? 99;
}

// USDA occasionally returns Foundation rows (e.g. fdcId 2759004 "Lunchmeat, chicken
// breast, sliced") with 70+ micronutrient/fatty-acid entries but no energy, protein,
// carbs, or fat. Nothing to render in a result card, so drop before sort + slice.
function hasAnyNutrition(r: SearchResult): boolean {
  return (
    r.calories != null ||
    r.protein_g != null ||
    r.carbs_g != null ||
    r.fat_g != null
  );
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim();
  if (!q) {
    return NextResponse.json({ error: "missing_query" }, { status: 400 });
  }

  const apiKey = process.env.USDA_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "server_misconfigured" },
      { status: 500 }
    );
  }

  const url = new URL(USDA_ENDPOINT);
  url.searchParams.set("query", q);
  url.searchParams.set("pageSize", String(PAGE_SIZE));
  url.searchParams.set("api_key", apiKey);

  let upstream: Response;
  try {
    upstream = await fetch(url, { cache: "no-store" });
  } catch {
    return NextResponse.json({ error: "usda_unreachable" }, { status: 500 });
  }

  if (!upstream.ok) {
    return NextResponse.json(
      { error: "usda_error", status: upstream.status },
      { status: 500 }
    );
  }

  let data: USDAResponse;
  try {
    data = (await upstream.json()) as USDAResponse;
  } catch {
    return NextResponse.json({ error: "usda_invalid_json" }, { status: 500 });
  }

  const normalized = (data.foods ?? []).map(normalize).filter(hasAnyNutrition);
  normalized.sort((a, b) => rankFor(a.data_type) - rankFor(b.data_type));
  return NextResponse.json(normalized.slice(0, RESULT_CAP));
}
