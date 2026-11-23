/** Opening hours, indexed to Date#getDay() — 0 is Sunday. */
export const HOURS = [
  ["Sunday", "9:00 — 22:00"],
  ["Monday", "8:00 — 22:00"],
  ["Tuesday", "8:00 — 22:00"],
  ["Wednesday", "8:00 — 22:00"],
  ["Thursday", "8:00 — 23:00"],
  ["Friday", "8:00 — 23:30"],
  ["Saturday", "9:00 — 23:30"],
];

const toMinutes = (hhmm) => {
  const [h, m] = hhmm.trim().split(":").map(Number);
  return h * 60 + m;
};

/** "8:00 — 22:00" → { open: 480, close: 1320 } in minutes past midnight. */
export function span(day) {
  const [from, to] = HOURS[day][1].split("—");
  return { open: toMinutes(from), close: toMinutes(to) };
}

const pad2 = (mins) =>
  `${String(Math.floor(mins / 60)).padStart(2, "0")}:${String(mins % 60).padStart(2, "0")}`;

const pretty = (mins) => {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h}:${String(m).padStart(2, "0")}`;
};

/** Where we are in the day: open or shut, and what happens next. */
export function statusAt(date) {
  const day = date.getDay();
  const now = date.getHours() * 60 + date.getMinutes();
  const { open, close } = span(day);

  if (now >= open && now < close) {
    return { open: true, day, note: `Closes at ${pretty(close)}` };
  }
  if (now < open) {
    return { open: false, day, note: `Opens at ${pretty(open)}` };
  }
  const next = span((day + 1) % 7);
  return { open: false, day, note: `Opens tomorrow at ${pretty(next.open)}` };
}

const DAY_URI = [
  "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday",
];

/** schema.org openingHoursSpecification, so search engines can show the hours. */
export function schemaHours() {
  return HOURS.map((_, day) => {
    const { open, close } = span(day);
    return {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: `https://schema.org/${DAY_URI[day]}`,
      opens: pad2(open),
      closes: pad2(close),
    };
  });
}

/** "YYYY-MM-DD" → a local Date (never parse it with new Date(str):
 *  that reads as UTC and can land on the wrong day). */
export function parseISO(s) {
  const [y, m, d] = String(s).split("-").map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
}

export const toISO = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

/**
 * Bookable times for a given date, derived from the real opening hours:
 * every `step` minutes from opening until `lastSeating` before closing.
 * For today, anything inside `lead` minutes from now is dropped — you
 * cannot reserve a table for ten minutes ago.
 */
export function slotsFor(dateStr, now = new Date(), { step = 30, lastSeating = 60, lead = 45 } = {}) {
  const date = parseISO(dateStr);
  if (!date) return [];
  const { open, close } = span(date.getDay());
  const end = close - lastSeating;

  let from = open;
  if (toISO(date) === toISO(now)) {
    const mins = now.getHours() * 60 + now.getMinutes() + lead;
    from = Math.max(from, Math.ceil(mins / step) * step);
  }

  const out = [];
  for (let t = from; t <= end; t += step) out.push(pad2(t));
  return out;
}
