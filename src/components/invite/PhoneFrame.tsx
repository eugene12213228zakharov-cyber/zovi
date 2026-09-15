"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

// Экран превью рисуется в размере настоящего телефона (390×760 — видимая область браузера
// на типичном iPhone или Android) и уменьшается целиком, чтобы влезть в отведённое место.
// Так превью совпадает с тем, что увидит получатель, а не сплющивается под узкую колонку.
const SCREEN_WIDTH = 390;
const SCREEN_HEIGHT = 760;
const BEZEL = 10;
const FRAME_WIDTH = SCREEN_WIDTH + BEZEL * 2;
const FRAME_HEIGHT = SCREEN_HEIGHT + BEZEL * 2;

interface PhoneFrameProps {
  children: ReactNode;
  /** Высота места под телефон; ширину даёт родитель. */
  heightClass?: string;
}

export function PhoneFrame({ children, heightClass = "h-[min(720px,calc(100dvh-120px))]" }: PhoneFrameProps) {
  const boxRef = useRef<HTMLDivElement>(null);
  // Масштаб узнаём только после замера места, до этого телефон прозрачный.
  const [scale, setScale] = useState<number | null>(null);

  useEffect(() => {
    const box = boxRef.current;
    if (!box) return;
    const fit = () => {
      if (box.clientWidth > 0 && box.clientHeight > 0) {
        setScale(Math.min(box.clientWidth / FRAME_WIDTH, box.clientHeight / FRAME_HEIGHT, 1));
      }
    };
    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(box);
    return () => observer.disconnect();
  }, []);

  const factor = scale ?? 0;

  return (
    <div ref={boxRef} className={`flex w-full justify-center ${heightClass}`}>
      <div
        className={`relative shrink-0 transition-opacity duration-300 ${scale === null ? "opacity-0" : "opacity-100"}`}
        style={{ width: FRAME_WIDTH * factor, height: FRAME_HEIGHT * factor }}
      >
        <div
          className="absolute left-0 top-0 origin-top-left rounded-[56px] bg-[#1d1520] shadow-[0_40px_90px_-40px_rgba(36,23,42,0.65)]"
          style={{ width: FRAME_WIDTH, height: FRAME_HEIGHT, padding: BEZEL, transform: `scale(${factor})` }}
        >
          <div className="relative h-full w-full overflow-hidden rounded-[46px] bg-white">
            <div
              aria-hidden
              className="pointer-events-none absolute left-1/2 top-2.5 z-30 h-[28px] w-[104px] -translate-x-1/2 rounded-full bg-[#1d1520]"
            />
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
