import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const CAL_MIN = 1000;
const CAL_MAX = 5000;

const PCT_BOUNDS = {
  protein_pct: [5, 60] as const,
  carbs_pct: [5, 70] as const,
  fat_pct: [5, 60] as const,
};

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("calorie_target, protein_pct, carbs_pct, fat_pct")
    .eq("id", user.id)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "profile_not_found" }, { status: 404 });
  }

  return NextResponse.json(data);
}

export async function PUT(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const b = body as Record<string, unknown>;
  const { calorie_target, protein_pct, carbs_pct, fat_pct } = b;

  if (
    !Number.isInteger(calorie_target) ||
    !Number.isInteger(protein_pct) ||
    !Number.isInteger(carbs_pct) ||
    !Number.isInteger(fat_pct)
  ) {
    return NextResponse.json(
      { error: "fields_must_be_integers" },
      { status: 400 }
    );
  }

  const c = calorie_target as number;
  const p = protein_pct as number;
  const carb = carbs_pct as number;
  const f = fat_pct as number;

  if (c < CAL_MIN || c > CAL_MAX) {
    return NextResponse.json(
      { error: `calorie_target must be between ${CAL_MIN} and ${CAL_MAX}` },
      { status: 400 }
    );
  }

  for (const [key, value] of [
    ["protein_pct", p],
    ["carbs_pct", carb],
    ["fat_pct", f],
  ] as const) {
    const [min, max] = PCT_BOUNDS[key];
    if (value < min || value > max) {
      return NextResponse.json(
        { error: `${key} must be between ${min} and ${max}` },
        { status: 400 }
      );
    }
  }

  if (p + carb + f !== 100) {
    return NextResponse.json(
      { error: "protein_pct + carbs_pct + fat_pct must equal 100" },
      { status: 400 }
    );
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      calorie_target: c,
      protein_pct: p,
      carbs_pct: carb,
      fat_pct: f,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (error) {
    return NextResponse.json({ error: "update_failed" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
