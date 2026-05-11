import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DiaryView } from "./diary-view";
import {
  endOfWeek,
  fmtLocal,
  isYMD,
  parseLocal,
  startOfWeek,
  todayLocal,
} from "./date-utils";
import type { DiaryEntry } from "./types";

export default async function DiaryPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const params = await searchParams;
  const date = isYMD(params.date) ? params.date : todayLocal();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("calorie_target, protein_pct, carbs_pct, fat_pct")
    .eq("id", user.id)
    .single();

  if (!profile) redirect("/onboarding/profile");

  const { data: entries } = await supabase
    .from("food_log_entries")
    .select("*")
    .eq("user_id", user.id)
    .eq("date", date)
    .order("created_at", { ascending: true });

  const selected = parseLocal(date);
  const weekStart = fmtLocal(startOfWeek(selected));
  const weekEnd = fmtLocal(endOfWeek(selected));

  const { data: weekDates } = await supabase
    .from("food_log_entries")
    .select("date")
    .eq("user_id", user.id)
    .gte("date", weekStart)
    .lte("date", weekEnd);

  const datesWithEntries = Array.from(
    new Set((weekDates ?? []).map((r: { date: string }) => r.date))
  );

  return (
    <main className="flex flex-1 flex-col bg-background px-6 py-6">
      <div className="mx-auto w-full max-w-2xl">
        <DiaryView
          date={date}
          profile={profile}
          entries={(entries ?? []) as DiaryEntry[]}
          datesWithEntries={datesWithEntries}
        />
      </div>
    </main>
  );
}
