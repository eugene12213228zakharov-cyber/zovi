"use client";

import type { ConfirmScreen } from "@/lib/invite/types";
import { Section, TextField, Toggle } from "../fields";
import { ImagePicker } from "../ImagePicker";
import type { StepProps } from "../types";

export function StepConfirm({ config, update }: StepProps) {
  const confirm = config.confirm;
  const set = (patch: Partial<ConfirmScreen>) =>
    update((current) => ({ ...current, confirm: { ...current.confirm, ...patch } }));
  const said = config.gender === "female" ? "сказала" : "сказал";

  return (
    <>
      <Section title="Экран после «Да»">
        <Toggle
          checked={confirm.enabled}
          onChange={(enabled) => set({ enabled })}
          label="Показывать"
          description={`Шуточное «ты правда ${said} „да“?» перед выбором даты`}
        />
      </Section>

      {confirm.enabled && (
        <>
          <Section title="Картинка" badge="№1">
            <ImagePicker value={confirm.image} onChange={(image) => set({ image })} />
          </Section>
          <Section title="Тексты" badge="№2">
            <TextField label="Заголовок" multiline value={confirm.title} maxLength={300} onChange={(title) => set({ title })} />
            <TextField
              label="Подзаголовок"
              multiline
              value={confirm.subtitle}
              maxLength={300}
              onChange={(subtitle) => set({ subtitle })}
            />
            <TextField
              label="Кнопка"
              value={confirm.buttonText}
              maxLength={40}
              onChange={(buttonText) => set({ buttonText })}
            />
          </Section>
        </>
      )}
    </>
  );
}
