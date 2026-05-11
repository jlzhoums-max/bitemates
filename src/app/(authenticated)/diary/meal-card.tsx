"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteEntry } from "./actions";
import type { DiaryEntry, MealMeta } from "./types";

function fmtInt(n: number) {
  return Math.round(n).toString();
}

function fmtQty(n: number) {
  if (Number.isInteger(n)) return n.toString();
  return n.toFixed(2).replace(/\.?0+$/, "");
}

type Props = {
  meal: MealMeta;
  entries: DiaryEntry[];
  onLog: () => void;
  onDeleted: (success: boolean) => void;
};

export function MealCard({ meal, entries, onLog, onDeleted }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const router = useRouter();

  const totals = entries.reduce(
    (a, e) => ({
      calories: a.calories + Number(e.calories),
      protein_g: a.protein_g + Number(e.protein_g),
      carbs_g: a.carbs_g + Number(e.carbs_g),
      fat_g: a.fat_g + Number(e.fat_g),
    }),
    { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0 }
  );

  const isEmpty = entries.length === 0;
  const previewText = isEmpty
    ? null
    : entries.length === 1
      ? entries[0].food_name
      : `${entries[0].food_name} (+${entries.length - 1} more)`;

  function handleDelete(id: string) {
    setPendingId(id);
    startTransition(async () => {
      const result = await deleteEntry(id);
      setPendingId(null);
      if ("ok" in result) {
        router.refresh();
      }
      onDeleted("ok" in result);
    });
  }

  return (
    <section className="rounded-2xl bg-surface-container p-5">
      <div className="flex items-start justify-between gap-3">
        <button
          type="button"
          aria-expanded={expanded}
          onClick={() => !isEmpty && setExpanded((v) => !v)}
          disabled={isEmpty}
          className="flex flex-1 items-start gap-3 text-left disabled:cursor-default"
        >
          <span
            className="material-symbols-outlined text-3xl text-on-surface"
            style={{ fontVariationSettings: '"FILL" 1' }}
          >
            {meal.icon}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline justify-between gap-2">
              <span className="font-headline text-base font-bold text-on-surface">
                {meal.label}
              </span>
              <span className="font-headline text-base font-bold text-on-surface">
                {fmtInt(totals.calories)} cal
              </span>
            </div>
            <div className="mt-0.5 text-xs text-on-surface-variant">
              C: {fmtInt(totals.carbs_g)}g · F: {fmtInt(totals.fat_g)}g · P:{" "}
              {fmtInt(totals.protein_g)}g
            </div>
            <div className="mt-1 truncate text-sm text-on-surface-variant">
              {isEmpty ? (
                <span className="italic">Nothing logged yet</span>
              ) : (
                previewText
              )}
            </div>
          </div>
        </button>
        <button
          type="button"
          onClick={onLog}
          aria-label={`Add to ${meal.label}`}
          className="flex h-10 shrink-0 items-center gap-1 rounded-full bg-primary px-4 text-sm font-semibold text-on-primary transition hover:bg-primary-dim"
        >
          <span className="material-symbols-outlined text-base">add</span>
          Log
        </button>
      </div>

      {expanded && !isEmpty && (
        <ul className="mt-4 space-y-2 border-t border-outline-variant/30 pt-3">
          {entries.map((e) => (
            <li
              key={e.id}
              className="flex items-start gap-3 rounded-xl bg-surface-container-lowest p-3"
            >
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium text-on-surface">
                  {e.food_name}
                </div>
                <div className="text-xs text-on-surface-variant">
                  {fmtInt(Number(e.calories))} cal ·{" "}
                  {fmtInt(Number(e.protein_g))}g P ·{" "}
                  {fmtInt(Number(e.carbs_g))}g C ·{" "}
                  {fmtInt(Number(e.fat_g))}g F
                </div>
                <div className="text-xs text-on-surface-variant">
                  {fmtQty(Number(e.serving_quantity))} ×{" "}
                  {e.serving_size ?? "serving"}
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleDelete(e.id)}
                disabled={pendingId === e.id}
                aria-label={`Delete ${e.food_name}`}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-on-surface-variant transition hover:bg-error-container hover:text-on-error-container disabled:opacity-40"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
