"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const supabase = createClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlError = searchParams.get("error");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(
    urlError ? decodeURIComponent(urlError) : null
  );
  const [loading, setLoading] = useState(false);

  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setLoading(false);
      if (signInError.message === "Invalid login credentials") {
        setError("Email or password is incorrect.");
      } else {
        setError(signInError.message);
      }
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  async function handleGoogle() {
    setError(null);
    setLoading(true);
    const { error: authError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (authError) {
      setLoading(false);
      setError(authError.message);
    }
  }

  return (
    <main className="flex flex-1 flex-col items-center justify-center bg-background px-6 py-12">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="font-headline text-3xl font-extrabold tracking-tight text-on-surface">
            BiteMates
          </h1>
          <p className="mt-2 text-sm text-on-surface-variant">
            Sign in to continue
          </p>
        </div>

        {error && (
          <div className="rounded-2xl bg-error-container p-4 text-sm text-on-error-container">
            {error}
          </div>
        )}

        <form onSubmit={handleEmailLogin} className="space-y-3">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
            className="w-full rounded-2xl bg-surface-container-lowest px-4 py-3 text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
            className="w-full rounded-2xl bg-surface-container-lowest px-4 py-3 text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-primary px-6 py-3 font-semibold text-on-primary transition hover:bg-primary-dim disabled:opacity-50"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <div className="text-center text-xs uppercase tracking-wider text-on-surface-variant">
          or
        </div>

        <button
          onClick={handleGoogle}
          disabled={loading}
          className="w-full rounded-full bg-surface-container px-6 py-3 font-semibold text-on-surface transition hover:bg-surface-container-high disabled:opacity-50"
        >
          {loading ? "Redirecting…" : "Continue with Google"}
        </button>

        <p className="text-center text-sm text-on-surface-variant">
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            className="font-medium text-primary hover:text-primary-dim hover:underline"
          >
            Sign up
          </Link>
        </p>
      </div>
    </main>
  );
}
