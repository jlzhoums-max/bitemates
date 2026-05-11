"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { signOutAction } from "@/app/auth/actions";

export function TopNav() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const onDocClick = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setMenuOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  return (
    <>
      <header className="sticky top-0 z-30 flex items-center justify-between bg-surface-container px-6 py-3">
        <Link
          href="/dashboard"
          className="font-headline text-xl font-extrabold tracking-tight text-on-surface"
        >
          BiteMates
        </Link>

        <div ref={menuRef} className="relative hidden md:block">
          <button
            type="button"
            aria-label="Settings"
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
            className="flex h-10 w-10 items-center justify-center rounded-full text-on-surface transition hover:bg-surface-container-high"
          >
            <span className="material-symbols-outlined">settings</span>
          </button>
          {menuOpen && (
            <div
              role="menu"
              className="absolute right-0 top-12 w-44 overflow-hidden rounded-2xl bg-surface-container-lowest py-1 shadow-xl"
            >
              <Link
                href="/goals"
                role="menuitem"
                onClick={() => setMenuOpen(false)}
                className="block px-4 py-2.5 text-sm text-on-surface transition hover:bg-surface-container"
              >
                Goals
              </Link>
              <form action={signOutAction}>
                <button
                  type="submit"
                  role="menuitem"
                  className="w-full px-4 py-2.5 text-left text-sm text-on-surface transition hover:bg-surface-container"
                >
                  Sign out
                </button>
              </form>
            </div>
          )}
        </div>

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
            <div className="space-y-2">
              <Link
                href="/goals"
                onClick={() => setDrawerOpen(false)}
                className="block w-full rounded-full bg-surface-container px-5 py-3 text-left text-sm font-medium text-on-surface transition hover:bg-surface-container-high"
              >
                Goals
              </Link>
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
        </div>
      )}
    </>
  );
}
