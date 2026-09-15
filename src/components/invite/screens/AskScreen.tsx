"use client";

import { useEffect, useRef, useState } from "react";
import type { AskScreen as AskScreenConfig } from "@/lib/invite/types";
import { burstFrom } from "../effects";
import { CirclePlayer, VoiceBubble } from "../media";
import { StickerImage } from "../StickerImage";
import { PrimaryButton, ScreenCard, ScreenTitle, SoftButton } from "../ui";

const NO_LINES = ["Точно нет?", "Подумай ещё 🥺", "Ну пожалуйста!", "Последний шанс", "Я расстроюсь 💔", "Может, всё-таки «да»?"];
const SHRINK_LIMIT = 7;

interface AskScreenProps {
  ask: AskScreenConfig;
  /** false — экран лежит под слоем «стереть», кнопки пока не нажимаются. */
  interactive?: boolean;
  onYes: () => void;
  onNo: (count: number) => void;
  onDecline: () => void;
}

export function AskScreen({ ask, interactive = true, onYes, onNo, onDecline }: AskScreenProps) {
  const [noCount, setNoCount] = useState(0);
  const [shaking, setShaking] = useState(false);
  const [kisses, setKisses] = useState<number[]>([]);
  const [runaway, setRunaway] = useState<{ x: number; y: number } | null>(null);
  const yesRef = useRef<HTMLButtonElement>(null);
  const noRef = useRef<HTMLButtonElement>(null);
  const arenaRef = useRef<HTMLDivElement>(null);
  const timers = useRef<number[]>([]);
  const leaving = useRef(false);

  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach((timer) => window.clearTimeout(timer));
  }, []);

  const later = (task: () => void, ms: number) => {
    timers.current.push(window.setTimeout(task, ms));
  };

  const noLabel = noCount === 0 ? ask.noText : NO_LINES[(noCount - 1) % NO_LINES.length];

  function countNo() {
    const next = noCount + 1;
    setNoCount(next);
    onNo(next);
  }

  function handleYes() {
    if (leaving.current) return;
    if (ask.yesEffect === "none") {
      onYes();
      return;
    }
    leaving.current = true;
    setShaking(true);
    later(() => burstFrom(yesRef.current, { count: 36 }), 360);
    later(() => {
      leaving.current = false;
      onYes();
    }, 950);
  }

  function handleNo() {
    if (ask.noEffect === "honest") {
      onDecline();
      return;
    }
    countNo();
    if (ask.noEffect === "kiss") {
      burstFrom(noRef.current, { count: 14, emojis: ["💋", "😘", "💕"] });
      const id = Date.now();
      setKisses((list) => [...list, id]);
      later(() => setKisses((list) => list.filter((kiss) => kiss !== id)), 1000);
    }
  }

  function runAway() {
    const arena = arenaRef.current;
    const button = noRef.current;
    if (!arena || !button) return;
    countNo();
    const maxX = Math.max(0, arena.clientWidth - button.offsetWidth);
    const maxY = Math.max(0, arena.clientHeight - button.offsetHeight);
    setRunaway({ x: Math.round(Math.random() * maxX), y: Math.round(Math.random() * maxY) });
  }

  const shrink = ask.noEffect === "shrink";
  const yesScale = shrink ? Math.min(1.6, 1 + noCount * 0.1) : 1;
  const noScale = shrink ? Math.max(0.45, 1 - noCount * 0.09) : 1;
  const noGone = shrink && noCount >= SHRINK_LIMIT;

  return (
    <ScreenCard>
      <AskVisual visual={ask.visual} />
      <ScreenTitle>{ask.title}</ScreenTitle>

      {ask.noEffect === "runaway" ? (
        <div ref={arenaRef} className={`relative h-[210px] w-full ${interactive ? "" : "pointer-events-none"}`}>
          <PrimaryButton
            ref={yesRef}
            onClick={handleYes}
            className={`absolute inset-x-0 top-0 ${shaking ? "animate-shake" : ""}`}
          >
            {ask.yesText}
          </PrimaryButton>
          <SoftButton
            ref={noRef}
            onClick={runAway}
            onPointerEnter={(event) => {
              if (event.pointerType === "mouse") runAway();
            }}
            onPointerDown={(event) => {
              if (event.pointerType !== "mouse") {
                event.preventDefault();
                runAway();
              }
            }}
            className="absolute whitespace-nowrap"
            style={{
              transition: "left 0.3s ease-out, top 0.3s ease-out",
              ...(runaway ? { left: runaway.x, top: runaway.y } : { left: "50%", top: 72, transform: "translateX(-50%)" }),
            }}
          >
            {noLabel}
          </SoftButton>
        </div>
      ) : (
        <div className={`flex w-full flex-col items-center gap-3 ${interactive ? "" : "pointer-events-none"}`}>
          <PrimaryButton
            ref={yesRef}
            onClick={handleYes}
            className={`w-full ${shaking ? "animate-shake" : ""}`}
            style={{ transform: `scale(${yesScale})`, marginBlock: (yesScale - 1) * 24 }}
          >
            {ask.yesText}
          </PrimaryButton>
          {noGone ? (
            <p className="text-sm font-semibold text-ink-soft">Кнопка «Нет» закончилась 😇</p>
          ) : (
            <SoftButton ref={noRef} onClick={handleNo} className="w-full" style={{ transform: `scale(${noScale})` }}>
              {noLabel}
            </SoftButton>
          )}
        </div>
      )}

      {kisses.map((id) => (
        <span key={id} aria-hidden className="animate-kiss pointer-events-none absolute left-1/2 top-1/2 text-[96px]">
          💋
        </span>
      ))}
    </ScreenCard>
  );
}

function AskVisual({ visual }: { visual: AskScreenConfig["visual"] }) {
  if (visual.type === "circle") {
    return visual.video ? <CirclePlayer media={visual.video} /> : <MissingMedia text="Кружок ещё не записан" />;
  }
  if (visual.type === "voice") {
    return (
      <div className="flex w-full flex-col items-center gap-4">
        <StickerImage image={visual.image} size="lg" float />
        {visual.audio ? <VoiceBubble media={visual.audio} /> : <MissingMedia text="Голосовое ещё не записано" />}
      </div>
    );
  }
  return <StickerImage image={visual.image} size="xl" float />;
}

function MissingMedia({ text }: { text: string }) {
  return <div className="rounded-full bg-muted px-4 py-2 text-sm font-semibold text-muted-ink">{text}</div>;
}
