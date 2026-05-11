"use client";

import { useEffect, useState } from "react";
import { ManualEntryModal, type ManualPayload } from "./manual-modal";

type SearchResult = {
  source: "usda";
  source_food_id: string;
  food_name: string;
  brand_name: string | null;
  data_type: string;
  serving_size: string | null;
  calories: number | null;
  protein_g: number | null;
  carbs_g: number | null;
  fat_g: number | null;
  fiber_g: number | null;
  sugar_g: number | null;
  sodium_mg: number | null;
  saturated_fat_g: number | null;
  cholesterol_mg: number | null;
  nutrition_full: unknown;
};

function fmtCals(n: number | null): string {
  if (n == null) return "—";
  return String(Math.round(n));
}

function fmtG(n: number | null): string {
  if (n == null) return "—";
  if (n === 0) return "0";
  if (n < 10) return n.toFixed(1);
  return String(Math.round(n));
}

export function FoodSearch() {
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [manualOpen, setManualOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(query.trim()), 300);
    return () => clearTimeout(id);
  }, [query]);

  useEffect(() => {
    if (!debounced) return;
    const controller = new AbortController();
    fetch(`/api/foods/search?q=${encodeURIComponent(debounced)}`, {
      signal: controller.signal,
    })
      .then(async (r) => {
        if (!r.ok) throw new Error(`status_${r.status}`);
        return (await r.json()) as SearchResult[];
      })
      .then((data) => {
        setResults(data);
        setLoading(false);
      })
      .catch((err: unknown) => {
        if (err instanceof Error && err.name === "AbortError") return;
        setError("Couldn't reach the food database. Check your connection.");
        setLoading(false);
      });
    return () => controller.abort();
  }, [debounced, attempt]);

  function onQueryChange(value: string) {
    setQuery(value);
    if (!value.trim()) {
      setResults([]);
      setError(null);
      setLoading(false);
    } else {
      setLoading(true);
      setError(null);
    }
  }

  function retry() {
    setLoading(true);
    setError(null);
    setAttempt((a) => a + 1);
  }

  function onAdd(r: SearchResult) {
    console.log("ADD payload (Phase 3.4 will insert):", r);
  }

  function onManualSave(payload: ManualPayload) {
    console.log("ADD payload (manual, Phase 3.4 will insert):", payload);
    setManualOpen(false);
    setToast("Saved");
    setTimeout(() => setToast(null), 2000);
  }

  const trimmed = query.trim();
  const hasInput = trimmed.length > 0;
  const showEmpty = !hasInput;
  const showLoading = hasInput && loading;
  const showError = hasInput && !loading && !!error;
  const showNoResults =
    hasInput && !loading && !error && results.length === 0 && debounced === trimmed;
  const showResults = hasInput && !loading && !error && results.length > 0;

  return (
    <>
      <div className="relative mb-6">
        <span
          aria-hidden
          className="material-symbols-outlined pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant"
        >
          search
        </span>
        <input
          type="search"
          placeholder="Search foods..."
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          aria-label="Search foods"
          className="w-full rounded-full bg-surface-container py-3 pl-12 pr-4 text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {showEmpty && (
        <p className="py-8 text-center text-sm text-on-surface-variant">
          Start typing to search foods.
        </p>
      )}

      {showLoading && (
        <div className="space-y-3" aria-busy="true" aria-live="polite">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-24 animate-pulse rounded-2xl bg-surface-container"
            />
          ))}
        </div>
      )}

      {showError && (
        <div
          role="alert"
          className="flex flex-col items-start gap-3 rounded-2xl bg-error-container px-4 py-3 text-sm text-on-error-container sm:flex-row sm:items-center sm:justify-between"
        >
          <span>{error ?? ""}</span>
          <button
            type="button"
            onClick={retry}
            className="rounded-full bg-on-error-container px-4 py-1.5 text-sm font-semibold text-error-container transition hover:opacity-90"
          >
            Retry
          </button>
        </div>
      )}

      {showNoResults && (
        <p className="py-8 text-center text-sm text-on-surface-variant">
          No foods found for &ldquo;{trimmed}&rdquo;.
        </p>
      )}

      {showResults && (
        <ul className="space-y-3">
          {results.map((r) => {
            const servingLabel = r.serving_size ?? "100g";
            return (
              <li
                key={`${r.source_food_id}-${r.data_type}`}
                className="flex items-start gap-3 rounded-2xl bg-surface-container-lowest p-4"
              >
                <div className="min-w-0 flex-1">
                  <div className="truncate font-medium text-on-surface">
                    {r.food_name}
                  </div>
                  {r.brand_name && (
                    <div className="truncate text-xs text-on-surface-variant">
                      {r.brand_name}
                    </div>
                  )}
                  <div className="mt-2 text-sm text-on-surface-variant">
                    {fmtCals(r.calories)} cal · {fmtG(r.protein_g)}g P ·{" "}
                    {fmtG(r.carbs_g)}g C · {fmtG(r.fat_g)}g F
                    <span className="ml-1 italic">per {servingLabel}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onAdd(r)}
                  aria-label={`Add ${r.food_name}`}
                  className="flex h-10 shrink-0 items-center gap-1 rounded-full bg-primary px-4 text-sm font-semibold text-on-primary transition hover:bg-primary-dim"
                >
                  <span className="material-symbols-outlined text-base">
                    add
                  </span>
                  Add
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {!loading && (
        <button
          type="button"
          onClick={() => setManualOpen(true)}
          className="mx-auto mt-6 block text-sm text-on-surface-variant underline-offset-2 hover:text-on-surface hover:underline"
        >
          Can&apos;t find it? Add manually
        </button>
      )}

      {manualOpen && (
        <ManualEntryModal
          initialName={trimmed}
          onClose={() => setManualOpen(false)}
          onSave={onManualSave}
        />
      )}

      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-6 left-1/2 z-40 -translate-x-1/2 rounded-full bg-inverse-surface px-5 py-2 text-sm font-medium text-inverse-on-surface shadow-lg"
        >
          {toast}
        </div>
      )}
    </>
  );
}
