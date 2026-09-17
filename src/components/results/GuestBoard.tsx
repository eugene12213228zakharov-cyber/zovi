import { guestStatus } from "@/lib/invite/answer";
import { formatDayMonth, joinChoices } from "@/lib/invite/format";
import type { AuthorParticipant, AuthorView } from "@/lib/invite/types";
import { plural } from "./timeline";

const STATUS = {
  going: { emoji: "✅", label: "идёт", tone: "text-emerald-600" },
  declined: { emoji: "🥲", label: "не сможет", tone: "text-app-soft" },
  thinking: { emoji: "⏳", label: "думает", tone: "text-amber-600" },
} as const;

function detailsOf(guest: AuthorParticipant): string | null {
  const parts: string[] = [];
  if (guest.answer.date) parts.push(`${formatDayMonth(guest.answer.date)}${guest.answer.time ? ` в ${guest.answer.time}` : ""}`);
  if (guest.answer.choices.length > 0) parts.push(joinChoices(guest.answer.choices));
  return parts.length > 0 ? parts.join(" · ") : null;
}

/** Кто идёт: сводка и список гостей. Показывается только в режиме «зову компанию». */
export function GuestBoard({ view }: { view: AuthorView }) {
  const guests = view.participants.filter((participant) => participant.name !== "");
  const going = guests.filter((guest) => guestStatus(guest.answer) === "going");
  const declined = guests.filter((guest) => guestStatus(guest.answer) === "declined");
  const thinking = guests.filter((guest) => guestStatus(guest.answer) === "thinking");

  return (
    <section className="flex flex-col gap-4 rounded-2xl border border-app-line bg-app-card p-5">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="text-lg font-extrabold">Кто идёт</h2>
        <span className="text-sm text-app-soft">
          {guests.length} {plural(guests.length, ["ответ", "ответа", "ответов"])}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <Tally emoji="✅" count={going.length} label="идут" />
        <Tally emoji="⏳" count={thinking.length} label="думают" />
        <Tally emoji="🥲" count={declined.length} label="не смогут" />
      </div>

      {guests.length === 0 ? (
        <p className="text-app-soft">Пока никто не открывал ссылку. Отправь её в общий чат — список появится сам.</p>
      ) : (
        <ul className="flex flex-col divide-y divide-app-line">
          {guests.map((guest) => {
            const status = STATUS[guestStatus(guest.answer)];
            const details = detailsOf(guest);
            return (
              <li key={`${guest.name}-${guest.joinedAt}`} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                <span aria-hidden className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-app-bg text-lg">
                  {status.emoji}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-extrabold">{guest.name}</span>
                  <span className="block truncate text-sm text-app-soft">{details ?? status.label}</span>
                </span>
                {guest.answer.noClicks > 0 && (
                  <span className="shrink-0 text-sm text-app-soft" title="Нажатий «Нет»">
                    🙈 {guest.answer.noClicks}
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

function Tally({ emoji, count, label }: { emoji: string; count: number; label: string }) {
  return (
    <div className="rounded-[20px] bg-app-bg px-3 py-3 text-center">
      <div aria-hidden className="text-xl">
        {emoji}
      </div>
      <div className="mt-1 text-2xl font-extrabold leading-none">{count}</div>
      <div className="mt-1 text-xs font-bold uppercase tracking-wider text-app-soft">{label}</div>
    </div>
  );
}
