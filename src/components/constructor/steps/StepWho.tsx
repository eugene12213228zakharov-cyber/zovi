"use client";

import { basisOf, rebaseDefaults } from "@/lib/invite/defaults";
import { THEMES } from "@/lib/themes";
import { OptionCards, Section, TextField, Toggle } from "../fields";
import type { StepProps } from "../types";

export function StepWho({ config, update }: StepProps) {
  const party = config.audience === "party";

  return (
    <>
      <Section title="Кого приглашаешь">
        <OptionCards
          value={config.audience}
          onChange={(audience) => update((current) => ({ ...current, audience }))}
          options={[
            { value: "single", emoji: "💌", title: "Одного человека", description: "Свидание: ссылка для неё или него, один ответ" },
            { value: "party", emoji: "🎉", title: "Компанию", description: "День рождения, свадьба, посиделки: каждый ответит за себя" },
          ]}
        />

        {party ? (
          <p className="text-sm text-app-soft">
            Одну ссылку можно кинуть хоть в общий чат. Каждый гость назовёт себя, а ты увидишь список — кто идёт, кто нет.
          </p>
        ) : (
          <>
            <OptionCards
              value={config.gender}
              onChange={(gender) => update((current) => rebaseDefaults(current, { ...basisOf(current), gender }))}
              options={[
                { value: "female", emoji: "👩", title: "Девушку", description: "«Ты правда сказала „да“?», «Когда ты свободна?»" },
                { value: "male", emoji: "👨", title: "Парня", description: "«Ты правда сказал „да“?», «Когда ты свободен?»" },
              ]}
            />
            <p className="text-sm text-app-soft">Тексты, которые ты уже изменил вручную, останутся как есть.</p>
          </>
        )}
      </Section>

      {party && (
        <Section title="Знакомство с гостем">
          <Toggle
            checked={config.party.showGuests}
            onChange={(showGuests) => update((current) => ({ ...current, party: { ...current.party, showGuests } }))}
            label="Гости видят, кто уже идёт"
            description="На последнем экране появится список согласившихся."
          />
          <details className="group">
            <summary className="cursor-pointer list-none text-sm font-extrabold text-app-accent">
              Настроить экран «представься» ▾
            </summary>
            <div className="mt-4 flex flex-col gap-4">
              <TextField
                label="Вопрос"
                value={config.party.title}
                maxLength={300}
                onChange={(title) => update((current) => ({ ...current, party: { ...current.party, title } }))}
              />
              <TextField
                label="Подпись под вопросом"
                value={config.party.subtitle}
                maxLength={300}
                onChange={(subtitle) => update((current) => ({ ...current, party: { ...current.party, subtitle } }))}
              />
              <TextField
                label="Подсказка в поле"
                value={config.party.placeholder}
                maxLength={40}
                onChange={(placeholder) => update((current) => ({ ...current, party: { ...current.party, placeholder } }))}
              />
              <TextField
                label="Кнопка"
                value={config.party.buttonText}
                maxLength={40}
                onChange={(buttonText) => update((current) => ({ ...current, party: { ...current.party, buttonText } }))}
              />
            </div>
          </details>
        </Section>
      )}

      <Section title="Настроение">
        <div className="grid grid-cols-2 gap-3" role="radiogroup" aria-label="Тема оформления">
          {THEMES.map((theme) => {
            const selected = theme.id === config.theme;
            const [background, accent, background2] = theme.swatches;
            return (
              <button
                key={theme.id}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => update((current) => ({ ...current, theme: theme.id }))}
                className={`overflow-hidden rounded-[22px] border-2 text-left transition active:scale-[0.98] ${
                  selected ? "border-app-accent" : "border-app-line hover:border-app-accent/40"
                }`}
              >
                <div
                  className="flex h-20 items-center justify-center gap-2"
                  style={{ background: `linear-gradient(135deg, ${background}, ${background2})` }}
                >
                  <span className="rounded-full px-4 py-1.5 text-xs font-extrabold text-white" style={{ background: accent }}>
                    Да
                  </span>
                  <span className="rounded-full bg-white/70 px-3 py-1.5 text-xs font-bold text-black/55">Нет</span>
                </div>
                <div className="bg-white p-3">
                  <div className="font-extrabold">{theme.name}</div>
                  <div className="text-xs text-app-soft">{theme.description}</div>
                </div>
              </button>
            );
          })}
        </div>
      </Section>
    </>
  );
}
