"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ManualEntryModal, type ManualPayload } from "./manual-modal";
import { addEntry, type ActionResult, type AddEntryInput } from "./actions";
import type { MealCategory } from "./types";

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

type Step = { kind: "search" } | { kind: "quantity"; result: SearchResult };

type Props = {
  date: string;
  mealCategory: MealCategory;
  mealLabel: string;
  onClose: () => void;
  onSaved: () => void;
};

export function LogModal({
  date,
  mealCategory,
  mealLabel,
  onClose,
  onSaved,
}: Props) {
  const router = useRouter();
  const [step, setStep] = useState<Step>({ kind: "search" });
  const [manualOpen, setManualOpen] = useState(false);

  // search state
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  // quantity state
  const [quantity, setQuantity] = useState("1");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (step.kind === "search") searchInputRef.current?.focus();
  }, [step.kind]);

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
        setSearchError("Couldn't reach the food database. Check your connection.");
        setLoading(false);
      });
    return () => controller.abort();
  }, [debounced, attempt]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (manualOpen) return; // sub-modal handles its own Esc
      if (step.kind === "quantity") {
        setStep({ kind: "search" });
      } else {
        onClose();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [manualOpen, step.kind, onClose]);

  function onQueryChange(value: string) {
    setQuery(value);
    if (!value.trim()) {
      setResults([]);
      setSearchError(null);
      setLoading(false);
    } else {
      setLoading(true);
      setSearchError(null);
    }
  }

  function retry() {
    setLoading(true);
    setSearchError(null);
    setAttempt((a) => a + 1);
  }

  function startQuantityFor(r: SearchResult) {
    setStep({ kind: "quantity", result: r });
    setQuantity("1");
    setSubmitError(null);
  }

  function bumpQuantity(delta: number) {
    setQuantity((prev) => {
      const n = Number(prev);
      const base = Number.isFinite(n) ? n : 1;
      const next = Math.max(0.1, Math.min(99, base + delta));
      return String(Math.round(next * 100) / 100);
    });
  }

  function onQuantityBlur() {
    const n = Number(quantity);
    if (!Number.isFinite(n) || n < 0.1) setQuantity("0.1");
    else if (n > 99) setQuantity("99");
  }

  function confirmQuantity() {
    if (step.kind !== "quantity") return;
    const q = Number(quantity);
    if (!Number.isFinite(q) || q <= 0 || q > 99) return;

    const r = step.result;
    const scale = (v: number | null): number | null =>
      v == null ? null : v * q;
    const scaleRequired = (v: number | null): number =>
      v == null ? 0 : v * q;

    const payload: AddEntryInput = {
      date,
      meal_category: mealCategory,
      food_name: r.food_name,
      serving_size: r.serving_size ?? "100g",
      serving_quantity: q,
      calories: scaleRequired(r.calories),
      protein_g: scaleRequired(r.protein_g),
      carbs_g: scaleRequired(r.carbs_g),
      fat_g: scaleRequired(r.fat_g),
      fiber_g: scale(r.fiber_g),
      sugar_g: scale(r.sugar_g),
      sodium_mg: scale(r.sodium_mg),
      saturated_fat_g: scale(r.saturated_fat_g),
      cholesterol_mg: scale(r.cholesterol_mg),
      nutrition_full: r.nutrition_full ?? null,
      source: "usda",
      source_food_id: r.source_food_id,
    };

    setSubmitError(null);
    startTransition(async () => {
      const result = await addEntry(payload);
      if ("error" in result) {
        setSubmitError(result.error);
        return;
      }
      router.refresh();
      onSaved();
    });
  }

  async function handleManualSave(
    payload: ManualPayload
  ): Promise<ActionResult> {
    const q = payload.serving_quantity;
    const scale = (v: number | null): number | null =>
      v == null ? null : v * q;
    const input: AddEntryInput = {
      date,
      meal_category: mealCategory,
      food_name: payload.food_name,
      serving_size: payload.serving_size,
      serving_quantity: q,
      calories: payload.calories * q,
      protein_g: (payload.protein_g ?? 0) * q,
      carbs_g: (payload.carbs_g ?? 0) * q,
      fat_g: (payload.fat_g ?? 0) * q,
      fiber_g: scale(payload.fiber_g),
      sugar_g: scale(payload.sugar_g),
      sodium_mg: scale(payload.sodium_mg),
      saturated_fat_g: scale(payload.saturated_fat_g),
      cholesterol_mg: scale(payload.cholesterol_mg),
      nutrition_full: null,
      source: "manual",
      source_food_id: null,
    };
    const result = await addEntry(input);
    if ("ok" in result) {
      setManualOpen(false);
      router.refresh();
      onSaved();
    }
    return result;
  }

  const trimmed = query.trim();
  const hasInput = trimmed.length > 0;
  const showEmpty = !hasInput;
  const showLoading = hasInput && loading;
  const showError = hasInput && !loading && !!searchError;
  const showNoResults =
    hasInput &&
    !loading &&
    !searchError &&
    results.length === 0 &&
    debounced === trimmed;
  const showResults =
    hasInput && !loading && !searchError && results.length > 0;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="log-title"
      className="fixed inset-0 z-40 flex items-end justify-center sm:items-center sm:p-6"
    >
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-inverse-surface/40"
      />
      <div className="relative flex max-h-[92vh] w-full max-w-lg flex-col rounded-t-3xl bg-surface-container-lowest sm:max-h-[90vh] sm:rounded-2xl">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            {step.kind === "quantity" && (
              <button
                type="button"
                aria-label="Back to search"
                onClick={() => setStep({ kind: "search" })}
                className="rounded-full p-2 text-on-surface transition hover:bg-surface-container"
              >
                <span className="material-symbols-outlined">arrow_back</span>
              </button>
            )}
            <h2
              id="log-title"
              className="font-headline text-xl font-extrabold text-on-surface"
            >
              {step.kind === "quantity" ? "How much?" : `Add to ${mealLabel}`}
            </h2>
          </div>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="rounded-full p-2 text-on-surface transition hover:bg-surface-container"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {step.kind === "search" && (
          <>
            <div className="px-6 pb-3">
              <div className="relative">
                <span
                  aria-hidden
                  className="material-symbols-outlined pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant"
                >
                  search
                </span>
                <input
                  ref={searchInputRef}
                  type="search"
                  placeholder="Search foods..."
                  value={query}
                  onChange={(e) => onQueryChange(e.target.value)}
                  aria-label="Search foods"
                  className="w-full rounded-full bg-surface-container py-3 pl-12 pr-4 text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto px-6 pb-2">
              {showEmpty && (
                <p className="py-8 text-center text-sm text-on-surface-variant">
                  Start typing to search foods.
                </p>
              )}

              {showLoading && (
                <div className="space-y-3" aria-busy="true">
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
                  <span>{searchError}</span>
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
                    const serving = r.serving_size ?? "100g";
                    return (
                      <li
                        key={`${r.source_food_id}-${r.data_type}`}
                        className="flex items-start gap-3 rounded-2xl bg-surface-container p-4"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-sm font-medium text-on-surface">
                            {r.food_name}
                          </div>
                          {r.brand_name && (
                            <div className="truncate text-xs text-on-surface-variant">
                              {r.brand_name}
                            </div>
                          )}
                          <div className="mt-1 text-xs text-on-surface-variant">
                            {fmtCals(r.calories)} cal · {fmtG(r.protein_g)}g P ·{" "}
                            {fmtG(r.carbs_g)}g C · {fmtG(r.fat_g)}g F
                            <span className="ml-1 italic">per {serving}</span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => startQuantityFor(r)}
                          aria-label={`Add ${r.food_name}`}
                          className="flex h-9 shrink-0 items-center gap-1 rounded-full bg-primary px-3 text-sm font-semibold text-on-primary transition hover:bg-primary-dim"
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
            </div>

            <div className="px-6 py-4">
              <button
                type="button"
                onClick={() => setManualOpen(true)}
                className="mx-auto block text-sm text-on-surface-variant underline-offset-2 hover:text-on-surface hover:underline"
              >
                Can&apos;t find it? Add manually
              </button>
            </div>
          </>
        )}

        {step.kind === "quantity" && (
          <QuantityStep
            result={step.result}
            quantity={quantity}
            onQuantityChange={setQuantity}
            onBlur={onQuantityBlur}
            onBump={bumpQuantity}
            onConfirm={confirmQuantity}
            onCancel={() => setStep({ kind: "search" })}
            pending={pending}
            submitError={submitError}
          />
        )}
      </div>

      {manualOpen && (
        <ManualEntryModal
          initialName={trimmed}
          onClose={() => setManualOpen(false)}
          onSave={handleManualSave}
        />
      )}
    </div>
  );
}

function QuantityStep({
  result,
  quantity,
  onQuantityChange,
  onBlur,
  onBump,
  onConfirm,
  onCancel,
  pending,
  submitError,
}: {
  result: SearchResult;
  quantity: string;
  onQuantityChange: (v: string) => void;
  onBlur: () => void;
  onBump: (d: number) => void;
  onConfirm: () => void;
  onCancel: () => void;
  pending: boolean;
  submitError: string | null;
}) {
  const serving = result.serving_size ?? "100g";
  const q = Number(quantity);
  const validQ = Number.isFinite(q) && q >= 0.1 && q <= 99;

  const scaledCals = result.calories != null && validQ ? result.calories * q : null;
  const scaledP = result.protein_g != null && validQ ? result.protein_g * q : null;
  const scaledC = result.carbs_g != null && validQ ? result.carbs_g * q : null;
  const scaledF = result.fat_g != null && validQ ? result.fat_g * q : null;

  return (
    <>
      <div className="flex-1 overflow-y-auto px-6 pb-2">
        <div className="rounded-2xl bg-surface-container p-4">
          <div className="text-sm font-medium text-on-surface">
            {result.food_name}
          </div>
          {result.brand_name && (
            <div className="text-xs text-on-surface-variant">
              {result.brand_name}
            </div>
          )}
          <div className="mt-3 text-xs uppercase tracking-wider text-on-surface-variant">
            Per {serving}
          </div>
          <div className="text-sm text-on-surface">
            {fmtCals(result.calories)} cal · {fmtG(result.protein_g)}g P ·{" "}
            {fmtG(result.carbs_g)}g C · {fmtG(result.fat_g)}g F
          </div>
        </div>

        <div className="mt-5 flex items-center justify-center gap-3">
          <button
            type="button"
            aria-label="Decrease by 0.5"
            onClick={() => onBump(-0.5)}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-container text-on-surface transition hover:bg-surface-container-high"
          >
            <span className="material-symbols-outlined">remove</span>
          </button>
          <div className="flex flex-col items-center">
            <input
              type="number"
              inputMode="decimal"
              step="any"
              min={0.1}
              max={99}
              value={quantity}
              onChange={(e) => onQuantityChange(e.target.value)}
              onBlur={onBlur}
              aria-label="Servings"
              className="w-24 bg-transparent text-center font-headline text-4xl font-extrabold text-on-surface focus:outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            />
            <span className="text-xs text-on-surface-variant">servings</span>
          </div>
          <button
            type="button"
            aria-label="Increase by 0.5"
            onClick={() => onBump(0.5)}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-container text-on-surface transition hover:bg-surface-container-high"
          >
            <span className="material-symbols-outlined">add</span>
          </button>
        </div>

        <div className="mt-5 rounded-2xl bg-primary-container p-4 text-center text-sm text-on-primary-container">
          <span className="font-medium">
            {validQ ? `${quantity} servings` : "—"}
          </span>{" "}
          ={" "}
          <span className="font-semibold">
            {fmtCals(scaledCals)} cal · {fmtG(scaledP)}g P ·{" "}
            {fmtG(scaledC)}g C · {fmtG(scaledF)}g F
          </span>
        </div>
      </div>

      {submitError && (
        <div
          role="alert"
          className="mx-6 mb-2 rounded-2xl bg-error-container px-4 py-2 text-xs text-on-error-container"
        >
          {submitError}
        </div>
      )}

      <div className="flex justify-end gap-2 px-6 py-4">
        <button
          type="button"
          onClick={onCancel}
          disabled={pending}
          className="rounded-full bg-surface-container px-5 py-2 text-sm font-medium text-on-surface transition hover:bg-surface-container-high disabled:opacity-40"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={!validQ || pending}
          className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-on-primary transition hover:bg-primary-dim disabled:cursor-not-allowed disabled:opacity-40"
        >
          {pending ? "Adding…" : "Add"}
        </button>
      </div>
    </>
  );
}
