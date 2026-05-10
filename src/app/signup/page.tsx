"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

const USERNAME_REGEX = /^[a-z0-9_]{3,20}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function SignupPage() {
  const supabase = createClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlError = searchParams.get("error");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState<string | null>(
    urlError ? decodeURIComponent(urlError) : null
  );
  const [loading, setLoading] = useState(false);

  async function handleEmailSignup(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!EMAIL_REGEX.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (!displayName.trim()) {
      setError("Please enter a display name.");
      return;
    }
    if (!USERNAME_REGEX.test(username)) {
      setError(
        "Username must be 3–20 characters: lowercase letters, numbers, underscores only."
      );
      return;
    }

    setLoading(true);
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
          display_name: displayName.trim(),
        },
      },
    });

    if (signUpError) {
      setLoading(false);
      const msg = signUpError.message.toLowerCase();
      if (msg.includes("username") || msg.includes("duplicate")) {
        setError("Username already taken. Please choose another.");
      } else {
        setError(signUpError.message);
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
            Create your account
          </p>
        </div>

        {error && (
          <div className="rounded-2xl bg-error-container p-4 text-sm text-on-error-container">
            {error}
          </div>
        )}

        <form onSubmit={handleEmailSignup} className="space-y-3">
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
            placeholder="Password (min 6 characters)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
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
          <input
            type="text"
            placeholder="Username (3–20 chars, a–z, 0–9, _)"
            value={username}
            onChange={(e) => setUsername(e.target.value.toLowerCase())}
            required
            disabled={loading}
            className="w-full rounded-2xl bg-surface-container-lowest px-4 py-3 text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-primary px-6 py-3 font-semibold text-on-primary transition hover:bg-primary-dim disabled:opacity-50"
          >
            {loading ? "Creating account…" : "Create account"}
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
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-primary hover:text-primary-dim hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}