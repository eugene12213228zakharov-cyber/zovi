"use client";

import { useEffect, useRef } from "react";
import type { ChoiceScreen as ChoiceScreenConfig } from "@/lib/invite/types";
import { StickerImage } from "../StickerImage";
import { PrimaryButton, ScreenCard, ScreenText, ScreenTitle } from "../ui";

interface ChoiceScreenProps {
  choice: ChoiceScreenConfig;
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  onNext: (labels: string[]) => void;
}

export function ChoiceScreen({ choice, selectedIds, onChange, onNext }: ChoiceScreenProps) {
  const timer = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (timer.current) window.clearTimeout(timer.current);
    },
    [],
  );

  const labelsFor = (ids: string[]) =>
    choice.options.filter((option) => ids.includes(option.id)).map((option) => option.label);

  function toggle(id: string) {
    if (choice.multiple) {
      onChange(selectedIds.includes(id) ? selectedIds.filter((selected) => selected !== id) : [...selectedIds, id]);
      return;
    }
    // Одиночный выбор: подсвечиваем и сами идём дальше — кнопка не нужна.
    onChange([id]);
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => onNext(labelsFor([id])), 420);
  }

  const dense = choice.options.length > 6;

  return (
    <ScreenCard>
      <div className="flex flex-col gap-2">
        <ScreenTitle>{choice.title}</ScreenTitle>
        {choice.subtitle && <ScreenText>{choice.subtitle}</ScreenText>}
      </div>

      <div className={`grid w-full gap-3 ${dense ? "grid-cols-3" : "grid-cols-2"}`}>
        {choice.options.map((option) => {
          const selected = selectedIds.includes(option.id);
          return (
            <button
              key={option.id}
              type="button"
              aria-pressed={selected}
              onClick={() => toggle(option.id)}
              className={`relative flex flex-col items-center gap-2 rounded-[24px] border-2 px-2 py-3 transition active:scale-95 ${
                selected ? "border-accent bg-accent-soft" : "border-transparent bg-muted/60"
              }`}
            >
              <StickerImage image={option.image} size={dense ? "sm" : "md"} />
              <span className="text-[15px] font-bold leading-tight text-ink">{option.label}</span>
              {selected && (
                <span className="absolute right-2 top-2 grid h-6 w-6 place-items-center rounded-full bg-accent text-xs font-black text-accent-ink">
                  ✓
                </span>
              )}
            </button>
          );
        })}
      </div>

      {choice.multiple && (
        <PrimaryButton
          className="w-full"
          disabled={selectedIds.length === 0}
          onClick={() => onNext(labelsFor(selectedIds))}
        >
          {choice.buttonText}
        </PrimaryButton>
      )}
    </ScreenCard>
  );
}
