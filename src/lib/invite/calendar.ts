import { parseIsoDate } from "./format";

const pad = (value: number) => String(value).padStart(2, "0");

/** Время без часового пояса: календарь покажет его как местное. */
const formatLocal = (date: Date) =>
  `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}T${pad(date.getHours())}${pad(date.getMinutes())}00`;

const escapeText = (value: string) =>
  value.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");

/** Файл .ics с одним событием — «Добавить в календарь». */
export function buildIcs(event: {
  title: string;
  description: string;
  date: string;
  time: string;
  durationMin?: number;
}): string | null {
  const day = parseIsoDate(event.date);
  const match = /^(\d{2}):(\d{2})$/.exec(event.time);
  if (!day || !match) return null;

  const start = new Date(day);
  start.setHours(Number(match[1]), Number(match[2]), 0, 0);
  const end = new Date(start.getTime() + (event.durationMin ?? 120) * 60_000);
  const stamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Zovi//RU",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:${start.getTime()}-${Math.random().toString(36).slice(2)}@zovi`,
    `DTSTAMP:${stamp}`,
    `DTSTART:${formatLocal(start)}`,
    `DTEND:${formatLocal(end)}`,
    `SUMMARY:${escapeText(event.title)}`,
    `DESCRIPTION:${escapeText(event.description)}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}
