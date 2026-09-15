"use client";

import { useEffect } from "react";
import { buildIcs } from "@/lib/invite/calendar";
import { fillPlaceholders, type PlaceholderValues } from "@/lib/invite/format";
import type { FinalScreen as FinalScreenConfig } from "@/lib/invite/types";
import { confettiRain } from "../effects";
import { StickerImage } from "../StickerImage";
import { ScreenCard, ScreenText, ScreenTitle, SoftButton } from "../ui";

export function FinalScreen({ final, values }: { final: FinalScreenConfig; values: PlaceholderValues }) {
  useEffect(() => {
    const timer = window.setTimeout(() => confettiRain(), 250);
    return () => window.clearTimeout(timer);
  }, []);

  const text = fillPlaceholders(final.text, values);
  const ics =
    final.showCalendar && values.date && values.time
      ? buildIcs({ title: "Свидание 💘", description: text, date: values.date, time: values.time })
      : null;

  function addToCalendar() {
    if (!ics) return;
    const url = URL.createObjectURL(new Blob([ics], { type: "text/calendar;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "svidanie.ics";
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 5000);
  }

  return (
    <ScreenCard>
      <StickerImage image={final.image} size="xl" float />
      <ScreenTitle>{final.title}</ScreenTitle>
      {text && <ScreenText>{text}</ScreenText>}
      {ics && (
        <SoftButton className="w-full" onClick={addToCalendar}>
          🗓 Добавить в календарь
        </SoftButton>
      )}
    </ScreenCard>
  );
}
