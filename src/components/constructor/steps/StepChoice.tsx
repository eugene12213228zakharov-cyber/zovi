"use client";

import { useState } from "react";
import { StickerImage } from "@/components/invite/StickerImage";
import { basisOf, rebaseDefaults } from "@/lib/invite/defaults";
import { ALL_STICKERS, CHOICE_CATEGORIES, CHOICE_CATEGORY_ORDER } from "@/lib/invite/stickers";
import type { ChoiceOption, ChoiceScreen } from "@/lib/invite/types";
import { Chip, IconButton, Section, TextField, Toggle } from "../fields";
import { ImagePicker } from "../ImagePicker";
import type { StepProps } from "../types";

const MAX_OPTIONS = 12;
const MIN_OPTIONS = 2;
const newOptionId = () => `opt-${Math.random().toString(36).slice(2, 10)}`;

export function StepChoice({ config, update }: StepProps) {
  const choice = config.choice;
  const [openId, setOpenId] = useState<string | null>(null);

  const set = (patch: (current: ChoiceScreen) => ChoiceScreen) =>
    update((current) => ({ ...current, choice: patch(current.choice) }));

  const setOption = (id: string, patch: Partial<ChoiceOption>) =>
    set((current) => ({
      ...current,
      options: current.options.map((option) => (option.id === id ? { ...option, ...patch } : option)),
    }));

  function moveOption(id: string, delta: -1 | 1) {
    set((current) => {
      const from = current.options.findIndex((option) => option.id === id);
      const to = from + delta;
      if (from < 0 || to < 0 || to >= current.options.length) return current;
      const options = [...current.options];
      [options[from], options[to]] = [options[to], options[from]];
      return { ...current, options };
    });
  }

  function removeOption(id: string) {
    set((current) =>
      current.options.length <= MIN_OPTIONS
        ? current
        : { ...current, options: current.options.filter((option) => option.id !== id) },
    );
  }

  function addOption() {
    const id = newOptionId();
    set((current) =>
      current.options.length >= MAX_OPTIONS
        ? current
        : { ...current, options: [...current.options, { id, label: "", image: null }] },
    );
    setOpenId(id);
  }

  // В выборе картинки для варианта сначала стикеры текущей темы, потом все остальные.
  const categoryStickers = CHOICE_CATEGORIES[choice.category].options;
  const pickerStickers = [...categoryStickers, ...ALL_STICKERS.filter((sticker) => !categoryStickers.includes(sticker))];

  return (
    <>
      <Section title="Экран выбора">
        <Toggle
          checked={choice.enabled}
          onChange={(choiceEnabled) => update((current) => rebaseDefaults(current, { ...basisOf(current), choiceEnabled }))}
          label="Показывать"
          description="Получатель выберет, что вы будете есть, смотреть или делать"
        />
      </Section>

      {choice.enabled && (
        <>
          <Section title="О чём спрашиваем" badge="№1">
            <div className="flex flex-wrap gap-2">
              {CHOICE_CATEGORY_ORDER.map((category) => (
                <Chip
                  key={category}
                  selected={choice.category === category}
                  onClick={() => update((current) => rebaseDefaults(current, { ...basisOf(current), category }))}
                >
                  {CHOICE_CATEGORIES[category].options[0].emoji} {CHOICE_CATEGORIES[category].label}
                </Chip>
              ))}
            </div>
            <p className="text-sm text-app-soft">При смене темы варианты заменятся на подходящие.</p>
          </Section>

          <Section title="Тексты" badge="№2">
            <TextField
              label="Заголовок"
              multiline
              value={choice.title}
              maxLength={300}
              onChange={(title) => set((current) => ({ ...current, title }))}
            />
            <TextField
              label="Подзаголовок"
              multiline
              value={choice.subtitle}
              maxLength={300}
              onChange={(subtitle) => set((current) => ({ ...current, subtitle }))}
            />
            <Toggle
              checked={choice.multiple}
              onChange={(multiple) => set((current) => ({ ...current, multiple }))}
              label="Можно выбрать несколько"
              description="Получатель отметит варианты и нажмёт кнопку"
            />
            {choice.multiple && (
              <TextField
                label="Кнопка"
                value={choice.buttonText}
                maxLength={40}
                onChange={(buttonText) => set((current) => ({ ...current, buttonText }))}
              />
            )}
          </Section>

          <Section title="Варианты" badge={`${choice.options.length} из ${MAX_OPTIONS}`}>
            <ul className="flex flex-col gap-2">
              {choice.options.map((option, index) => {
                const open = openId === option.id;
                return (
                  <li
                    key={option.id}
                    className={`rounded-2xl border-2 bg-white transition ${open ? "border-app-accent/60" : "border-app-line"}`}
                  >
                    <div className="flex items-center gap-1.5 p-2">
                      <button
                        type="button"
                        onClick={() => setOpenId(open ? null : option.id)}
                        aria-expanded={open}
                        aria-label={`Картинка для варианта ${index + 1}`}
                        className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-app-bg transition hover:bg-app-accent-soft"
                      >
                        {option.image ? (
                          <StickerImage image={option.image} size="xs" />
                        ) : (
                          <span className="text-lg font-bold text-app-soft">＋</span>
                        )}
                      </button>
                      <input
                        value={option.label}
                        maxLength={40}
                        placeholder={`Вариант ${index + 1}`}
                        aria-label={`Название варианта ${index + 1}`}
                        onChange={(event) => setOption(option.id, { label: event.target.value })}
                        className="min-w-0 flex-1 rounded-xl bg-transparent px-2 py-2 text-[16px] font-bold outline-none focus:bg-app-bg"
                      />
                      <IconButton label="Выше" onClick={() => moveOption(option.id, -1)} disabled={index === 0}>
                        ↑
                      </IconButton>
                      <IconButton
                        label="Ниже"
                        onClick={() => moveOption(option.id, 1)}
                        disabled={index === choice.options.length - 1}
                      >
                        ↓
                      </IconButton>
                      <IconButton
                        label="Удалить"
                        onClick={() => removeOption(option.id)}
                        disabled={choice.options.length <= MIN_OPTIONS}
                      >
                        ✕
                      </IconButton>
                    </div>
                    {open && (
                      <div className="border-t border-app-line p-3">
                        <ImagePicker
                          value={option.image}
                          stickers={pickerStickers}
                          onChange={(image) => setOption(option.id, { image })}
                        />
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
            <button
              type="button"
              onClick={addOption}
              disabled={choice.options.length >= MAX_OPTIONS}
              className="rounded-2xl border-2 border-dashed border-app-line py-3 font-extrabold text-app-soft transition hover:border-app-accent/50 hover:text-app-ink disabled:opacity-40"
            >
              ＋ Добавить вариант
            </button>
          </Section>
        </>
      )}
    </>
  );
}
