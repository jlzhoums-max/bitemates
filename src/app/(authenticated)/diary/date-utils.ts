// All dates in this app are calendar dates (YYYY-MM-DD) interpreted in the
// user's LOCAL timezone — the DB column is DATE, not TIMESTAMPTZ. Never call
// Date.toISOString() on a date-only value; it shifts to UTC and can flip the
// day for users east or west of UTC.

export function todayLocal(): string {
  return fmtLocal(new Date());
}

export function fmtLocal(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function parseLocal(s: string): Date {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(d: Date, n: number): Date {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

export function startOfWeek(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  x.setDate(x.getDate() - x.getDay()); // Sunday = 0
  return x;
}

export function endOfWeek(d: Date): Date {
  return addDays(startOfWeek(d), 6);
}

export function isYMD(s: unknown): s is string {
  return typeof s === "string" && /^\d{4}-\d{2}-\d{2}$/.test(s);
}
