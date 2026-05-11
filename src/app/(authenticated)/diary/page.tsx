import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { FoodSearch } from "./search";

export default async function DiaryPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <main className="flex flex-1 flex-col bg-background px-6 py-10">
      <div className="mx-auto w-full max-w-2xl">
        <h1 className="mb-6 font-headline text-3xl font-extrabold text-on-surface">
          Diary
        </h1>
        <FoodSearch />
      </div>
    </main>
  );
}
