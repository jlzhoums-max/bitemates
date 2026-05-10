"use client";

import { useState } from "react";
import Link from "next/link";
import { signOutAction } from "@/app/auth/actions";

export function TopNav() {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-30 flex items-center justify-between bg-surface-container px-6 py-3">
        <Link
          href="/dashboard"
          className="font-headline text-xl font-extrabold tracking-tight text-on-surface"
        >
          BiteMates
        </Link>

        <form action={signOutAction} className="hidden md:block">
          <button
            type="submit"
            className="rounded-full bg-surface-container-high px-4 py-2 text-sm font-medium text-on-surface transition hover:bg-surface-container-highest"
          >
            Sign out
          </button>
        </form>

        <button
          type="button"
          aria-label="Open menu"
          aria-expanded={drawerOpen}
          onClick={() => setDrawerOpen(true)}
          className="rounded-full p-2 text-on-surface transition hover:bg-surface-container-high md:hidden"
        >
          <span className="material-symbols-outlined">menu</span>
        </button>
      </header>

      {drawerOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setDrawerOpen(false)}
            className="absolute inset-0 bg-inverse-surface/40"
          />
          <div className="absolute right-0 top-0 h-full w-72 bg-surface-container-lowest p-6 shadow-xl">
            <div className="mb-6 flex items-center justify-between">
              <span className="font-headline text-lg font-bold text-on-surface">
                Menu
              </span>
              <button
                type="button"
                aria-label="Close menu"
                onClick={() => setDrawerOpen(false)}
                className="rounded-full p-2 text-on-surface transition hover:bg-surface-container"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form action={signOutAction}>
              <button
                type="submit"
                className="w-full rounded-full bg-surface-container px-5 py-3 text-left text-sm font-medium text-on-surface transition hover:bg-surface-container-high"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
