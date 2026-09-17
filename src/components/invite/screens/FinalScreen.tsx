"use client";

import { useEffect } from "react";
import { buildIcs } from "@/lib/invite/calendar";
import { fillPlaceholders, formatDayMonth, joinChoices, type PlaceholderValues } from "@/lib/invite/format";
import type { FinalScreen as FinalScreenConfig, GuestSummary } from "@/lib/invite/types";
import { confettiRain } from "../effects";
import { StickerImage } from "../StickerImage";
import { ScreenCard, ScreenText, ScreenTitle, SoftButton } from "../ui";

export function FinalScreen({
  final,
  values,
  party = false,
  guestName,
  guests = [],
}: {
  final: FinalScreenConfig;
  values: PlaceholderValues;
  party?: boolean;
  guestName?: string;
  guests?: GuestSummary[];
}) {
  useEffect(() => {
    const timer = window.setTimeout(() => confettiRain(), 250);
    return () => window.clearTimeout(timer);
  }, []);

  const text = fillPlaceholders(final.text, values);
  const ics =
    final.showCalendar && values.date && values.time
      ? buildIcs({
          title: party ? "Встреча 🎉" : "Свидание 💘",
          description: text,
          date: values.date,
          time: values.time,
        })
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
      <TicketStub values={values} party={party} guestName={guestName} />
      {party && <GoingList guests={guests} me={guestName} />}
      {ics && (
        <SoftButton className="w-full" onClick={addToCalendar}>
          🗓 Добавить в календарь
        </SoftButton>
      )}
    </ScreenCard>
  );
}

// Ширины полосок «штрихкода» — постоянные, чтобы билет выглядел одинаково у всех.
const BARCODE = [3, 1, 2, 4, 1, 3, 1, 2, 2, 5, 1, 2, 3, 1, 4, 1, 2, 2, 3, 1, 2, 4];

/** Кто уже согласился прийти. Видно только в режиме «зову компанию». */
function GoingList({ guests, me }: { guests: GuestSummary[]; me?: string }) {
  const going = guests.filter((guest) => guest.status === "going").map((guest) => guest.name);
  const others = going.filter((name) => name !== me);
  if (others.length === 0) return null;

  return (
    <div className="w-full rounded-[22px] bg-muted px-5 py-4 text-left">
      <div className="text-xs font-extrabold uppercase tracking-wider text-muted-ink">Уже идут</div>
      <p className="mt-1 text-[15px] font-bold text-ink">{others.join(", ")}</p>
    </div>
  );
}

/** Корешок билета с тем, что выбрал получатель. */
function TicketStub({ values, party, guestName }: { values: PlaceholderValues; party: boolean; guestName?: string }) {
  const rows: [string, string][] = [];
  if (guestName) rows.push(["гость", guestName]);
  if (values.date) rows.push(["сеанс", formatDayMonth(values.date)]);
  if (values.time) rows.push(["начало", values.time]);
  const choice = joinChoices(values.choices ?? []);
  if (choice) rows.push(["в меню", choice]);
  if (rows.length === 0) return null;

  return (
    <div className="w-full rounded-[22px] border border-line bg-card px-5 py-4 text-left font-ticket">
      <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.18em] text-ink-soft">
        <span>{party ? "билет на встречу" : "билет на свидание"}</span>
        <span>№ 001</span>
      </div>
      <dl className="mt-3 flex flex-col gap-1.5 text-[13px] text-ink">
        {rows.map(([label, value]) => (
          <div key={label} className="flex items-baseline justify-between gap-3">
            <dt className="text-ink-soft">{label}</dt>
            <dd className="text-right font-bold">{value}</dd>
          </div>
        ))}
      </dl>
      <div className="mt-3 flex h-8 items-end gap-[3px] border-t border-dashed border-line pt-3" aria-hidden>
        {BARCODE.map((width, index) => (
          <span
            key={index}
            className="h-full rounded-[1px] bg-ink"
            style={{ width, opacity: index % 3 === 0 ? 0.85 : 0.5 }}
          />
        ))}
      </div>
    </div>
  );
}
