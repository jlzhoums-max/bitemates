"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { isYMD } from "./date-utils";

const MEAL_CATEGORIES = ["breakfast", "lunch", "dinner", "snacks"] as const;

export type AddEntryInput = {
  date: string;
  meal_category: (typeof MEAL_CATEGORIES)[number];
  food_name: string;
  serving_size: string | null;
  serving_quantity: number;
  // Values are POST-scaled (already multiplied by serving_quantity on the
  // client). Server validates ranges but trusts the math.
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g: number | null;
  sugar_g: number | null;
  sodium_mg: number | null;
  saturated_fat_g: number | null;
  cholesterol_mg: number | null;
  nutrition_full: unknown | null;
  source: "usda" | "manual";
  source_food_id: string | null;
};

export type ActionResult = { ok: true } | { error: string };

function isFiniteNonNegative(n: unknown): n is number {
  return typeof n === "number" && Number.isFinite(n) && n >= 0;
}

export async function addEntry(input: AddEntryInput): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "unauthorized" };

  if (!isYMD(input.date)) return { error: "invalid_date" };
  if (!MEAL_CATEGORIES.includes(input.meal_category)) {
    return { error: "invalid_meal_category" };
  }
  if (!input.food_name?.trim()) return { error: "food_name_required" };
  if (!isFiniteNonNegative(input.serving_quantity) || input.serving_quantity <= 0) {
    return { error: "invalid_serving_quantity" };
  }
  if (!isFiniteNonNegative(input.calories) || input.calories > 100000) {
    return { error: "invalid_calories" };
  }
  for (const v of [input.protein_g, input.carbs_g, input.fat_g]) {
    if (!isFiniteNonNegative(v)) return { error: "invalid_macro" };
  }
  for (const v of [
    input.fiber_g,
    input.sugar_g,
    input.sodium_mg,
    input.saturated_fat_g,
    input.cholesterol_mg,
  ]) {
    if (v == null) continue;
    if (!isFiniteNonNegative(v)) return { error: "invalid_micronutrient" };
  }
  if (input.source !== "usda" && input.source !== "manual") {
    return { error: "invalid_source" };
  }

  const { error } = await supabase.from("food_log_entries").insert({
    user_id: user.id,
    date: input.date,
    meal_category: input.meal_category,
    food_name: input.food_name.trim(),
    serving_size: input.serving_size,
    serving_quantity: input.serving_quantity,
    calories: input.calories,
    protein_g: input.protein_g,
    carbs_g: input.carbs_g,
    fat_g: input.fat_g,
    fiber_g: input.fiber_g,
    sugar_g: input.sugar_g,
    sodium_mg: input.sodium_mg,
    saturated_fat_g: input.saturated_fat_g,
    cholesterol_mg: input.cholesterol_mg,
    nutrition_full: input.nutrition_full,
    source: input.source,
    source_food_id: input.source_food_id,
  });

  if (error) return { error: error.message };
  revalidatePath("/diary");
  return { ok: true };
}

export async function deleteEntry(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "unauthorized" };

  if (typeof id !== "string" || !id) return { error: "invalid_id" };

  // RLS denies non-owner deletes; explicit user_id filter is belt + suspenders.
  const { error } = await supabase
    .from("food_log_entries")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { error: error.message };
  revalidatePath("/diary");
  return { ok: true };
}
