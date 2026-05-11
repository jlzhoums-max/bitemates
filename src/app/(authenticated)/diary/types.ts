export type MealCategory = "breakfast" | "lunch" | "dinner" | "snacks";

export const MEAL_CATEGORIES: MealCategory[] = [
  "breakfast",
  "lunch",
  "dinner",
  "snacks",
];

export type DiaryEntry = {
  id: string;
  date: string;
  meal_category: MealCategory;
  food_name: string;
  serving_size: string | null;
  serving_quantity: number;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g: number | null;
  sugar_g: number | null;
  sodium_mg: number | null;
  saturated_fat_g: number | null;
  cholesterol_mg: number | null;
  source: string;
  source_food_id: string | null;
  created_at: string;
};

export type DiaryProfile = {
  calorie_target: number;
  protein_pct: number;
  carbs_pct: number;
  fat_pct: number;
};

export type MealMeta = {
  key: MealCategory;
  label: string;
  icon: string;
};

export const MEALS: MealMeta[] = [
  { key: "breakfast", label: "Breakfast", icon: "breakfast_dining" },
  { key: "lunch", label: "Lunch", icon: "lunch_dining" },
  { key: "dinner", label: "Dinner", icon: "dinner_dining" },
  { key: "snacks", label: "Snacks", icon: "restaurant" },
];

export const MEAL_LABELS: Record<MealCategory, string> = {
  breakfast: "Breakfast",
  lunch: "Lunch",
  dinner: "Dinner",
  snacks: "Snacks",
};
