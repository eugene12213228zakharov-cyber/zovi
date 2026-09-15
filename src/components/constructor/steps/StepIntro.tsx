"use client";

import { useState } from "react";
import { TIMEZONES, utcToZoned, zonedToUtcIso } from "@/lib/invite/timezones";
import type { IntroConfig, IntroMode } from "@/lib/invite/types";
import { Field, inputClass, OptionCards, Section, TextField, type OptionCardItem } from "../fields";
import { ImagePicker } from "../ImagePicker";
import type { StepProps } from "../types";

const MODES: OptionCardItem<IntroMode>[] = [
  { value: "none", emoji: "✨", title: "Сразу", description: "Без сюрпризов — сразу к вопросу" },
  { value: "pin", emoji: "🔢", title: "PIN-код", description: "Откроется по 4 цифрам, которые знаете вы двое" },
  { value: "scratch", emoji: "🪙", title: "Стереть слой", description: "Как лотерейный билет — стирается пальцем" },
  { value: "envelope", emoji: "✉️", title: "Конверт", description: "Сначала нужно открыть письмо" },
  { value: "scheduled", emoji: "⏰", title: "По таймеру", description: "До нужной минуты — только обратный отсчёт" },
];

const SCRATCH_COLORS = ["#FF5C8A", "#FF8A5C", "#8B5CF6", "#0EA5E9", "#10B981", "#1F1A24", "#B08D57"];

type IntroUpdater = (patch: (current: IntroConfig) => IntroConfig) => void;

export function StepIntro({ config, update }: StepProps) {
  const intro = config.intro;
  const setIntro: IntroUpdater = (patch) => update((current) => ({ ...current, intro: patch(current.intro) }));

  return (
    <>
      <Section title="Что будет при открытии ссылки">
        <OptionCards columns={3} value={intro.mode} options={MODES} onChange={(mode) => setIntro((current) => ({ ...current, mode }))} />
      </Section>

      {intro.mode === "pin" && (
        <Section title="PIN-код">
          <TextField
            label="Подсказка над кодом"
            value={intro.pin.question}
            maxLength={200}
            onChange={(question) => setIntro((current) => ({ ...current, pin: { ...current.pin, question } }))}
          />
          <Field label="Код из 4 цифр" hint="Например, дата знакомства: 1406. Код проверяет сервер — подсмотреть его в браузере не получится.">
            <input
              inputMode="numeric"
              autoComplete="off"
              maxLength={4}
              placeholder="••••"
              aria-label="PIN-код"
              value={intro.pin.code}
              onChange={(event) => {
                const code = event.target.value.replace(/\D/g, "").slice(0, 4);
                setIntro((current) => ({ ...current, pin: { ...current.pin, code } }));
              }}
              className={`${inputClass} w-44 text-center font-brand text-3xl tracking-[0.4em]`}
            />
          </Field>
        </Section>
      )}

      {intro.mode === "scratch" && (
        <Section title="Слой, который стирают">
          <TextField
            label="Надпись на слое"
            value={intro.scratch.message}
            maxLength={120}
            onChange={(message) => setIntro((current) => ({ ...current, scratch: { ...current.scratch, message } }))}
          />
          <Field label="Цвет слоя">
            <div className="flex flex-wrap items-center gap-2">
              {SCRATCH_COLORS.map((color) => {
                const selected = intro.scratch.color.toUpperCase() === color;
                return (
                  <button
                    key={color}
                    type="button"
                    aria-label={`Цвет ${color}`}
                    aria-pressed={selected}
                    onClick={() => setIntro((current) => ({ ...current, scratch: { ...current.scratch, color } }))}
                    className={`h-10 w-10 rounded-full border-4 transition active:scale-90 ${selected ? "border-app-ink" : "border-white shadow"}`}
                    style={{ background: color }}
                  />
                );
              })}
              <input
                type="color"
                aria-label="Свой цвет"
                value={intro.scratch.color.toLowerCase()}
                onChange={(event) => {
                  const color = event.target.value.toUpperCase();
                  setIntro((current) => ({ ...current, scratch: { ...current.scratch, color } }));
                }}
                className="h-10 w-14 cursor-pointer rounded-lg border border-app-line bg-white"
              />
            </div>
          </Field>
        </Section>
      )}

      {intro.mode === "envelope" && (
        <Section title="Конверт">
          <TextField
            label="Надпись над конвертом"
            value={intro.envelope.hint}
            maxLength={120}
            onChange={(hint) => setIntro((current) => ({ ...current, envelope: { hint } }))}
          />
        </Section>
      )}

      {intro.mode === "scheduled" && <ScheduledSettings intro={intro} setIntro={setIntro} />}
    </>
  );
}

function ScheduledSettings({ intro, setIntro }: { intro: IntroConfig; setIntro: IntroUpdater }) {
  const scheduled = intro.scheduled;
  const [local, setLocal] = useState(() => utcToZoned(scheduled.unlockAt, scheduled.timezone));

  function apply(next: { date: string; time: string }, timezone: string = scheduled.timezone) {
    setLocal(next);
    const unlockAt = zonedToUtcIso(next.date, next.time, timezone);
    if (unlockAt) setIntro((current) => ({ ...current, scheduled: { ...current.scheduled, unlockAt, timezone } }));
  }

  const past = Date.parse(scheduled.unlockAt) <= Date.now();

  return (
    <Section title="Когда откроется">
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Дата">
          <input
            type="date"
            aria-label="Дата открытия"
            value={local.date}
            onChange={(event) => apply({ ...local, date: event.target.value })}
            className={inputClass}
          />
        </Field>
        <Field label="Время">
          <input
            type="time"
            aria-label="Время открытия"
            value={local.time}
            onChange={(event) => apply({ ...local, time: event.target.value })}
            className={inputClass}
          />
        </Field>
      </div>
      <Field label="Часовой пояс">
        <select
          aria-label="Часовой пояс"
          value={scheduled.timezone}
          onChange={(event) => apply(local, event.target.value)}
          className={inputClass}
        >
          {TIMEZONES.map((zone) => (
            <option key={zone.id} value={zone.id}>
              {zone.label}
            </option>
          ))}
        </select>
      </Field>
      {past && <p className="text-sm font-semibold text-app-accent">Это время уже прошло — выбери момент в будущем.</p>}
      <TextField
        label="Текст, пока ждёт"
        value={scheduled.waitMessage}
        maxLength={200}
        onChange={(waitMessage) => setIntro((current) => ({ ...current, scheduled: { ...current.scheduled, waitMessage } }))}
      />
      <TextField
        label="Текст, когда время пришло"
        value={scheduled.readyMessage}
        maxLength={200}
        onChange={(readyMessage) => setIntro((current) => ({ ...current, scheduled: { ...current.scheduled, readyMessage } }))}
      />
      <Field label="Картинка на экране ожидания">
        <ImagePicker
          value={scheduled.image}
          onChange={(image) => setIntro((current) => ({ ...current, scheduled: { ...current.scheduled, image } }))}
        />
      </Field>
    </Section>
  );
}
