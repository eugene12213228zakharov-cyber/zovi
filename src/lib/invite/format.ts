const MONTHS_GENITIVE = [
  "января",
  "февраля",
  "марта",
  "апреля",
  "мая",
  "июня",
  "июля",
  "августа",
  "сентября",
  "октября",
  "ноября",
  "декабря",
];

const WEEKDAYS_SHORT = ["вс", "пн", "вт", "ср", "чт", "пт", "сб"];

/** Локальная дата в формате YYYY-MM-DD. */
export function toIsoDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** YYYY-MM-DD → Date в полночь по местному времени; null для мусора. */
export function parseIsoDate(iso: string | null | undefined): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso ?? "");
  if (!match) return null;
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  return Number.isNaN(date.getTime()) ? null : date;
}

export function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

/** «20 сентября» */
export function formatDayMonth(iso: string | null | undefined): string {
  const date = parseIsoDate(iso);
  if (!date) return "";
  return `${date.getDate()} ${MONTHS_GENITIVE[date.getMonth()]}`;
}

/** «сб» */
export function formatWeekdayShort(iso: string | null | undefined): string {
  const date = parseIsoDate(iso);
  return date ? WEEKDAYS_SHORT[date.getDay()] : "";
}

/** Ближайшая суббота (если сегодня суббота — следующая). */
export function nextSaturdayIso(from: Date = new Date()): string {
  const shift = (6 - from.getDay() + 7) % 7 || 7;
  return toIsoDate(addDays(from, shift));
}

/** Список через запятую с «и» в конце, с маленькой буквы: «пицца, суши и паста». */
export function joinChoices(labels: string[]): string {
  const lower = labels.map((l) => l.trim()).filter(Boolean).map((l) => l.toLocaleLowerCase("ru"));
  if (lower.length <= 1) return lower[0] ?? "";
  return `${lower.slice(0, -1).join(", ")} и ${lower[lower.length - 1]}`;
}

export interface PlaceholderValues {
  date?: string | null;
  time?: string | null;
  choices?: string[];
}

/** Подставляет {date}, {time}, {choice} (и {food} — для совместимости с привычной формулировкой). */
export function fillPlaceholders(text: string, values: PlaceholderValues): string {
  const date = formatDayMonth(values.date) || "…";
  const time = values.time || "…";
  const choice = joinChoices(values.choices ?? []) || "…";
  return text
    .replaceAll("{date}", date)
    .replaceAll("{time}", time)
    .replaceAll("{choice}", choice)
    .replaceAll("{food}", choice);
}

/** Сколько осталось до момента: для таймера «откроется через». */
export function countdownParts(targetMs: number, nowMs: number) {
  const total = Math.max(0, Math.floor((targetMs - nowMs) / 1000));
  return {
    done: total === 0,
    days: Math.floor(total / 86400),
    hours: Math.floor((total % 86400) / 3600),
    minutes: Math.floor((total % 3600) / 60),
    seconds: total % 60,
  };
}
