export const TIMEZONES = [
  { id: "Europe/Kaliningrad", label: "Калининград, МСК−1" },
  { id: "Europe/Moscow", label: "Москва, МСК" },
  { id: "Europe/Samara", label: "Самара, МСК+1" },
  { id: "Asia/Yekaterinburg", label: "Екатеринбург, МСК+2" },
  { id: "Asia/Omsk", label: "Омск, МСК+3" },
  { id: "Asia/Novosibirsk", label: "Новосибирск, МСК+4" },
  { id: "Asia/Krasnoyarsk", label: "Красноярск, МСК+4" },
  { id: "Asia/Irkutsk", label: "Иркутск, МСК+5" },
  { id: "Asia/Yakutsk", label: "Якутск, МСК+6" },
  { id: "Asia/Vladivostok", label: "Владивосток, МСК+7" },
  { id: "Asia/Magadan", label: "Магадан, МСК+8" },
  { id: "Asia/Kamchatka", label: "Камчатка, МСК+9" },
];

export function timezoneLabel(id: string): string {
  return TIMEZONES.find((zone) => zone.id === id)?.label ?? id;
}

/** Смещение часового пояса относительно UTC в момент utcMs. */
function offsetMs(utcMs: number, timeZone: string): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(new Date(utcMs));
  const part = (type: string) => Number(parts.find((p) => p.type === type)?.value);
  const asUtc = Date.UTC(part("year"), part("month") - 1, part("day"), part("hour"), part("minute"), part("second"));
  return asUtc - utcMs;
}

/** «2026-09-20» + «10:00» в поясе timeZone → момент в UTC (ISO). */
export function zonedToUtcIso(date: string, time: string, timeZone: string): string | null {
  const d = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  const t = /^(\d{2}):(\d{2})$/.exec(time);
  if (!d || !t) return null;
  const wallAsUtc = Date.UTC(Number(d[1]), Number(d[2]) - 1, Number(d[3]), Number(t[1]), Number(t[2]));
  try {
    let utc = wallAsUtc - offsetMs(wallAsUtc, timeZone);
    // Второй проход — на случай перехода на летнее время между двумя оценками.
    utc = wallAsUtc - offsetMs(utc, timeZone);
    return new Date(utc).toISOString();
  } catch {
    return null;
  }
}

/** Момент в UTC → дата и время на часах в поясе timeZone. */
export function utcToZoned(iso: string, timeZone: string): { date: string; time: string } {
  const ms = Date.parse(iso);
  try {
    const local = new Date(ms + offsetMs(ms, timeZone));
    const iso2 = local.toISOString();
    return { date: iso2.slice(0, 10), time: iso2.slice(11, 16) };
  } catch {
    return { date: "", time: "" };
  }
}
