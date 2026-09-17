"use client";

import { useId, useState, type ReactNode } from "react";

export const inputClass =
  "w-full rounded-lg border border-app-line bg-app-bg/60 px-4 py-3 text-[16px] font-semibold text-app-ink outline-none transition placeholder:text-app-soft/70 focus:border-app-accent focus:bg-white";

export function Section({
  title,
  badge,
  children,
}: {
  title: string;
  badge?: string;
  children: ReactNode;
}) {
  return (
    <section className="card border border-app-line p-5">
      <div className="mb-4 flex items-center gap-3">
        <h2 className="text-lg font-extrabold">{title}</h2>
        {badge && <span className="rounded-full bg-app-bg px-2.5 py-0.5 text-xs font-bold text-app-soft">{badge}</span>}
      </div>
      <div className="flex flex-col gap-4">{children}</div>
    </section>
  );
}

/** Подпись над группой контролов (не &lt;label&gt;: иначе клик по подписи нажимает первую кнопку). */
export function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-sm font-bold">{label}</span>
      {children}
      {hint && <span className="text-xs text-app-soft">{hint}</span>}
    </div>
  );
}

interface TextFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  maxLength: number;
  placeholder?: string;
  multiline?: boolean;
  rows?: number;
  hint?: string;
}

export function TextField({ label, value, onChange, maxLength, placeholder, multiline = false, rows = 2, hint }: TextFieldProps) {
  const id = useId();
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between gap-2">
        <label htmlFor={id} className="text-sm font-bold">
          {label}
        </label>
        <span className={`text-xs tabular-nums ${value.length >= maxLength * 0.9 ? "text-app-accent" : "text-app-soft"}`}>
          {value.length}/{maxLength}
        </span>
      </div>
      {multiline ? (
        <textarea
          id={id}
          rows={rows}
          value={value}
          maxLength={maxLength}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
          className={`${inputClass} resize-none`}
        />
      ) : (
        <input
          id={id}
          value={value}
          maxLength={maxLength}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
          className={inputClass}
        />
      )}
      {hint && <p className="text-xs text-app-soft">{hint}</p>}
    </div>
  );
}

export function Toggle({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex w-full items-center gap-4 text-left"
    >
      <span className="flex-1">
        <span className="block font-bold">{label}</span>
        {description && <span className="mt-0.5 block text-sm text-app-soft">{description}</span>}
      </span>
      <span className={`relative h-8 w-14 shrink-0 rounded-full transition-colors ${checked ? "bg-app-accent" : "bg-app-line"}`}>
        <span
          className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow transition-[left] ${checked ? "left-7" : "left-1"}`}
        />
      </span>
    </button>
  );
}

export function Segmented<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: readonly { value: T; label: string }[];
  onChange: (value: T) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1 rounded-[22px] bg-app-bg p-1" role="radiogroup">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          role="radio"
          aria-checked={value === option.value}
          onClick={() => onChange(option.value)}
          className={`min-w-fit flex-1 rounded-[18px] px-4 py-2.5 text-sm font-extrabold transition ${
            value === option.value ? "bg-app-ink text-white shadow" : "text-app-soft hover:text-app-ink"
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

export interface OptionCardItem<T extends string> {
  value: T;
  emoji: string;
  title: string;
  description?: string;
}

export function OptionCards<T extends string>({
  value,
  options,
  onChange,
  columns = 2,
}: {
  value: T;
  options: readonly OptionCardItem<T>[];
  onChange: (value: T) => void;
  columns?: 2 | 3;
}) {
  return (
    <div className={`grid gap-3 ${columns === 3 ? "grid-cols-2 sm:grid-cols-3" : "grid-cols-2"}`} role="radiogroup">
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(option.value)}
            className={`flex flex-col items-start gap-2 rounded-[22px] border-2 p-4 text-left transition active:scale-[0.98] ${
              selected ? "border-app-accent bg-app-accent-soft/60" : "border-app-line bg-white hover:border-app-accent/40"
            }`}
          >
            <span aria-hidden className="text-3xl leading-none">
              {option.emoji}
            </span>
            <span className="font-extrabold leading-tight">{option.title}</span>
            {option.description && <span className="text-sm leading-snug text-app-soft">{option.description}</span>}
          </button>
        );
      })}
    </div>
  );
}

export function Chip({ selected, onClick, children }: { selected: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={`rounded-full border-2 px-4 py-2 text-sm font-extrabold transition active:scale-95 ${
        selected ? "border-app-ink bg-app-ink text-white" : "border-app-line bg-white hover:border-app-accent/40"
      }`}
    >
      {children}
    </button>
  );
}

export function IconButton({
  label,
  onClick,
  disabled,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={disabled}
      className="grid h-9 w-9 shrink-0 place-items-center rounded-xl text-base font-extrabold text-app-soft transition hover:bg-app-bg hover:text-app-ink disabled:opacity-30"
    >
      {children}
    </button>
  );
}

export function CopyField({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      // Без HTTPS clipboard API может быть недоступен — копируем по-старому.
      const area = document.createElement("textarea");
      area.value = value;
      document.body.appendChild(area);
      area.select();
      document.execCommand("copy");
      area.remove();
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <div className="flex items-center gap-2 rounded-2xl border-2 border-app-line bg-app-bg/60 p-1.5 pl-4">
      <input
        readOnly
        value={value}
        onFocus={(event) => event.currentTarget.select()}
        aria-label="Ссылка"
        className="min-w-0 flex-1 bg-transparent text-[15px] font-semibold outline-none"
      />
      <button
        type="button"
        onClick={() => void copy()}
        className="shrink-0 rounded-xl bg-app-ink px-4 py-2 text-sm font-extrabold text-white transition active:scale-95"
      >
        {copied ? "Скопировано ✓" : "Копировать"}
      </button>
    </div>
  );
}

/** Свёрнутый блок «деталей»: по умолчанию закрыт, чтобы быстрый путь оставался коротким. */
export function Details({ title, note, children }: { title: string; note?: string; children: ReactNode }) {
  return (
    <details className="group rounded-2xl border border-dashed border-app-line bg-app-card/60 p-5 open:bg-app-card">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3">
        <span className="text-lg font-extrabold">{title}</span>
        <span className="shrink-0 text-sm font-bold text-app-accent-strong">
          <span className="group-open:hidden">Развернуть ▾</span>
          <span className="hidden group-open:inline">Свернуть ▴</span>
        </span>
      </summary>
      {note && <p className="mt-2 text-sm text-app-soft">{note}</p>}
      <div className="mt-4 flex flex-col gap-4">{children}</div>
    </details>
  );
}
