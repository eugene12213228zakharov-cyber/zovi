"use client";

import { useEffect, useRef, useState } from "react";

/** Конверт: по нажатию клапан откидывается, письмо выезжает, дальше — приглашение. */
export function EnvelopeGate({ hint, onDone }: { hint: string; onDone: () => void }) {
  const [opening, setOpening] = useState(false);
  const timer = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (timer.current) window.clearTimeout(timer.current);
    },
    [],
  );

  function open() {
    if (opening) return;
    setOpening(true);
    timer.current = window.setTimeout(onDone, 1300);
  }

  return (
    <div className="flex w-full flex-col items-center gap-8 py-6">
      <p className="animate-pop font-display text-[24px] font-bold leading-tight text-balance text-ink">{hint}</p>

      <button
        type="button"
        onClick={open}
        aria-label="Открыть письмо"
        className={`relative h-[200px] w-[290px] max-w-full ${opening ? "" : "animate-pulse-soft"}`}
        style={{ perspective: "900px" }}
      >
        <span
          className="absolute inset-0 rounded-[22px] shadow-[0_24px_50px_-24px_rgba(0,0,0,0.5)]"
          style={{ background: "var(--accent)" }}
        />
        <span
          className="absolute inset-x-5 bottom-3 top-5 flex flex-col items-center gap-2 rounded-[14px] bg-card pt-5 transition-transform duration-700 ease-out"
          style={{
            transform: opening ? "translateY(-110px)" : "translateY(0)",
            transitionDelay: opening ? "420ms" : "0ms",
            zIndex: 1,
          }}
        >
          <span className="text-4xl">💌</span>
          <span className="h-2 w-32 rounded-full bg-muted" />
          <span className="h-2 w-24 rounded-full bg-muted" />
        </span>
        <span
          className="absolute inset-0 rounded-[22px]"
          style={{
            background: "var(--accent-2)",
            clipPath: "polygon(0 0, 50% 52%, 100% 0, 100% 100%, 0 100%)",
            zIndex: 2,
          }}
        />
        <span
          className="absolute inset-x-0 top-0 h-[58%] origin-top rounded-t-[22px] transition-transform duration-500 ease-in-out"
          style={{
            background: "var(--accent)",
            clipPath: "polygon(0 0, 100% 0, 50% 100%)",
            filter: "brightness(0.92)",
            transform: opening ? "rotateX(180deg)" : "rotateX(0deg)",
            zIndex: opening ? 0 : 3,
          }}
        />
        <span
          className="absolute left-1/2 top-[46%] grid h-12 w-12 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-card text-2xl shadow-md transition-opacity duration-200"
          style={{ zIndex: 4, opacity: opening ? 0 : 1 }}
        >
          ❤️
        </span>
      </button>

      <p className="text-sm font-semibold text-ink-soft">Нажми на конверт</p>
    </div>
  );
}
