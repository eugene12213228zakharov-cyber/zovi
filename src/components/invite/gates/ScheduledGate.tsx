"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { countdownParts } from "@/lib/invite/format";
import { timezoneLabel } from "@/lib/invite/timezones";
import type { ImageRef } from "@/lib/invite/types";
import { StickerImage } from "../StickerImage";
import { PrimaryButton, ScreenCard, ScreenText, ScreenTitle } from "../ui";

interface ScheduledGateProps {
  unlockAt: string;
  timezone: string;
  waitMessage: string;
  image: ImageRef | null;
  onReady: () => void;
  children?: ReactNode;
}

/** «Откроется в выбранное время»: обратный отсчёт до момента открытия. */
export function ScheduledGate({ unlockAt, timezone, waitMessage, image, onReady, children }: ScheduledGateProps) {
  const target = Date.parse(unlockAt);
  // Время узнаём только в браузере, иначе серверная и клиентская разметка разойдутся.
  const [now, setNow] = useState<number | null>(null);
  const fired = useRef(false);
  const onReadyRef = useRef(onReady);

  useEffect(() => {
    onReadyRef.current = onReady;
  });

  useEffect(() => {
    setNow(Date.now());
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const parts = now === null ? null : countdownParts(target, now);
  const done = parts?.done ?? false;

  useEffect(() => {
    if (done && !fired.current) {
      fired.current = true;
      onReadyRef.current();
    }
  }, [done]);

  const tiles: [string, number | undefined][] = [
    ["дн", parts?.days],
    ["ч", parts?.hours],
    ["мин", parts?.minutes],
    ["сек", parts?.seconds],
  ];

  return (
    <ScreenCard>
      <StickerImage image={image} size="lg" float />
      <ScreenTitle>{waitMessage}</ScreenTitle>
      <div className="grid w-full grid-cols-4 gap-2">
        {tiles.map(([label, value]) => (
          <div key={label} className="rounded-[20px] bg-accent-soft px-1 py-3">
            <div className="font-display text-[28px] font-bold leading-none tabular-nums text-ink">
              {value === undefined ? "--" : String(value).padStart(2, "0")}
            </div>
            <div className="mt-1 text-xs font-bold uppercase tracking-wide text-ink-soft">{label}</div>
          </div>
        ))}
      </div>
      <ScreenText>Откроется {formatUnlock(unlockAt, timezone)}</ScreenText>
      {children}
    </ScreenCard>
  );
}

export function ReadyScreen({ message, onOpen }: { message: string; onOpen: () => void }) {
  return (
    <ScreenCard>
      <StickerImage image={{ kind: "sticker", id: "love-letter" }} size="xl" float />
      <ScreenTitle>{message}</ScreenTitle>
      <PrimaryButton className="w-full animate-pulse-soft" onClick={onOpen}>
        Открыть 💌
      </PrimaryButton>
    </ScreenCard>
  );
}

function formatUnlock(iso: string, timeZone: string): string {
  try {
    const text = new Intl.DateTimeFormat("ru-RU", {
      timeZone,
      day: "numeric",
      month: "long",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(iso));
    return `${text} (${timezoneLabel(timeZone)})`;
  } catch {
    return new Date(iso).toLocaleString("ru-RU");
  }
}
