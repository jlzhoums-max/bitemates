import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { signOutAction } from "@/app/auth/actions";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
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
        <form action={signOutAction}>
          <button
            type="submit"
            className="mt-4 rounded-full bg-surface-container px-5 py-2 text-sm font-medium text-on-surface transition hover:bg-surface-container-high"
          >
            Sign out
          </button>
        </form>
      </div>
    </main>
  );
}
