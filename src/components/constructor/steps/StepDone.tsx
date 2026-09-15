"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { formatDayMonth } from "@/lib/invite/format";
import { CHOICE_CATEGORIES } from "@/lib/invite/stickers";
import type { IntroMode, InviteConfig, NoEffect } from "@/lib/invite/types";
import type { EditorStepId, SubmitProblem } from "@/lib/invite/validate";
import { THEMES } from "@/lib/themes";
import { CopyField } from "../fields";

const INTRO_LABELS: Record<IntroMode, string> = {
  none: "сразу к вопросу",
  pin: "PIN-код",
  scratch: "стереть слой",
  envelope: "конверт",
  scheduled: "по таймеру",
};

const NO_LABELS: Record<NoEffect, string> = {
  shrink: "уменьшается",
  runaway: "убегает",
  kiss: "поцелуй",
  honest: "честный отказ",
};

interface StepDoneProps {
  config: InviteConfig;
  problems: SubmitProblem[];
  onGoTo: (step: EditorStepId) => void;
  editing: boolean;
  submitting: boolean;
  submitError: string | null;
  result: { id: string; authorToken: string } | null;
  onSubmit: () => void;
  onStartOver: () => void;
}

export function StepDone({
  config,
  problems,
  onGoTo,
  editing,
  submitting,
  submitError,
  result,
  onSubmit,
  onStartOver,
}: StepDoneProps) {
  const [origin, setOrigin] = useState("");
  const [canShare, setCanShare] = useState(false);

  useEffect(() => {
    setOrigin(window.location.origin);
    setCanShare(typeof navigator.share === "function");
  }, []);

  if (result) {
    const inviteUrl = `${origin}/i/${result.id}`;
    const authorUrl = `${origin}/a/${result.authorToken}`;
    const localOnly = /\/\/(localhost|127\.0\.0\.1|\[::1\])(:|$)/.test(origin);

    return (
      <>
        <div className="rounded-[28px] bg-app-ink p-6 text-white">
          <div aria-hidden className="text-4xl">
            🎉
          </div>
          <h2 className="mt-3 font-brand text-2xl font-bold">{editing ? "Изменения сохранены" : "Приглашение готово!"}</h2>
          <p className="mt-2 text-white/75">
            {editing ? "По старой ссылке уже открывается новая версия." : "Отправь ссылку, а ответ смотри на своей странице."}
          </p>
        </div>

        <section className="flex flex-col gap-3 rounded-[28px] border border-app-line bg-app-card p-5">
          <h3 className="text-lg font-extrabold">💌 Ссылка для {config.gender === "female" ? "неё" : "него"}</h3>
          <CopyField value={inviteUrl} />
          <div className="flex flex-wrap gap-2">
            {canShare && (
              <button
                type="button"
                onClick={() => void navigator.share({ title: "Тебе приглашение 💌", url: inviteUrl }).catch(() => undefined)}
                className="rounded-full bg-app-accent px-4 py-2 text-sm font-extrabold text-app-accent-ink"
              >
                📤 Поделиться
              </button>
            )}
            <Link
              href={`/i/${result.id}`}
              target="_blank"
              className="rounded-full border-2 border-app-line px-4 py-2 text-sm font-extrabold transition hover:border-app-accent/40"
            >
              Открыть как получатель ↗
            </Link>
          </div>
        </section>

        <section className="flex flex-col gap-3 rounded-[28px] border border-app-line bg-app-card p-5">
          <h3 className="text-lg font-extrabold">🔑 Твоя секретная страница</h3>
          <p className="text-sm text-app-soft">
            Там виден ответ и можно поправить приглашение. Никому её не отправляй. Ссылка уже сохранена в «Моих
            приглашениях» на главной — в этом браузере.
          </p>
          <CopyField value={authorUrl} />
          <Link
            href={`/a/${result.authorToken}`}
            className="self-start rounded-full bg-app-ink px-5 py-2.5 text-sm font-extrabold text-white"
          >
            Смотреть ответ →
          </Link>
        </section>

        {localOnly && (
          <div className="rounded-[24px] border-2 border-dashed border-app-accent/50 bg-app-accent-soft/40 p-4 text-sm leading-relaxed">
            <b>Пока сайт работает только на этом компьютере.</b> С другого телефона ссылка не откроется — сначала
            сайт нужно выложить в интернет.
          </div>
        )}

        {!editing && (
          <button
            type="button"
            onClick={onStartOver}
            className="self-start rounded-full px-4 py-2 font-extrabold text-app-soft transition hover:bg-app-line/70"
          >
            ＋ Создать ещё одно
          </button>
        )}
      </>
    );
  }

  const theme = THEMES.find((item) => item.id === config.theme);
  const rows: { step: EditorStepId; label: string; value: string }[] = [
    {
      step: "who",
      label: "Кого зовём",
      value: `${config.gender === "female" ? "девушку" : "парня"}, тема «${theme?.name ?? ""}»`,
    },
    { step: "intro", label: "Вход", value: INTRO_LABELS[config.intro.mode] },
    { step: "ask", label: "Вопрос", value: `${config.ask.title} («Нет» — ${NO_LABELS[config.ask.noEffect]})` },
    { step: "confirm", label: "Подтверждение", value: config.confirm.enabled ? config.confirm.title : "выключено" },
    {
      step: "when",
      label: "Дата и время",
      value: !config.when.enabled
        ? "выключено"
        : config.when.mode === "fixed"
          ? `${formatDayMonth(config.when.date)} в ${config.when.time}`
          : "выбирает получатель",
    },
    {
      step: "choice",
      label: "Выбор",
      value: config.choice.enabled
        ? `${CHOICE_CATEGORIES[config.choice.category].label.toLowerCase()}, вариантов: ${config.choice.options.length}`
        : "выключено",
    },
    { step: "final", label: "Финал", value: config.final.title },
  ];

  return (
    <>
      <section className="rounded-[28px] border border-app-line bg-app-card p-2">
        <ul className="divide-y divide-app-line">
          {rows.map((row) => (
            <li key={row.step} className="flex items-center gap-3 px-3 py-3">
              <span className="w-28 shrink-0 text-sm font-bold text-app-soft sm:w-36">{row.label}</span>
              <span className="min-w-0 flex-1 truncate font-semibold">{row.value || "—"}</span>
              <button
                type="button"
                onClick={() => onGoTo(row.step)}
                className="shrink-0 rounded-full px-3 py-1.5 text-sm font-bold text-app-accent-strong transition hover:bg-app-accent-soft"
              >
                изменить
              </button>
            </li>
          ))}
        </ul>
      </section>

      {problems.length > 0 && (
        <section className="rounded-[28px] border-2 border-app-accent/40 bg-app-accent-soft/40 p-5">
          <h3 className="font-extrabold">Нужно поправить</h3>
          <ul className="mt-3 flex flex-col gap-2">
            {problems.map((problem) => (
              <li key={`${problem.step}-${problem.message}`} className="flex items-center gap-3">
                <span className="flex-1">{problem.message}</span>
                <button
                  type="button"
                  onClick={() => onGoTo(problem.step)}
                  className="shrink-0 rounded-full bg-white px-3 py-1.5 text-sm font-extrabold"
                >
                  Исправить →
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {submitError && <p className="font-semibold text-app-accent">{submitError}</p>}

      <button
        type="button"
        onClick={onSubmit}
        disabled={problems.length > 0 || submitting}
        className="self-start rounded-full bg-app-accent px-8 py-4 text-lg font-extrabold text-app-accent-ink shadow-[0_14px_30px_-14px_var(--app-accent)] transition hover:bg-app-accent-strong active:scale-95 disabled:opacity-40 disabled:shadow-none"
      >
        {submitting ? "Сохраняю…" : editing ? "Сохранить изменения" : "Создать приглашение 💌"}
      </button>
    </>
  );
}
