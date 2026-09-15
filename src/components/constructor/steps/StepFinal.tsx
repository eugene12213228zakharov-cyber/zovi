"use client";

import { useRef } from "react";
import type { FinalScreen } from "@/lib/invite/types";
import { inputClass, Section, TextField, Toggle } from "../fields";
import { ImagePicker } from "../ImagePicker";
import type { StepProps } from "../types";

const MAX_TEXT = 500;

const PLACEHOLDERS = [
  { token: "{date}", label: "📅 дата" },
  { token: "{time}", label: "⏰ время" },
  { token: "{choice}", label: "✨ выбор" },
];

export function StepFinal({ config, update }: StepProps) {
  const final = config.final;
  const textRef = useRef<HTMLTextAreaElement>(null);
  const set = (patch: Partial<FinalScreen>) => update((current) => ({ ...current, final: { ...current.final, ...patch } }));

  /** Вставляет подстановку туда, где стоит курсор. */
  function insert(token: string) {
    const area = textRef.current;
    const start = area?.selectionStart ?? final.text.length;
    const end = area?.selectionEnd ?? final.text.length;
    set({ text: (final.text.slice(0, start) + token + final.text.slice(end)).slice(0, MAX_TEXT) });
    requestAnimationFrame(() => {
      if (!area) return;
      const caret = Math.min(start + token.length, MAX_TEXT);
      area.focus();
      area.setSelectionRange(caret, caret);
    });
  }

  const warnings: string[] = [];
  if (!config.when.enabled && /\{(date|time)\}/.test(final.text)) {
    warnings.push("Экран даты выключен — вместо {date} и {time} будет «…».");
  }
  if (!config.choice.enabled && /\{(choice|food)\}/.test(final.text)) {
    warnings.push("Экран выбора выключен — вместо {choice} будет «…».");
  }

  return (
    <>
      <Section title="Картинка" badge="№1">
        <ImagePicker value={final.image} onChange={(image) => set({ image })} />
      </Section>

      <Section title="Тексты" badge="№2">
        <TextField label="Заголовок" multiline value={final.title} maxLength={300} onChange={(title) => set({ title })} />
        <div className="flex flex-col gap-1.5">
          <div className="flex items-baseline justify-between gap-2">
            <label htmlFor="final-text" className="text-sm font-bold">
              Текст
            </label>
            <span className="text-xs tabular-nums text-app-soft">
              {final.text.length}/{MAX_TEXT}
            </span>
          </div>
          <textarea
            id="final-text"
            ref={textRef}
            rows={4}
            maxLength={MAX_TEXT}
            value={final.text}
            onChange={(event) => set({ text: event.target.value })}
            className={`${inputClass} resize-none`}
          />
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-app-soft">Вставить:</span>
            {PLACEHOLDERS.map((placeholder) => (
              <button
                key={placeholder.token}
                type="button"
                onClick={() => insert(placeholder.token)}
                className="rounded-full bg-app-accent-soft px-3 py-1.5 text-xs font-extrabold text-app-accent-strong transition active:scale-95"
              >
                {placeholder.label}
              </button>
            ))}
          </div>
          <p className="text-xs text-app-soft">
            Получатель увидит свой выбор: «{"{date}"} в {"{time}"}» превратится в «20 сентября в 19:30».
          </p>
          {warnings.map((warning) => (
            <p key={warning} className="text-sm font-semibold text-app-accent">
              {warning}
            </p>
          ))}
        </div>
      </Section>

      {config.when.enabled && (
        <Section title="Календарь">
          <Toggle
            checked={final.showCalendar}
            onChange={(showCalendar) => set({ showCalendar })}
            label="Кнопка «Добавить в календарь»"
            description="Получатель сохранит свидание в календарь телефона"
          />
        </Section>
      )}
    </>
  );
}
