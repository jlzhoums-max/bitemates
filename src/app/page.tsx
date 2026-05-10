import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background">
      <h1 className="font-headline text-5xl font-extrabold tracking-tight text-on-surface">
        BiteMates
      </h1>
      <p className="mt-4 text-lg text-on-surface-variant">
        Your Shared Sanctuary for Nutrition
      </p>
      <Link
        href="/login"
        className="mt-8 text-sm font-medium text-primary hover:text-primary-dim hover:underline"
      >
        Sign in
      </Link>
    </div>
  );
}
