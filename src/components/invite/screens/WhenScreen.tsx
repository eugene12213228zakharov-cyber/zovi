"use client";

import { useMemo } from "react";
import { addDays, formatDayMonth, parseIsoDate, toIsoDate } from "@/lib/invite/format";
import type { WhenScreen as WhenScreenConfig } from "@/lib/invite/types";
import { StickerImage } from "../StickerImage";
import { PrimaryButton, ScreenCard, ScreenTitle, SectionLabel } from "../ui";

const TIME_SLOTS = ["12:00", "14:00", "16:00", "18:00", "18:30", "19:00", "19:30", "20:00", "21:00"];
const WEEKDAYS = ["пн", "вт", "ср", "чт", "пт", "сб", "вс"];
const MONTHS_SHORT = ["янв", "фев", "мар", "апр", "мая", "июн", "июл", "авг", "сен", "окт", "ноя", "дек"];
const MONTHS = ["январь", "февраль", "март", "апрель", "май", "июнь", "июль", "август", "сентябрь", "октябрь", "ноябрь", "декабрь"];
const WEEKS = 3;

interface CalendarDay {
  iso: string;
  day: Date;
  past: boolean;
}

/** Три недели, начиная с понедельника текущей: прошедшие дни остаются на месте, но их не выбрать. */
function buildCalendar(now: Date): { days: CalendarDay[]; todayIso: string; monthLabel: string } {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const monday = addDays(today, -((today.getDay() + 6) % 7));
  const days = Array.from({ length: WEEKS * 7 }, (_, index) => {
    const day = addDays(monday, index);
    return { iso: toIsoDate(day), day, past: day < today };
  });
  const firstMonth = MONTHS[today.getMonth()];
  const lastMonth = MONTHS[days[days.length - 1].day.getMonth()];
  return {
    days,
    todayIso: toIsoDate(today),
    monthLabel: firstMonth === lastMonth ? firstMonth : `${firstMonth} — ${lastMonth}`,
  };
}

interface WhenScreenProps {
  when: WhenScreenConfig;
  date: string | null;
  time: string | null;
  onChange: (value: { date: string | null; time: string | null }) => void;
  onNext: () => void;
}

export function WhenScreen({ when, date, time, onChange, onNext }: WhenScreenProps) {
  const calendar = useMemo(() => buildCalendar(new Date()), []);

  if (when.mode === "fixed") {
    const day = parseIsoDate(when.date);
    const weekday = day ? new Intl.DateTimeFormat("ru-RU", { weekday: "long" }).format(day) : "";
    return (
      <ScreenCard>
        <StickerImage image={when.image} size="xl" float />
        <ScreenTitle>{when.title}</ScreenTitle>
        <div className="w-full rounded-[28px] bg-accent-soft px-5 py-5">
          <div className="text-sm font-extrabold uppercase tracking-wider text-ink-soft">{weekday}</div>
          <div className="font-display text-[34px] font-bold leading-tight text-ink">{formatDayMonth(when.date)}</div>
          <div className="text-xl font-extrabold text-accent">в {when.time}</div>
        </div>
        <PrimaryButton className="w-full" onClick={onNext}>
          {when.buttonText}
        </PrimaryButton>
      </ScreenCard>
    );
  }

  const customDate = date !== null && !calendar.days.some((item) => item.iso === date && !item.past);
  const customTime = time !== null && !TIME_SLOTS.includes(time);

  return (
    <ScreenCard>
      <StickerImage image={when.image} size="lg" float />
      <ScreenTitle>{when.title}</ScreenTitle>

      {/* @container: размер чисел считается от ширины карточки, чтобы 7 колонок влезали и на узком телефоне. */}
      <div className="@container w-full text-left">
        <div className="mb-2 flex items-baseline justify-between gap-2">
          <span className="text-xs font-extrabold uppercase tracking-wider text-ink-soft">День</span>
          <span className="text-xs font-bold text-ink-soft">{calendar.monthLabel}</span>
        </div>
        <div className="grid grid-cols-7 gap-1.5 text-center">
          {WEEKDAYS.map((weekday, index) => (
            <span
              key={weekday}
              aria-hidden
              className={`pb-0.5 text-[length:clamp(9px,3.4cqi,11px)] font-extrabold uppercase ${index >= 5 ? "text-accent" : "text-ink-soft"}`}
            >
              {weekday}
            </span>
          ))}
          {calendar.days.map(({ iso, day, past }) => {
            const selected = date === iso;
            const isToday = iso === calendar.todayIso;
            const monthStart = day.getDate() === 1;
            return (
              <button
                key={iso}
                type="button"
                disabled={past}
                aria-pressed={selected}
                aria-label={`${formatDayMonth(iso)}${isToday ? ", сегодня" : ""}`}
                onClick={() => onChange({ date: iso, time })}
                className={`relative flex h-12 min-w-0 flex-col items-center justify-center rounded-2xl border-2 transition active:scale-95 ${
                  selected
                    ? "border-accent bg-accent text-accent-ink"
                    : past
                      ? "border-transparent text-ink-soft/40"
                      : "border-line bg-card text-ink"
                }`}
              >
                <span className="font-display text-[length:clamp(13px,5.2cqi,17px)] font-bold leading-none tabular-nums">
                  {day.getDate()}
                </span>
                {monthStart && (
                  <span className="mt-0.5 text-[9px] font-extrabold leading-none">{MONTHS_SHORT[day.getMonth()]}</span>
                )}
                {isToday && !monthStart && (
                  <span
                    aria-hidden
                    className={`absolute bottom-1.5 h-1 w-1 rounded-full ${selected ? "bg-accent-ink" : "bg-accent"}`}
                  />
                )}
              </button>
            );
          })}
        </div>
        <NativePicker
          type="date"
          min={calendar.todayIso}
          value={customDate && date ? date : ""}
          selected={customDate}
          label={customDate ? `Другой день: ${formatDayMonth(date)}` : "Другой день"}
          onPick={(value) => onChange({ date: value, time })}
          className="mt-2 h-11 w-full"
        />
      </div>

      <div className="w-full text-left">
        <SectionLabel>Время</SectionLabel>
        <div className="grid grid-cols-3 gap-2">
          {TIME_SLOTS.map((slot) => (
            <button
              key={slot}
              type="button"
              aria-pressed={time === slot}
              onClick={() => onChange({ date, time: slot })}
              className={`h-11 rounded-full border-2 text-[15px] font-extrabold tabular-nums transition active:scale-95 ${
                time === slot ? "border-accent bg-accent text-accent-ink" : "border-line bg-card text-ink"
              }`}
            >
              {slot}
            </button>
          ))}
        </div>
        <NativePicker
          type="time"
          value={customTime && time ? time : ""}
          selected={customTime}
          label={customTime ? `Другое время: ${time}` : "Другое время"}
          onPick={(value) => onChange({ date, time: value })}
          className="mt-2 h-11 w-full"
        />
      </div>

      <PrimaryButton className="w-full" disabled={!date || !time} onClick={onNext}>
        {when.buttonText}
      </PrimaryButton>
    </ScreenCard>
  );
}

interface NativePickerProps {
  type: "date" | "time";
  value: string;
  min?: string;
  label: string;
  selected: boolean;
  onPick: (value: string) => void;
  className?: string;
}

/** Своя подпись поверх прозрачного системного поля: на телефоне откроется родной выбор даты или времени. */
function NativePicker({ type, value, min, label, selected, onPick, className = "" }: NativePickerProps) {
  return (
    <label
      className={`relative flex items-center justify-center rounded-full border-2 px-3 text-center text-[13px] font-extrabold leading-tight transition ${
        selected ? "border-accent bg-accent text-accent-ink" : "border-dashed border-line bg-card text-ink-soft"
      } ${className}`}
    >
      <span className="pointer-events-none">{label}</span>
      <input
        type={type}
        value={value}
        min={min}
        aria-label={label}
        onChange={(event) => {
          if (event.target.value) onPick(event.target.value);
        }}
        onClick={(event) => {
          try {
            event.currentTarget.showPicker();
          } catch {
            // Старые браузеры откроют выбор сами по нажатию на поле.
          }
        }}
        className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
      />
    </label>
  );
}
