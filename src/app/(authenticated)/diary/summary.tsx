"use client";

import type { DiaryEntry, DiaryProfile } from "./types";

function fmtInt(n: number) {
  return new Intl.NumberFormat("en-US").format(Math.round(n));
}

type Props = {
  entries: DiaryEntry[];
  profile: DiaryProfile;
};

export function Summary({ entries, profile }: Props) {
  const totals = entries.reduce(
    (a, e) => ({
      calories: a.calories + Number(e.calories),
      protein_g: a.protein_g + Number(e.protein_g),
      carbs_g: a.carbs_g + Number(e.carbs_g),
      fat_g: a.fat_g + Number(e.fat_g),
    }),
    { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0 }
  );

  const calorieTarget = profile.calorie_target;
  const calorieRemaining = calorieTarget - totals.calories;
  const calorieOver = totals.calories > calorieTarget;
  const calorieFillPct =
    calorieTarget > 0 ? Math.min(100, (totals.calories / calorieTarget) * 100) : 0;

  const macroTargets = {
    protein_g: (calorieTarget * profile.protein_pct) / 100 / 4,
    carbs_g: (calorieTarget * profile.carbs_pct) / 100 / 4,
    fat_g: (calorieTarget * profile.fat_pct) / 100 / 9,
  };

  return (
    <div className="mb-6 space-y-3">
      <section
        aria-labelledby="cal-heading"
        className="rounded-2xl bg-surface-container p-5"
      >
        <h2
          id="cal-heading"
          className="text-xs font-medium uppercase tracking-wider text-on-surface-variant"
        >
          Calories
        </h2>
        <div className="mt-1 font-headline text-4xl font-extrabold text-on-surface">
          {fmtInt(totals.calories)}
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-surface-container-high">
          <div
            className={`h-full rounded-full ${
              calorieOver ? "bg-error" : "bg-primary"
            }`}
            style={{ width: `${calorieFillPct}%` }}
          />
        </div>
        <div className="mt-2 text-sm text-on-surface-variant">
          {calorieOver ? (
            <span className="font-medium text-error">
              OVER by {fmtInt(-calorieRemaining)}
            </span>
          ) : (
            <>
              {fmtInt(totals.calories)} of {fmtInt(calorieTarget)} ·{" "}
              {fmtInt(calorieRemaining)} left
            </>
          )}
        </div>
      </section>

      <section
        aria-label="Macros"
        className="rounded-2xl bg-surface-container p-5"
      >
        <div className="grid grid-cols-3 gap-3">
          <MacroColumn
            label="Carbs"
            current={totals.carbs_g}
            target={macroTargets.carbs_g}
          />
          <MacroColumn
            label="Fat"
            current={totals.fat_g}
            target={macroTargets.fat_g}
          />
          <MacroColumn
            label="Protein"
            current={totals.protein_g}
            target={macroTargets.protein_g}
          />
        </div>
      </section>
    </div>
  );
}

function MacroColumn({
  label,
  current,
  target,
}: {
  label: string;
  current: number;
  target: number;
}) {
  const over = current > target;
  const fillPct = target > 0 ? Math.min(100, (current / target) * 100) : 0;
  return (
    <div>
      <div className="text-xs font-medium text-on-surface-variant">{label}</div>
      <div className="mt-1 font-headline text-2xl font-bold text-on-surface">
        {fmtInt(current)}
        <span className="ml-0.5 text-xs font-medium text-on-surface-variant">
          g
        </span>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-container-high">
        <div
          className={`h-full rounded-full ${
            over ? "bg-error" : "bg-primary"
          }`}
          style={{ width: `${fillPct}%` }}
        />
      </div>
      <div className="mt-1 text-xs text-on-surface-variant">
        {fmtInt(current)} / {fmtInt(target)}
      </div>
    </div>
  );
}
