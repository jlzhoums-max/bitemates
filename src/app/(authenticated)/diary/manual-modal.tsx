"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import type { ActionResult } from "./actions";

type FormState = {
  food_name: string;
  serving_size: string;
  serving_quantity: string;
  calories: string;
  protein_g: string;
  carbs_g: string;
  fat_g: string;
  fiber_g: string;
  sugar_g: string;
  sodium_mg: string;
  saturated_fat_g: string;
  cholesterol_mg: string;
};

type Errors = Partial<Record<keyof FormState, string>>;

export type ManualPayload = {
  source: "manual";
  source_food_id: null;
  food_name: string;
  serving_size: string | null;
  serving_quantity: number;
  calories: number;
  protein_g: number | null;
  carbs_g: number | null;
  fat_g: number | null;
  fiber_g: number | null;
  sugar_g: number | null;
  sodium_mg: number | null;
  saturated_fat_g: number | null;
  cholesterol_mg: number | null;
  nutrition_full: null;
};

const MACRO_KEYS = ["protein_g", "carbs_g", "fat_g"] as const;
const MICRO_KEYS = [
  "fiber_g",
  "sugar_g",
  "sodium_mg",
  "saturated_fat_g",
  "cholesterol_mg",
] as const;

function validate(f: FormState): Errors {
  const e: Errors = {};

  if (!f.food_name.trim()) e.food_name = "Required";

  const sq = Number(f.serving_quantity);
  if (!f.serving_quantity.trim() || !Number.isFinite(sq) || sq <= 0) {
    e.serving_quantity = "Must be greater than 0";
  }

  if (!f.calories.trim()) {
    e.calories = "Required";
  } else {
    const n = Number(f.calories);
    if (!Number.isFinite(n) || n < 0 || n > 5000) e.calories = "0–5000";
  }

  for (const k of MACRO_KEYS) {
    const v = f[k];
    if (!v.trim()) continue;
    const n = Number(v);
    if (!Number.isFinite(n) || n < 0 || n > 1000) e[k] = "0–1000";
  }

  for (const k of MICRO_KEYS) {
    const v = f[k];
    if (!v.trim()) continue;
    const n = Number(v);
    if (!Number.isFinite(n) || n < 0) e[k] = "≥ 0";
  }

  return e;
}

function buildPayload(f: FormState): ManualPayload {
  const numOrNull = (s: string): number | null => {
    if (!s.trim()) return null;
    const n = Number(s);
    return Number.isFinite(n) ? n : null;
  };

  // source_food_id is null intentionally — manual entries have no provider-side ID
  // (no USDA fdcId, no OFF barcode). If Phase 4+ adds favorites or dedupe, we'll
  // generate one then. Null is the contract, not a bug.
  return {
    source: "manual",
    source_food_id: null,
    food_name: f.food_name.trim(),
    serving_size: f.serving_size.trim() || null,
    serving_quantity: Number(f.serving_quantity),
    calories: Number(f.calories),
    protein_g: numOrNull(f.protein_g),
    carbs_g: numOrNull(f.carbs_g),
    fat_g: numOrNull(f.fat_g),
    fiber_g: numOrNull(f.fiber_g),
    sugar_g: numOrNull(f.sugar_g),
    sodium_mg: numOrNull(f.sodium_mg),
    saturated_fat_g: numOrNull(f.saturated_fat_g),
    cholesterol_mg: numOrNull(f.cholesterol_mg),
    nutrition_full: null,
  };
}

const inputCls =
  "w-full rounded-full bg-surface-container-lowest px-4 py-2.5 text-sm text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:ring-2 focus:ring-primary [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none";

function Field({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-on-surface-variant">
        {label}
        {required && <span className="ml-0.5 text-error">*</span>}
      </span>
      {children}
      {error && (
        <span className="mt-1 block text-xs text-error">{error}</span>
      )}
    </label>
  );
}

type Props = {
  initialName: string;
  onClose: () => void;
  onSave: (payload: ManualPayload) => Promise<ActionResult>;
};

export function ManualEntryModal({ initialName, onClose, onSave }: Props) {
  const [pending, startTransition] = useTransition();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [initialState] = useState<FormState>({
    food_name: initialName,
    serving_size: "",
    serving_quantity: "1",
    calories: "",
    protein_g: "",
    carbs_g: "",
    fat_g: "",
    fiber_g: "",
    sugar_g: "",
    sodium_mg: "",
    saturated_fat_g: "",
    cholesterol_mg: "",
  });
  const [form, setForm] = useState<FormState>(initialState);
  const [showDiscard, setShowDiscard] = useState(false);
  const nameRef = useRef<HTMLInputElement>(null);

  const errors = validate(form);
  const isValid = Object.keys(errors).length === 0;
  const isDirty = JSON.stringify(form) !== JSON.stringify(initialState);

  useEffect(() => {
    if (!nameRef.current) return;
    nameRef.current.focus();
    const len = nameRef.current.value.length;
    nameRef.current.setSelectionRange(len, len);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (showDiscard) {
        setShowDiscard(false);
      } else if (isDirty) {
        setShowDiscard(true);
      } else {
        onClose();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [showDiscard, isDirty, onClose]);

  function update<K extends keyof FormState>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function attemptClose() {
    if (isDirty) setShowDiscard(true);
    else onClose();
  }

  function discardAndClose() {
    setShowDiscard(false);
    onClose();
  }

  function submit() {
    if (!isValid || pending) return;
    setSubmitError(null);
    startTransition(async () => {
      const result = await onSave(buildPayload(form));
      if ("error" in result) {
        setSubmitError(result.error);
      }
      // On success the parent unmounts this modal — nothing else to do.
    });
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="manual-title"
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6"
    >
      <button
        type="button"
        aria-label="Cancel"
        onClick={attemptClose}
        className="absolute inset-0 bg-inverse-surface/40"
      />
      <div className="relative flex max-h-[92vh] w-full max-w-lg flex-col rounded-t-3xl bg-surface-container-lowest sm:max-h-[90vh] sm:rounded-2xl">
        <div className="flex items-center justify-between px-6 py-4">
          <h2
            id="manual-title"
            className="font-headline text-xl font-extrabold text-on-surface"
          >
            Add manually
          </h2>
          <button
            type="button"
            aria-label="Cancel"
            onClick={attemptClose}
            className="rounded-full p-2 text-on-surface transition hover:bg-surface-container"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto px-6 pb-5">
          <section className="space-y-3 rounded-2xl bg-surface-container px-4 py-4">
            <Field
              label="Food name"
              required
              error={errors.food_name}
            >
              <input
                ref={nameRef}
                type="text"
                value={form.food_name}
                onChange={(e) => update("food_name", e.target.value)}
                placeholder="e.g. Homemade pho"
                aria-invalid={!!errors.food_name}
                className={inputCls}
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Serving size">
                <input
                  type="text"
                  value={form.serving_size}
                  onChange={(e) => update("serving_size", e.target.value)}
                  placeholder="e.g. 1 cup, 100g"
                  className={inputCls}
                />
              </Field>
              <Field
                label="Servings"
                required
                error={errors.serving_quantity}
              >
                <input
                  type="number"
                  inputMode="decimal"
                  step="any"
                  min={0}
                  value={form.serving_quantity}
                  onChange={(e) =>
                    update("serving_quantity", e.target.value)
                  }
                  aria-invalid={!!errors.serving_quantity}
                  className={inputCls}
                />
              </Field>
            </div>
          </section>

          <section className="space-y-3 rounded-2xl bg-surface-container px-4 py-4">
            <Field
              label="Calories (kcal)"
              required
              error={errors.calories}
            >
              <input
                type="number"
                inputMode="decimal"
                step="any"
                min={0}
                max={5000}
                value={form.calories}
                onChange={(e) => update("calories", e.target.value)}
                aria-invalid={!!errors.calories}
                className={inputCls}
              />
            </Field>
            <div className="grid grid-cols-3 gap-3">
              <Field label="Protein (g)" error={errors.protein_g}>
                <input
                  type="number"
                  inputMode="decimal"
                  step="any"
                  min={0}
                  max={1000}
                  value={form.protein_g}
                  onChange={(e) => update("protein_g", e.target.value)}
                  aria-invalid={!!errors.protein_g}
                  className={inputCls}
                />
              </Field>
              <Field label="Carbs (g)" error={errors.carbs_g}>
                <input
                  type="number"
                  inputMode="decimal"
                  step="any"
                  min={0}
                  max={1000}
                  value={form.carbs_g}
                  onChange={(e) => update("carbs_g", e.target.value)}
                  aria-invalid={!!errors.carbs_g}
                  className={inputCls}
                />
              </Field>
              <Field label="Fat (g)" error={errors.fat_g}>
                <input
                  type="number"
                  inputMode="decimal"
                  step="any"
                  min={0}
                  max={1000}
                  value={form.fat_g}
                  onChange={(e) => update("fat_g", e.target.value)}
                  aria-invalid={!!errors.fat_g}
                  className={inputCls}
                />
              </Field>
            </div>
          </section>

          <section className="space-y-3 rounded-2xl bg-surface-container px-4 py-4">
            <h3 className="text-xs font-medium uppercase tracking-wider text-on-surface-variant">
              Optional
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Fiber (g)" error={errors.fiber_g}>
                <input
                  type="number"
                  inputMode="decimal"
                  step="any"
                  min={0}
                  value={form.fiber_g}
                  onChange={(e) => update("fiber_g", e.target.value)}
                  aria-invalid={!!errors.fiber_g}
                  className={inputCls}
                />
              </Field>
              <Field label="Sugar (g)" error={errors.sugar_g}>
                <input
                  type="number"
                  inputMode="decimal"
                  step="any"
                  min={0}
                  value={form.sugar_g}
                  onChange={(e) => update("sugar_g", e.target.value)}
                  aria-invalid={!!errors.sugar_g}
                  className={inputCls}
                />
              </Field>
              <Field label="Sodium (mg)" error={errors.sodium_mg}>
                <input
                  type="number"
                  inputMode="decimal"
                  step="any"
                  min={0}
                  value={form.sodium_mg}
                  onChange={(e) => update("sodium_mg", e.target.value)}
                  aria-invalid={!!errors.sodium_mg}
                  className={inputCls}
                />
              </Field>
              <Field label="Sat fat (g)" error={errors.saturated_fat_g}>
                <input
                  type="number"
                  inputMode="decimal"
                  step="any"
                  min={0}
                  value={form.saturated_fat_g}
                  onChange={(e) =>
                    update("saturated_fat_g", e.target.value)
                  }
                  aria-invalid={!!errors.saturated_fat_g}
                  className={inputCls}
                />
              </Field>
              <Field label="Cholesterol (mg)" error={errors.cholesterol_mg}>
                <input
                  type="number"
                  inputMode="decimal"
                  step="any"
                  min={0}
                  value={form.cholesterol_mg}
                  onChange={(e) =>
                    update("cholesterol_mg", e.target.value)
                  }
                  aria-invalid={!!errors.cholesterol_mg}
                  className={inputCls}
                />
              </Field>
            </div>
          </section>
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
            onClick={attemptClose}
            disabled={pending}
            className="rounded-full bg-surface-container px-5 py-2 text-sm font-medium text-on-surface transition hover:bg-surface-container-high disabled:opacity-40"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={!isValid || pending}
            className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-on-primary transition hover:bg-primary-dim disabled:cursor-not-allowed disabled:opacity-40"
          >
            {pending ? "Adding…" : "Add"}
          </button>
        </div>
      </div>

      {showDiscard && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="discard-title"
          className="absolute inset-0 z-10 flex items-center justify-center p-6"
        >
          <button
            type="button"
            aria-label="Cancel"
            onClick={() => setShowDiscard(false)}
            className="absolute inset-0 bg-inverse-surface/40"
          />
          <div className="relative w-full max-w-sm rounded-2xl bg-surface-container-lowest p-6 shadow-xl">
            <h3
              id="discard-title"
              className="font-headline text-lg font-bold text-on-surface"
            >
              Discard changes?
            </h3>
            <p className="mt-2 text-sm text-on-surface-variant">
              Your unsaved manual entry will be lost.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowDiscard(false)}
                className="rounded-full bg-surface-container px-4 py-2 text-sm font-medium text-on-surface transition hover:bg-surface-container-high"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={discardAndClose}
                className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-on-primary transition hover:bg-primary-dim"
              >
                Discard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
