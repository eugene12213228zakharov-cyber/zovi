"use client";

import { useRef } from "react";
import type { AskScreen, ImageRef, MediaRef, NoEffect, YesEffect } from "@/lib/invite/types";
import { Field, OptionCards, Section, Segmented, TextField, type OptionCardItem } from "../fields";
import { ImagePicker } from "../ImagePicker";
import { MediaRecorderField } from "../MediaRecorderField";
import type { StepProps } from "../types";

const YES_EFFECTS: OptionCardItem<YesEffect>[] = [
  { value: "boom", emoji: "💥", title: "Взрыв сердечек", description: "Кнопка трясётся и взрывается сердечками" },
  { value: "none", emoji: "🙂", title: "Спокойно", description: "Сразу к следующему экрану" },
];

const NO_EFFECTS: OptionCardItem<NoEffect>[] = [
  { value: "shrink", emoji: "🤏", title: "Уменьшается", description: "С каждым нажатием «Нет» меньше, а «Да» больше" },
  { value: "runaway", emoji: "🏃", title: "Убегает", description: "Уворачивается от курсора и пальца" },
  { value: "kiss", emoji: "💋", title: "Поцелуй", description: "Вместо отказа прилетает поцелуй" },
  { value: "honest", emoji: "🙏", title: "Честная", description: "Отказ засчитается, и ты его увидишь" },
];

const VISUAL_TABS = [
  { value: "image", label: "🖼 Картинка" },
  { value: "voice", label: "🎙 Голосовое" },
  { value: "circle", label: "⭕ Кружок" },
] as const;

export function StepAsk({ config, update }: StepProps) {
  const ask = config.ask;
  const visual = ask.visual;
  // Помним картинку, голосовое и кружок, чтобы переключение вкладок ничего не теряло.
  const cache = useRef<{ image: ImageRef | null; audio: MediaRef | null; video: MediaRef | null }>({
    image: visual.type === "circle" ? { kind: "sticker", id: "pleading" } : visual.image,
    audio: visual.type === "voice" ? visual.audio : null,
    video: visual.type === "circle" ? visual.video : null,
  });

  const setAsk = (patch: (current: AskScreen) => AskScreen) =>
    update((current) => ({ ...current, ask: patch(current.ask) }));

  function switchType(type: AskScreen["visual"]["type"]) {
    const { image, audio, video } = cache.current;
    setAsk((current) => ({
      ...current,
      visual: type === "image" ? { type, image } : type === "voice" ? { type, audio, image } : { type, video },
    }));
  }

  function setImage(image: ImageRef | null) {
    cache.current.image = image;
    setAsk((current) => {
      const v = current.visual;
      if (v.type === "image") return { ...current, visual: { type: "image", image } };
      if (v.type === "voice") return { ...current, visual: { type: "voice", audio: v.audio, image } };
      return current;
    });
  }

  function setAudio(audio: MediaRef | null) {
    cache.current.audio = audio;
    setAsk((current) =>
      current.visual.type === "voice"
        ? { ...current, visual: { type: "voice", audio, image: current.visual.image } }
        : current,
    );
  }

  function setVideo(video: MediaRef | null) {
    cache.current.video = video;
    setAsk((current) => (current.visual.type === "circle" ? { ...current, visual: { type: "circle", video } } : current));
  }

  return (
    <>
      <Section title="Что на экране" badge="№1">
        <Segmented value={visual.type} options={VISUAL_TABS} onChange={switchType} />
        {visual.type === "image" && <ImagePicker value={visual.image} onChange={setImage} />}
        {visual.type === "voice" && (
          <>
            <MediaRecorderField kind="voice" value={visual.audio} onChange={setAudio} />
            <Field label="Картинка над голосовым">
              <ImagePicker value={visual.image} onChange={setImage} />
            </Field>
          </>
        )}
        {visual.type === "circle" && <MediaRecorderField kind="circle" value={visual.video} onChange={setVideo} />}
      </Section>

      <Section title="Вопрос и кнопки" badge="№2">
        <TextField
          label="Вопрос"
          multiline
          value={ask.title}
          maxLength={300}
          onChange={(title) => setAsk((current) => ({ ...current, title }))}
        />
        <div className="grid gap-3 sm:grid-cols-2">
          <TextField
            label="Кнопка «Да»"
            value={ask.yesText}
            maxLength={40}
            onChange={(yesText) => setAsk((current) => ({ ...current, yesText }))}
          />
          <TextField
            label="Кнопка «Нет»"
            value={ask.noText}
            maxLength={40}
            onChange={(noText) => setAsk((current) => ({ ...current, noText }))}
          />
        </div>
      </Section>

      <Section title="Когда нажимают «Да»" badge="№3">
        <OptionCards
          value={ask.yesEffect}
          options={YES_EFFECTS}
          onChange={(yesEffect) => setAsk((current) => ({ ...current, yesEffect }))}
        />
      </Section>

      <Section title="Когда тянутся к «Нет»" badge="№4">
        <OptionCards
          value={ask.noEffect}
          options={NO_EFFECTS}
          onChange={(noEffect) => setAsk((current) => ({ ...current, noEffect }))}
        />
        <p className="text-sm text-app-soft">Попробуй в превью — поведение видно сразу.</p>
      </Section>
    </>
  );
}
