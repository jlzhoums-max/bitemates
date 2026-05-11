"use client";

import Link from "next/link";
import {
  addDays,
  endOfWeek,
  fmtLocal,
  parseLocal,
  startOfWeek,
  todayLocal,
} from "./date-utils";

const DAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];

type Props = {
  date: string;
  datesWithEntries: string[];
};

export function DateStrip({ date, datesWithEntries }: Props) {
  const selected = parseLocal(date);
  const today = todayLocal();
  const weekStart = startOfWeek(selected);
  const weekEnd = endOfWeek(selected);
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const indicators = new Set(datesWithEntries);
  const canGoRight = fmtLocal(weekEnd) < today;

  const prevHref = `/diary?date=${fmtLocal(addDays(weekStart, -1))}`;
  const nextHref = canGoRight
    ? `/diary?date=${fmtLocal(addDays(weekEnd, 1))}`
    : null;

  return (
    <div className="mb-6 flex items-center gap-2">
      <Link
        href={prevHref}
        aria-label="Previous week"
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-on-surface transition hover:bg-surface-container"
      >
        <span className="material-symbols-outlined">chevron_left</span>
      </Link>
      <div className="flex flex-1 justify-between gap-1">
        {days.map((d) => {
          const dStr = fmtLocal(d);
          const isSelected = dStr === date;
          const hasIndicator = isSelected || indicators.has(dStr);
          return (
            <Link
              key={dStr}
              href={`/diary?date=${dStr}`}
              className={`flex flex-1 flex-col items-center rounded-2xl py-2 transition ${
                isSelected
                  ? "bg-primary text-on-primary"
                  : "text-on-surface hover:bg-surface-container"
              }`}
            >
              <span className="text-xs font-medium opacity-70">
                {DAY_LABELS[d.getDay()]}
              </span>
              <span className="font-headline text-lg font-bold">
                {d.getDate()}
              </span>
              <span
                aria-hidden
                className={`mt-1 h-1.5 w-1.5 rounded-full ${
                  hasIndicator
                    ? isSelected
                      ? "bg-on-primary"
                      : "bg-primary"
                    : "bg-transparent"
                }`}
              />
            </Link>
          );
        })}
      </div>
      {nextHref ? (
        <Link
          href={nextHref}
          aria-label="Next week"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-on-surface transition hover:bg-surface-container"
        >
          <span className="material-symbols-outlined">chevron_right</span>
        </Link>
      ) : (
        <span
          aria-hidden
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-on-surface-variant opacity-30"
        >
          <span className="material-symbols-outlined">chevron_right</span>
        </span>
      )}
    </div>
  );
}
