"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CopyField } from "@/components/constructor/fields";
import { rememberInvite } from "@/components/constructor/local";
import { Logo } from "@/components/Logo";
import { fetchAuthorView } from "@/lib/client/api";
import { guestStatus, soloAnswer } from "@/lib/invite/answer";
import { formatDayMonth, formatWeekdayShort, joinChoices } from "@/lib/invite/format";
import { CHOICE_CATEGORIES } from "@/lib/invite/stickers";
import type { AuthorView, InviteAnswer } from "@/lib/invite/types";
import { GuestBoard } from "./GuestBoard";
import { entriesOf, plural, timelineOf } from "./timeline";

const POLL_MS = 4000;

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

interface Status {
  emoji: string;
  title: string;
  text: string;
}

function singleStatus(view: AuthorView, answer: InviteAnswer): Status {
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

function partyStatus(view: AuthorView): Status {
  const guests = view.participants.filter((participant) => participant.name !== "");
  const going = guests.filter((guest) => guestStatus(guest.answer) === "going").length;
  const waiting = guests.filter((guest) => guestStatus(guest.answer) === "thinking").length;

  if (guests.length === 0) {
    return { emoji: "⏳", title: "Гостей пока нет", text: "Отправь ссылку в общий чат — список соберётся сам." };
  }
  if (going === 0) {
    return { emoji: "👀", title: "Ссылку открывают", text: `Ответов пока нет, ${waiting} в процессе.` };
  }
  return {
    emoji: "🎉",
    title: `${going} ${plural(going, ["гость идёт", "гостя идут", "гостей идут"])}`,
    text: waiting > 0 ? `Ещё ${waiting} ${plural(waiting, ["думает", "думают", "думают"])}.` : "Все ответили.",
  };
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

  const { config } = view;
  const party = config.audience === "party";
  const female = config.gender === "female";
  const answer = soloAnswer(view);
  const status = party ? partyStatus(view) : singleStatus(view, answer);
  const rows = timelineOf(view, entriesOf(view));
  const dateText = answer.date
    ? `${formatWeekdayShort(answer.date)}, ${formatDayMonth(answer.date)}${answer.time ? ` в ${answer.time}` : ""}`
    : null;
  const hasDetails = !party && (Boolean(dateText) || answer.choices.length > 0 || answer.noClicks > 0);

  return (
    <div className="min-h-dvh">
      <header className="mx-auto flex max-w-3xl items-center justify-between px-5 py-5">
        <Logo />
        <Link href="/create" className="rounded-full bg-app-ink px-4 py-2 text-sm font-extrabold text-white">
          ＋ Новое приглашение
        </Link>
      </header>

      <main className="mx-auto flex max-w-3xl flex-col gap-4 px-5 pb-16">
        <section className="rounded-2xl bg-app-ink p-6 text-white sm:p-8">
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

        {party && <GuestBoard view={view} />}

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

        <section className="flex flex-col gap-3 rounded-2xl border border-app-line bg-app-card p-5">
          <h2 className="text-lg font-extrabold">{party ? "Ссылка для гостей" : `Ссылка для ${female ? "неё" : "него"}`}</h2>
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
          <p className="text-xs text-app-soft">
            {party
              ? "Одну и ту же ссылку можно отправить хоть всем сразу — каждый ответит за себя."
              : "Твои собственные открытия ссылки тоже попадут в историю."}
          </p>
        </section>

        <section className="rounded-2xl border border-app-line bg-app-card p-5">
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
    <div className="rounded-2xl border border-app-line bg-app-card p-4">
      <div aria-hidden className="text-2xl">
        {emoji}
      </div>
      <div className="mt-2 text-xs font-bold uppercase tracking-wider text-app-soft">{label}</div>
      <div className="mt-1 text-lg font-extrabold leading-snug">{value}</div>
    </div>
  );
}
