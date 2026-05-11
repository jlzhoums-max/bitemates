"use client";

import { useState } from "react";
import { DateStrip } from "./date-strip";
import { Summary } from "./summary";
import { MealCard } from "./meal-card";
import { LogModal } from "./log-modal";
import {
  MEALS,
  MEAL_LABELS,
  type DiaryEntry,
  type DiaryProfile,
  type MealCategory,
} from "./types";

type Props = {
  date: string;
  profile: DiaryProfile;
  entries: DiaryEntry[];
  datesWithEntries: string[];
};

export function DiaryView({
  date,
  profile,
  entries,
  datesWithEntries,
}: Props) {
  const [logModal, setLogModal] = useState<{ meal: MealCategory } | null>(
    null
  );
  const [toast, setToast] = useState<string | null>(null);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 2000);
  }

  const grouped: Record<MealCategory, DiaryEntry[]> = {
    breakfast: [],
    lunch: [],
    dinner: [],
    snacks: [],
  };
  for (const e of entries) {
    if (grouped[e.meal_category]) grouped[e.meal_category].push(e);
  }

  return (
    <>
      <DateStrip date={date} datesWithEntries={datesWithEntries} />
      <Summary entries={entries} profile={profile} />

      <div className="space-y-3">
        {MEALS.map((m) => (
          <MealCard
            key={m.key}
            meal={m}
            entries={grouped[m.key]}
            onLog={() => setLogModal({ meal: m.key })}
            onDeleted={(ok) => showToast(ok ? "Removed" : "Delete failed")}
          />
        ))}
      </div>

      {logModal && (
        <LogModal
          date={date}
          mealCategory={logModal.meal}
          mealLabel={MEAL_LABELS[logModal.meal]}
          onClose={() => setLogModal(null)}
          onSaved={() => {
            const meal = logModal.meal;
            setLogModal(null);
            showToast(`Added to ${MEAL_LABELS[meal]}`);
          }}
        />
      )}

      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full bg-inverse-surface px-5 py-2 text-sm font-medium text-inverse-on-surface shadow-lg"
        >
          {toast}
        </div>
      )}
    </>
  );
}
