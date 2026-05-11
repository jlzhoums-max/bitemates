import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { GoalsForm } from "./form";

export default async function GoalsPage() {
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

  return (
    <main className="flex flex-1 flex-col bg-background px-6 py-10">
      <div className="mx-auto w-full max-w-xl">
        <GoalsForm initial={profile} />
      </div>
    </main>
  );
}
