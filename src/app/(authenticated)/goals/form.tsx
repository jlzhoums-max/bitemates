"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

type Goals = {
  calorie_target: number;
  protein_pct: number;
  carbs_pct: number;
  fat_pct: number;
};

const MACRO_BOUNDS = {
  protein: { min: 5, max: 60, kcalPerG: 4, label: "Protein" },
  carbs: { min: 5, max: 70, kcalPerG: 4, label: "Carbs" },
  fat: { min: 5, max: 60, kcalPerG: 9, label: "Fat" },
} as const;

type MacroKey = keyof typeof MACRO_BOUNDS;
const MACRO_KEYS: MacroKey[] = ["protein", "carbs", "fat"];

const CAL_MIN = 1000;
const CAL_MAX = 5000;
const CAL_STEP = 10;

const DEFAULTS = {
  calorie_target: 2000,
  protein_pct: 30,
  carbs_pct: 45,
  fat_pct: 25,
} as const;

function snap5(n: number) {
  return Math.round(n / 5) * 5;
}

function clamp(n: number, lo: number, hi: number) {
  return Math.min(hi, Math.max(lo, n));
}

function rebalance(
  changedKey: MacroKey,
  requested: number,
  current: Record<MacroKey, number>
): Record<MacroKey, number> {
  const others = MACRO_KEYS.filter((k) => k !== changedKey);
  const [yKey, zKey] = others;
  const xB = MACRO_BOUNDS[changedKey];
  const yB = MACRO_BOUNDS[yKey];
  const zB = MACRO_BOUNDS[zKey];

  const xUpper = Math.min(xB.max, 100 - yB.min - zB.min);
  const xLower = Math.max(xB.min, 100 - yB.max - zB.max);
  const newX = clamp(snap5(requested), xLower, xUpper);

  const remaining = 100 - newX;
  const yOld = current[yKey];
  const zOld = current[zKey];
  const sumYZ = yOld + zOld;

  let yNew =
    sumYZ === 0 ? snap5(remaining / 2) : snap5((yOld / sumYZ) * remaining);
  let zNew = remaining - yNew;

  if (yNew < yB.min) {
    zNew -= yB.min - yNew;
    yNew = yB.min;
  } else if (yNew > yB.max) {
    zNew += yNew - yB.max;
    yNew = yB.max;
  }

  if (zNew < zB.min) {
    yNew -= zB.min - zNew;
    zNew = zB.min;
  } else if (zNew > zB.max) {
    yNew += zNew - zB.max;
    zNew = zB.max;
  }

  if (
    yNew < yB.min ||
    yNew > yB.max ||
    zNew < zB.min ||
    zNew > zB.max ||
    newX + yNew + zNew !== 100
  ) {
    return current;
  }

  return {
    ...current,
    [changedKey]: newX,
    [yKey]: yNew,
    [zKey]: zNew,
  };
}

function gramsFor(pct: number, calories: number, kcalPerG: number) {
  return Math.round((calories * (pct / 100)) / kcalPerG);
}

type PendingNav =
  | { kind: "link"; href: string; external: boolean }
  | { kind: "submit"; form: HTMLFormElement };

export function GoalsForm({ initial }: { initial: Goals }) {
  const router = useRouter();
  const [saved, setSaved] = useState<Goals>(initial);
  const [calorieTarget, setCalorieTarget] = useState(initial.calorie_target);
  const [macros, setMacros] = useState<Record<MacroKey, number>>({
    protein: initial.protein_pct,
    carbs: initial.carbs_pct,
    fat: initial.fat_pct,
  });
  const [toast, setToast] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [pendingNav, setPendingNav] = useState<PendingNav | null>(null);
  const [pending, startTransition] = useTransition();

  const guardActiveRef = useRef(true);
  const cancelBtnRef = useRef<HTMLButtonElement>(null);

  const calorieError =
    !Number.isInteger(calorieTarget) ||
    calorieTarget < CAL_MIN ||
    calorieTarget > CAL_MAX
      ? `Must be between ${CAL_MIN} and ${CAL_MAX} kcal.`
      : null;

  const isDirty =
    calorieTarget !== saved.calorie_target ||
    macros.protein !== saved.protein_pct ||
    macros.carbs !== saved.carbs_pct ||
    macros.fat !== saved.fat_pct;

  const canSave = isDirty && !calorieError && !pending;

  useEffect(() => {
    if (!isDirty) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!guardActiveRef.current) return;
      e.preventDefault();
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [isDirty]);

  useEffect(() => {
    if (!isDirty) return;
    const onClick = (e: MouseEvent) => {
      if (!guardActiveRef.current) return;
      const target = e.target as HTMLElement | null;
      const link = target?.closest("a") as HTMLAnchorElement | null;
      if (!link) return;
      const href = link.getAttribute("href");
      if (!href || href.startsWith("#")) return;
      const external =
        link.target === "_blank" || /^[a-z]+:/i.test(href) || href.startsWith("//");
      e.preventDefault();
      e.stopPropagation();
      setPendingNav({ kind: "link", href, external });
    };
    const onSubmit = (e: SubmitEvent) => {
      if (!guardActiveRef.current) return;
      const form = e.target as HTMLFormElement | null;
      if (!form) return;
      e.preventDefault();
      e.stopPropagation();
      setPendingNav({ kind: "submit", form });
    };
    document.addEventListener("click", onClick, true);
    document.addEventListener("submit", onSubmit, true);
    return () => {
      document.removeEventListener("click", onClick, true);
      document.removeEventListener("submit", onSubmit, true);
    };
  }, [isDirty]);

  useEffect(() => {
    if (!pendingNav) return;
    cancelBtnRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setPendingNav(null);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [pendingNav]);

  function bumpCalorie(delta: number) {
    setCalorieTarget((prev) => clamp(prev + delta, CAL_MIN, CAL_MAX));
  }

  function onCalorieInput(raw: string) {
    if (raw === "") {
      setCalorieTarget(NaN as unknown as number);
      return;
    }
    const n = Number(raw);
    if (Number.isFinite(n)) setCalorieTarget(Math.round(n));
  }

  function setMacro(key: MacroKey, raw: number) {
    setMacros((prev) => rebalance(key, raw, prev));
  }

  function resetToDefaults() {
    setCalorieTarget(DEFAULTS.calorie_target);
    setMacros({
      protein: DEFAULTS.protein_pct,
      carbs: DEFAULTS.carbs_pct,
      fat: DEFAULTS.fat_pct,
    });
  }

  function confirmDiscard() {
    if (!pendingNav) return;
    guardActiveRef.current = false;
    if (pendingNav.kind === "link") {
      if (pendingNav.external) {
        window.location.href = pendingNav.href;
      } else {
        router.push(pendingNav.href);
      }
    } else {
      pendingNav.form.requestSubmit();
    }
    setPendingNav(null);
  }

  function cancelDiscard() {
    setPendingNav(null);
  }

  async function save() {
    if (!canSave) return;
    setSubmitError(null);
    const body = {
      calorie_target: calorieTarget,
      protein_pct: macros.protein,
      carbs_pct: macros.carbs,
      fat_pct: macros.fat,
    };
    startTransition(async () => {
      const res = await fetch("/api/goals", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const errBody = (await res.json().catch(() => ({}))) as {
          error?: string;
        };
        setSubmitError(errBody.error || "Could not save. Please try again.");
        return;
      }
      setSaved({
        calorie_target: calorieTarget,
        protein_pct: macros.protein,
        carbs_pct: macros.carbs,
        fat_pct: macros.fat,
      });
      setToast("Saved");
      setTimeout(() => setToast(null), 2000);
    });
  }

  const calorieDisplay = Number.isFinite(calorieTarget) ? calorieTarget : "";

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-headline text-3xl font-extrabold text-on-surface">
          Goals
        </h1>
        <button
          type="button"
          onClick={save}
          disabled={!canSave}
          className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-on-primary transition hover:bg-primary-dim disabled:cursor-not-allowed disabled:opacity-40"
        >
          {pending ? "Saving…" : "Save"}
        </button>
      </div>

      {submitError && (
        <div
          role="alert"
          className="mb-4 rounded-2xl bg-error-container px-4 py-3 text-sm text-on-error-container"
        >
          {submitError}
        </div>
      )}

      <section
        aria-labelledby="calorie-heading"
        className="mb-6 rounded-3xl bg-surface-container-lowest p-6"
      >
        <h2
          id="calorie-heading"
          className="text-sm font-medium uppercase tracking-wider text-on-surface-variant"
        >
          Daily calorie target
        </h2>
        <div className="mt-3 flex items-center gap-3">
          <button
            type="button"
            aria-label="Decrease by 10"
            onClick={() => bumpCalorie(-CAL_STEP)}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-container text-on-surface transition hover:bg-surface-container-high"
          >
            <span className="material-symbols-outlined">remove</span>
          </button>
          <div className="flex flex-1 items-baseline justify-center gap-2">
            <input
              type="number"
              inputMode="numeric"
              min={CAL_MIN}
              max={CAL_MAX}
              step={CAL_STEP}
              value={calorieDisplay}
              onChange={(e) => onCalorieInput(e.target.value)}
              aria-invalid={!!calorieError}
              className="w-32 bg-transparent text-center font-headline text-5xl font-extrabold text-on-surface focus:outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            />
            <span className="text-sm font-medium text-on-surface-variant">
              kcal
            </span>
          </div>
          <button
            type="button"
            aria-label="Increase by 10"
            onClick={() => bumpCalorie(CAL_STEP)}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-container text-on-surface transition hover:bg-surface-container-high"
          >
            <span className="material-symbols-outlined">add</span>
          </button>
        </div>
        {calorieError && (
          <p className="mt-3 text-center text-sm text-error">{calorieError}</p>
        )}
      </section>

      <section
        aria-labelledby="macros-heading"
        className="rounded-3xl bg-surface-container-lowest p-6"
      >
        <h2
          id="macros-heading"
          className="mb-4 text-sm font-medium uppercase tracking-wider text-on-surface-variant"
        >
          Macros
        </h2>
        <div className="space-y-6">
          {MACRO_KEYS.map((key) => {
            const bounds = MACRO_BOUNDS[key];
            const pct = macros[key];
            const grams = Number.isFinite(calorieTarget)
              ? gramsFor(pct, calorieTarget, bounds.kcalPerG)
              : 0;
            const fillPct =
              ((pct - bounds.min) / (bounds.max - bounds.min)) * 100;
            return (
              <div key={key}>
                <div className="mb-1 flex items-baseline justify-between">
                  <span className="text-sm font-medium text-on-surface">
                    {bounds.label}
                  </span>
                  <span className="font-headline text-2xl font-bold text-on-surface">
                    {pct}%
                  </span>
                </div>
                <input
                  type="range"
                  aria-label={`${bounds.label} percentage`}
                  min={bounds.min}
                  max={bounds.max}
                  step={5}
                  value={pct}
                  onChange={(e) => setMacro(key, Number(e.target.value))}
                  style={
                    {
                      "--range-fill": `${fillPct}%`,
                    } as React.CSSProperties
                  }
                  className="w-full"
                />
                <div className="mt-1 text-xs text-on-surface-variant">
                  {grams} g
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <button
        type="button"
        onClick={resetToDefaults}
        className="mx-auto mt-4 block text-sm text-on-surface-variant underline-offset-2 hover:underline"
      >
        Reset to defaults
      </button>

      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-6 left-1/2 z-40 -translate-x-1/2 rounded-full bg-inverse-surface px-5 py-2 text-sm font-medium text-inverse-on-surface shadow-lg"
        >
          {toast}
        </div>
      )}

      {pendingNav && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="discard-title"
          aria-describedby="discard-body"
          className="fixed inset-0 z-50 flex items-center justify-center p-6"
        >
          <button
            type="button"
            aria-label="Cancel"
            onClick={cancelDiscard}
            className="absolute inset-0 bg-inverse-surface/40"
          />
          <div className="relative w-full max-w-sm rounded-2xl bg-surface-container-lowest p-6 shadow-xl">
            <h3
              id="discard-title"
              className="font-headline text-lg font-bold text-on-surface"
            >
              Discard changes?
            </h3>
            <p
              id="discard-body"
              className="mt-2 text-sm text-on-surface-variant"
            >
              Your unsaved goal changes will be lost.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                ref={cancelBtnRef}
                type="button"
                onClick={cancelDiscard}
                className="rounded-full bg-surface-container px-4 py-2 text-sm font-medium text-on-surface transition hover:bg-surface-container-high"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDiscard}
                className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-on-primary transition hover:bg-primary-dim"
              >
                Discard
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
