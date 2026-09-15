"use client";

import { basisOf, rebaseDefaults } from "@/lib/invite/defaults";
import { toIsoDate } from "@/lib/invite/format";
import type { WhenScreen } from "@/lib/invite/types";
import { Field, inputClass, Section, Segmented, TextField, Toggle } from "../fields";
import { ImagePicker } from "../ImagePicker";
import type { StepProps } from "../types";

export function StepWhen({ config, update }: StepProps) {
  const when = config.when;
  const set = (patch: Partial<WhenScreen>) => update((current) => ({ ...current, when: { ...current.when, ...patch } }));
  const female = config.gender === "female";

  return (
    <>
      <Section title="Экран даты и времени">
        <Toggle
          checked={when.enabled}
          onChange={(whenEnabled) => update((current) => rebaseDefaults(current, { ...basisOf(current), whenEnabled }))}
          label="Спрашивать дату и время"
          description="Если выключить, финальный текст подстроится сам"
        />
      </Section>

      {when.enabled && (
        <>
          <Section title="Кто выбирает" badge="№1">
            <Segmented
              value={when.mode}
              onChange={(mode) => set({ mode })}
              options={[
                { value: "recipient", label: female ? "Пусть выберет сама" : "Пусть выберет сам" },
                { value: "fixed", label: "Назначу я" },
              ]}
            />
            {when.mode === "fixed" ? (
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Дата">
                  <input
                    type="date"
                    aria-label="Дата свидания"
                    value={when.date}
                    min={toIsoDate(new Date())}
                    onChange={(event) => {
                      if (event.target.value) set({ date: event.target.value });
                    }}
                    className={inputClass}
                  />
                </Field>
                <Field label="Время">
                  <input
                    type="time"
                    aria-label="Время свидания"
                    value={when.time}
                    onChange={(event) => {
                      if (event.target.value) set({ time: event.target.value.slice(0, 5) });
                    }}
                    className={inputClass}
                  />
                </Field>
              </div>
            ) : (
              <p className="text-sm text-app-soft">
                Получатель увидит ближайшие две недели и удобные слоты времени — и сможет указать своё.
              </p>
            )}
          </Section>

          <Section title="Картинка" badge="№2">
            <ImagePicker value={when.image} onChange={(image) => set({ image })} />
          </Section>

          <Section title="Тексты" badge="№3">
            <TextField label="Заголовок" multiline value={when.title} maxLength={300} onChange={(title) => set({ title })} />
            <TextField label="Кнопка" value={when.buttonText} maxLength={40} onChange={(buttonText) => set({ buttonText })} />
          </Section>
        </>
      )}
    </>
  );
}
