"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { ScreenCard, ScreenTitle } from "../ui";

export type PinResult = "ok" | "wrong" | "blocked" | "error";

const MESSAGES: Record<"checking" | "wrong" | "blocked" | "error", string> = {
  checking: "Проверяю…",
  wrong: "Не тот код, попробуй ещё",
  blocked: "Слишком много попыток. Попробуй через 10 минут",
  error: "Нет связи. Попробуй ещё раз",
};

interface PinGateProps {
  question: string;
  digits: number;
  onSubmit: (pin: string) => Promise<PinResult>;
  onUnlocked: () => void;
}

export function PinGate({ question, digits, onSubmit, onUnlocked }: PinGateProps) {
  const [pin, setPin] = useState("");
  const [status, setStatus] = useState<PinResult | "idle" | "checking">("idle");
  const [attempt, setAttempt] = useState(0);

  async function submit(value: string) {
    setStatus("checking");
    const result = await onSubmit(value);
    setStatus(result);
    if (result === "ok") {
      window.setTimeout(onUnlocked, 500);
      return;
    }
    setAttempt((count) => count + 1);
    setPin("");
  }

  function press(key: string) {
    if (status === "checking" || status === "ok") return;
    if (key === "back") {
      setPin(pin.slice(0, -1));
      return;
    }
    if (pin.length >= digits) return;
    const next = pin + key;
    setPin(next);
    if (next.length === digits) void submit(next);
  }

  // Ввод с клавиатуры компьютера. Поля ввода (например, в конструкторе рядом с превью) не перехватываем.
  const pressRef = useRef(press);
  useEffect(() => {
    pressRef.current = press;
  });
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.closest("input, textarea, select, [contenteditable='true']")) return;
      if (/^\d$/.test(event.key)) pressRef.current(event.key);
      else if (event.key === "Backspace") pressRef.current("back");
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const message = status === "idle" || status === "ok" ? "" : MESSAGES[status];

  return (
    <ScreenCard>
      <span aria-hidden className={`text-6xl leading-none ${status === "ok" ? "animate-wiggle" : "animate-float"}`}>
        {status === "ok" ? "🔓" : "🔒"}
      </span>
      <ScreenTitle>{question}</ScreenTitle>
      <div
        key={attempt}
        className={`flex gap-3 ${attempt > 0 ? "animate-shake" : ""}`}
        aria-label={`Введено цифр: ${pin.length} из ${digits}`}
      >
        {Array.from({ length: digits }, (_, index) => (
          <span
            key={index}
            className={`h-4 w-4 rounded-full border-2 border-accent transition-all duration-150 ${
              index < pin.length || status === "ok" ? "scale-110 bg-accent" : "bg-transparent"
            }`}
          />
        ))}
      </div>
      <p className="min-h-5 text-sm font-bold text-accent" role="status">
        {message}
      </p>
      <div className="grid w-full max-w-[270px] grid-cols-3 gap-3">
        {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((key) => (
          <PinKey key={key} onClick={() => press(key)}>
            {key}
          </PinKey>
        ))}
        <span />
        <PinKey onClick={() => press("0")}>0</PinKey>
        <PinKey onClick={() => press("back")} label="Стереть">
          ⌫
        </PinKey>
      </div>
    </ScreenCard>
  );
}

function PinKey({ children, onClick, label }: { children: ReactNode; onClick: () => void; label?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="grid h-16 place-items-center rounded-[22px] bg-muted font-display text-2xl font-bold text-ink transition active:scale-90 active:bg-accent-soft"
    >
      {children}
    </button>
  );
}
