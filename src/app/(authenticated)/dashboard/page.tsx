import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const AUTO_USERNAME = /^user_[0-9a-f]{8}$/;

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", user.id)
    .single();

  if (profile && AUTO_USERNAME.test(profile.username)) {
    redirect("/onboarding/profile");
  }

  return (
    <main className="flex flex-1 flex-col items-center justify-center bg-background px-6">
      <div className="w-full max-w-md space-y-4 text-center">
        <h1 className="font-headline text-3xl font-extrabold text-on-surface">
          You&apos;re signed in
        </h1>
        <p className="text-sm text-on-surface-variant">
          Signed in as {user.email}
        </p>
        <p className="text-xs text-on-surface-variant">
          Real dashboard arrives in Phase 7. This page exists so the OAuth
          callback has somewhere to land.
        </p>
      </div>
    </main>
  );
}
