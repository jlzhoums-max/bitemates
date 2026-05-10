"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const USERNAME_REGEX = /^[a-z0-9_]{3,20}$/;

export function OnboardingProfileForm({
  currentDisplayName,
}: {
  currentDisplayName: string;
}) {
  const supabase = createClient();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Prevent open-redirect: same-origin paths only.
  const rawNext = searchParams.get("next");
  const next =
    rawNext && rawNext.startsWith("/") && !rawNext.startsWith("//")
      ? rawNext
      : "/dashboard";

  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState(currentDisplayName);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!USERNAME_REGEX.test(username)) {
      setError(
        "Username must be 3–20 characters: lowercase letters, numbers, underscores only."
      );
      return;
    }
    if (!displayName.trim()) {
      setError("Please enter a display name.");
      return;
    }

    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setError("Session expired. Please sign in again.");
      setLoading(false);
      return;
    }

    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        username,
        display_name: displayName.trim(),
      })
      .eq("id", user.id);

    if (updateError) {
      setLoading(false);
      if (updateError.code === "23505") {
        setError("Username already taken. Please choose another.");
      } else {
        setError(updateError.message);
      }
      return;
    }

    router.push(next);
    router.refresh();
  }

  return (
    <main className="flex flex-1 flex-col items-center justify-center bg-background px-6 py-12">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="font-headline text-3xl font-extrabold tracking-tight text-on-surface">
            Welcome
          </h1>
          <p className="mt-2 text-sm text-on-surface-variant">
            Pick a username and confirm your display name to get started.
          </p>
        </div>

        {error && (
          <div className="rounded-2xl bg-error-container p-4 text-sm text-on-error-container">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="text"
            placeholder="Username (3–20 chars, a–z, 0–9, _)"
            value={username}
            onChange={(e) => setUsername(e.target.value.toLowerCase())}
            required
            disabled={loading}
            className="w-full rounded-2xl bg-surface-container-lowest px-4 py-3 text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
          />
          <input
            type="text"
            placeholder="Display name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            required
            disabled={loading}
            className="w-full rounded-2xl bg-surface-container-lowest px-4 py-3 text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-primary px-6 py-3 font-semibold text-on-primary transition hover:bg-primary-dim disabled:opacity-50"
          >
            {loading ? "Saving…" : "Continue"}
          </button>
        </form>
      </div>
    </main>
  );
}
