"use client";

import { useEffect, useMemo, useState } from "react";
import { createDefaultConfig } from "@/lib/invite/defaults";
import { toPublicConfig } from "@/lib/invite/public";
import { CHOICE_CATEGORIES } from "@/lib/invite/stickers";
import type { ChoiceCategory, InviteConfig, ThemeId } from "@/lib/invite/types";
import { firstStage, InviteFlow, stageAfter, type FlowStage } from "./InviteFlow";
import { PhoneFrame } from "./PhoneFrame";
import { ThemedStage } from "./ThemedStage";

const AUTOPLAY_MS = 3000;

/** Что показываем в телефоне на главной: разные поводы, а не одно свидание. */
const SHOWCASE: {
  label: string;
  theme: ThemeId;
  party: boolean;
  title: string;
  yes: string;
  no: string;
  sticker: string;
  category: ChoiceCategory;
  final: string;
}[] = [
  {
    label: "Свидание",
    theme: "zefir",
    party: false,
    title: "Ты пойдёшь со мной на свидание?",
    yes: "Да",
    no: "Нет",
    sticker: "pleading",
    category: "food",
    final: "Ура, это свидание! 💘",
  },
  {
    label: "День рождения",
    theme: "bilet",
    party: true,
    title: "Придёшь на мой день рождения?",
    yes: "Приду",
    no: "Не смогу",
    sticker: "party",
    category: "drink",
    final: "Ждём тебя! 🎂",
  },
  {
    label: "Вечеринка",
    theme: "vecher",
    party: true,
    title: "Собираемся в пятницу. Ты с нами?",
    yes: "Я в деле",
    no: "Пас",
    sticker: "party",
    category: "activity",
    final: "Вписка состоится 🎉",
  },
];

function buildConfig(index: number): InviteConfig {
  const item = SHOWCASE[index];
  const base = createDefaultConfig("female");
  const category = CHOICE_CATEGORIES[item.category];
  return {
    ...base,
    audience: item.party ? "party" : "single",
    theme: item.theme,
    ask: {
      ...base.ask,
      title: item.title,
      yesText: item.yes,
      noText: item.no,
      noEffect: item.party ? "shrink" : "runaway",
      visual: { type: "image", image: { kind: "sticker", id: item.sticker } },
    },
    confirm: { ...base.confirm, enabled: false },
    choice: {
      ...base.choice,
      category: item.category,
      title: category.title,
      subtitle: category.subtitle,
      options: category.options.slice(0, 6).map((option) => ({
        id: option.id,
        label: option.label,
        image: { kind: "sticker", id: option.id },
      })),
    },
    final: { ...base.final, title: item.final },
  };
}

/**
 * Живой пример на главной. Пока его не трогают — экраны сменяются сами и по кругу
 * меняются поводы; как только посетитель нажал сам, показ останавливается.
 */
export function LandingDemo() {
  const [index, setIndex] = useState(0);
  const [touched, setTouched] = useState(false);
  const config = useMemo(() => toPublicConfig(buildConfig(index)), [index]);
  const [stage, setStage] = useState<FlowStage>("ask");
  const [run, setRun] = useState(0);

  useEffect(() => {
    if (touched) return;
    const timer = window.setInterval(() => {
      setStage((current) => {
        if (current === "final") {
          // Круг пройден — показываем следующий повод.
          setIndex((value) => (value + 1) % SHOWCASE.length);
          setRun((count) => count + 1);
          return "ask";
        }
        return stageAfter(config, current);
      });
    }, AUTOPLAY_MS);
    return () => window.clearInterval(timer);
  }, [config, touched]);

  return (
    <div className="flex w-full flex-col items-center gap-3">
      <PhoneFrame>
        <ThemedStage theme={config.theme} layout="frame" party={config.audience === "party"}>
          <InviteFlow
            key={`${index}-${run}`}
            config={config}
            stage={stage}
            onStageChange={(next) => {
              setTouched(true);
              setStage(next);
            }}
            preview
          />
        </ThemedStage>
      </PhoneFrame>

      <div className="flex items-center gap-1.5">
        {SHOWCASE.map((item, at) => (
          <button
            key={item.label}
            type="button"
            aria-label={item.label}
            aria-current={at === index}
            onClick={() => {
              setTouched(true);
              setIndex(at);
              setStage(firstStage(config));
              setRun((count) => count + 1);
            }}
            className={`h-2 rounded-full transition-all ${at === index ? "w-6 bg-app-accent" : "w-2 bg-app-line"}`}
          />
        ))}
      </div>
      <span className="text-sm font-bold text-app-soft">{SHOWCASE[index].label}</span>
    </div>
  );
}
