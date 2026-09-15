"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CopyField } from "@/components/constructor/fields";
import { rememberInvite } from "@/components/constructor/local";
import { Logo } from "@/components/Logo";
import { fetchAuthorView } from "@/lib/client/api";
import { formatDayMonth, formatWeekdayShort, joinChoices } from "@/lib/invite/format";
import { CHOICE_CATEGORIES } from "@/lib/invite/stickers";
import type { AuthorView } from "@/lib/invite/types";

const POLL_MS = 4000;

function plural(count: number, forms: [string, string, string]): string {
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (mod10 === 1 && mod100 !== 11) return forms[0];
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return forms[1];
  return forms[2];
}

/** «только что», «5 минут назад», «сегодня в 19:05», «14 сентября в 19:05». Только в браузере. */
function formatAgo(iso: string, now: number | null): string {
  if (now === null) return "";
  const time = Date.parse(iso);
  const date = new Date(time);
  const diff = Math.max(0, now - time);
  if (diff < 60_000) return "только что";
  if (diff < 3_600_000) {
    const minutes = Math.floor(diff / 60_000);
    return `${minutes} ${plural(minutes, ["минуту", "минуты", "минут"])} назад`;
  }
  const clock = date.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
  if (new Date(now).toDateString() === date.toDateString()) return `сегодня в ${clock}`;
  return `${date.toLocaleDateString("ru-RU", { day: "numeric", month: "long" })} в ${clock}`;
}

function statusOf(view: AuthorView) {
  const { answer } = view;
  const female = view.config.gender === "female";
  const pick = (f: string, m: string) => (female ? f : m);

  if (answer.finishedAt) {
    return { emoji: "💘", title: `${pick("Она сказала", "Он сказал")} «да»!`, text: "Ответ готов — детали ниже." };
  }
  if (answer.yesAt) {
    return { emoji: "🥰", title: "«Да» уже есть!", text: `${pick("Она", "Он")} ещё выбирает детали…` };
  }
  if (answer.declinedAt) {
    return { emoji: "🥲", title: "Пока отказ", text: "Нажата честная кнопка «Нет». Но передумать никогда не поздно." };
  }
  if (answer.opens > 0) {
    return {
      emoji: "👀",
      title: `Приглашение ${pick("открыла", "открыл")}`,
      text: `Открывали ${answer.opens} ${plural(answer.opens, ["раз", "раза", "раз"])}, ответа пока нет.`,
    };
  }
  return { emoji: "⏳", title: "Ещё не открывали", text: "Отправь ссылку — эта страница обновится сама." };
}

interface Row {
  key: string;
  emoji: string;
  text: string;
  at: string;
  noCount?: number;
}

function timelineOf(view: AuthorView): Row[] {
  const female = view.config.gender === "female";
  const pick = (f: string, m: string) => (female ? f : m);
  const rows: Row[] = [];

  view.events.forEach((event, index) => {
    const key = `${event.at}-${index}`;
    const data = event.data ?? {};
    switch (event.type) {
      case "opened":
        rows.push({ key, emoji: "💌", text: `${pick("Открыла", "Открыл")} приглашение`, at: event.at });
        break;
      case "intro_passed":
        rows.push({ key, emoji: "🔓", text: `${pick("Прошла", "Прошёл")} вход`, at: event.at });
        break;
      case "pin_failed":
        rows.push({ key, emoji: "🔢", text: "Неверный PIN-код", at: event.at });
        break;
      case "no_clicked": {
        // Серию нажатий «Нет» подряд показываем одной строкой.
        const last = rows[rows.length - 1];
        if (last?.noCount) {
          const count = last.noCount + 1;
          rows[rows.length - 1] = {
            ...last,
            noCount: count,
            at: event.at,
            text: `${pick("Нажимала", "Нажимал")} «Нет» — ${count} ${plural(count, ["раз", "раза", "раз"])}`,
          };
        } else {
          rows.push({ key, emoji: "🙈", text: `${pick("Нажала", "Нажал")} «Нет»`, at: event.at, noCount: 1 });
        }
        break;
      }
      case "declined":
        rows.push({ key, emoji: "🥲", text: "Честный отказ", at: event.at });
        break;
      case "yes":
        rows.push({ key, emoji: "🎉", text: `${pick("Нажала", "Нажал")} «Да»`, at: event.at });
        break;
      case "confirmed":
        rows.push({ key, emoji: "🙈", text: `${pick("Подтвердила", "Подтвердил")} «да»`, at: event.at });
        break;
      case "when_chosen": {
        const date = typeof data.date === "string" ? data.date : "";
        const time = typeof data.time === "string" ? data.time : "";
        rows.push({ key, emoji: "📅", text: `${pick("Выбрала", "Выбрал")} ${formatDayMonth(date)} в ${time}`, at: event.at });
        break;
      }
      case "choice_made": {
        const choices = Array.isArray(data.choices) ? data.choices.map(String) : [];
        rows.push({ key, emoji: "✨", text: `${pick("Выбрала", "Выбрал")}: ${joinChoices(choices)}`, at: event.at });
        break;
      }
      case "finished":
        rows.push({ key, emoji: "💘", text: `${pick("Дошла", "Дошёл")} до финала`, at: event.at });
        break;
    }
  });

  return rows.reverse();
}

export function Results({ token, initial }: { token: string; initial: AuthorView }) {
  const [view, setView] = useState(initial);
  const [now, setNow] = useState<number | null>(null);
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    setOrigin(window.location.origin);
    setNow(Date.now());
    rememberInvite({ id: initial.id, authorToken: token, title: initial.config.ask.title, createdAt: initial.createdAt });
    const clock = window.setInterval(() => setNow(Date.now()), 15_000);
    return () => window.clearInterval(clock);
  }, [initial, token]);

  // Страница обновляется сама, пока открыта вкладка.
  useEffect(() => {
    let alive = true;
    const timer = window.setInterval(async () => {
      if (document.visibilityState !== "visible") return;
      try {
        const next = await fetchAuthorView(token);
        if (!alive) return;
        setView(next);
        setNow(Date.now());
      } catch {
        // Сеть моргнула — попробуем на следующем круге.
      }
    }, POLL_MS);
    return () => {
      alive = false;
      window.clearInterval(timer);
    };
  }, [token]);

  const { answer, config } = view;
  const female = config.gender === "female";
  const status = statusOf(view);
  const rows = timelineOf(view);
  const dateText = answer.date
    ? `${formatWeekdayShort(answer.date)}, ${formatDayMonth(answer.date)}${answer.time ? ` в ${answer.time}` : ""}`
    : null;
  const hasDetails = Boolean(dateText) || answer.choices.length > 0 || answer.noClicks > 0;

  return (
    <div className="min-h-dvh">
      <header className="mx-auto flex max-w-3xl items-center justify-between px-5 py-5">
        <Logo />
        <Link href="/create" className="rounded-full bg-app-ink px-4 py-2 text-sm font-extrabold text-white">
          ＋ Новое приглашение
        </Link>
      </header>

      <main className="mx-auto flex max-w-3xl flex-col gap-4 px-5 pb-16">
        <section className="rounded-[32px] bg-app-ink p-6 text-white sm:p-8">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white/60">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
            </span>
            Обновляется само
          </div>
          <div className="mt-5 flex items-start gap-4">
            <span aria-hidden className="text-6xl leading-none">
              {status.emoji}
            </span>
            <div>
              <h1 className="font-brand text-3xl font-bold leading-tight">{status.title}</h1>
              <p className="mt-2 text-white/75">{status.text}</p>
            </div>
          </div>
        </section>

        {hasDetails && (
          <section className="grid gap-3 sm:grid-cols-3">
            {dateText && <Stat emoji="📅" label="Когда" value={dateText} />}
            {answer.choices.length > 0 && (
              <Stat emoji="✨" label={CHOICE_CATEGORIES[config.choice.category].label} value={joinChoices(answer.choices)} />
            )}
            {answer.noClicks > 0 && (
              <Stat
                emoji="🙈"
                label="«Нет» нажато"
                value={`${answer.noClicks} ${plural(answer.noClicks, ["раз", "раза", "раз"])}`}
              />
            )}
          </section>
        )}

        <section className="flex flex-col gap-3 rounded-[28px] border border-app-line bg-app-card p-5">
          <h2 className="text-lg font-extrabold">Ссылка для {female ? "неё" : "него"}</h2>
          <CopyField value={`${origin}/i/${view.id}`} />
          <div className="flex flex-wrap gap-2">
            <Link
              href={`/i/${view.id}`}
              target="_blank"
              className="rounded-full border-2 border-app-line px-4 py-2 text-sm font-extrabold transition hover:border-app-accent/40"
            >
              Открыть ↗
            </Link>
            <Link
              href={`/create?edit=${token}`}
              className="rounded-full border-2 border-app-line px-4 py-2 text-sm font-extrabold transition hover:border-app-accent/40"
            >
              ✏️ Редактировать
            </Link>
          </div>
          <p className="text-xs text-app-soft">Твои собственные открытия ссылки тоже попадут в историю.</p>
        </section>

        <section className="rounded-[28px] border border-app-line bg-app-card p-5">
          <h2 className="text-lg font-extrabold">История</h2>
          {rows.length === 0 ? (
            <p className="mt-3 text-app-soft">Пока пусто.</p>
          ) : (
            <ol className="mt-4 flex flex-col gap-3">
              {rows.map((row) => (
                <li key={row.key} className="flex items-center gap-3">
                  <span aria-hidden className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-app-bg text-lg">
                    {row.emoji}
                  </span>
                  <span className="min-w-0 flex-1 font-semibold">{row.text}</span>
                  <span className="shrink-0 text-sm text-app-soft">{formatAgo(row.at, now)}</span>
                </li>
              ))}
            </ol>
          )}
        </section>
      </main>
    </div>
  );
}

function Stat({ emoji, label, value }: { emoji: string; label: string; value: string }) {
  return (
    <div className="rounded-[24px] border border-app-line bg-app-card p-4">
      <div aria-hidden className="text-2xl">
        {emoji}
      </div>
      <div className="mt-2 text-xs font-bold uppercase tracking-wider text-app-soft">{label}</div>
      <div className="mt-1 text-lg font-extrabold leading-snug">{value}</div>
    </div>
  );
}
