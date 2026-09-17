import { formatDayMonth, joinChoices } from "@/lib/invite/format";
import type { AuthorView, InviteEvent } from "@/lib/invite/types";

export function plural(count: number, forms: [string, string, string]): string {
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (mod10 === 1 && mod100 !== 11) return forms[0];
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return forms[1];
  return forms[2];
}

export interface Row {
  key: string;
  emoji: string;
  text: string;
  at: string;
  noCount?: number;
}

/** Событие вместе с тем, кто его сделал: в компании у каждого гостя своя лента. */
interface Entry {
  event: InviteEvent;
  who: string | null;
}

/** Все события приглашения в одной ленте по времени: гости и неудачные попытки PIN. */
export function entriesOf(view: AuthorView): Entry[] {
  const party = view.config.audience === "party";
  const entries: Entry[] = [];
  for (const participant of view.participants) {
    for (const event of participant.events) {
      entries.push({ event, who: party ? (participant.name || "Гость") : null });
    }
  }
  for (const at of view.pinFails) entries.push({ event: { type: "pin_failed", at }, who: null });
  entries.sort((a, b) => Date.parse(a.event.at) - Date.parse(b.event.at));
  return entries;
}

export function timelineOf(view: AuthorView, entries: Entry[]): Row[] {
  const female = view.config.gender === "female";
  const pick = (f: string, m: string) => (female ? f : m);
  const rows: Row[] = [];

  entries.forEach(({ event, who }, index) => {
    const key = `${event.at}-${index}`;
    const data = event.data ?? {};
    // В компании имён много и род у них разный, поэтому пишем «Катя: …» без глаголов по роду.
    const say = (personal: string, neutral: string) => (who ? `${who}: ${neutral}` : personal);

    switch (event.type) {
      case "opened":
        rows.push({ key, emoji: "💌", text: say(`${pick("Открыла", "Открыл")} приглашение`, "приглашение открыто"), at: event.at });
        break;
      case "intro_passed":
        rows.push({ key, emoji: "🔓", text: say(`${pick("Прошла", "Прошёл")} вход`, "вход пройден"), at: event.at });
        break;
      case "pin_failed":
        rows.push({ key, emoji: "🔢", text: "Неверный PIN-код", at: event.at });
        break;
      case "no_clicked": {
        // Серию нажатий «Нет» подряд показываем одной строкой.
        const last = rows[rows.length - 1];
        const sameWho = last?.noCount && last.text.startsWith(who ? `${who}: ` : "");
        if (last?.noCount && sameWho) {
          const count = last.noCount + 1;
          rows[rows.length - 1] = {
            ...last,
            noCount: count,
            at: event.at,
            text: say(
              `${pick("Нажимала", "Нажимал")} «Нет» — ${count} ${plural(count, ["раз", "раза", "раз"])}`,
              `«Нет» — ${count} ${plural(count, ["раз", "раза", "раз"])}`,
            ),
          };
        } else {
          rows.push({ key, emoji: "🙈", text: say(`${pick("Нажала", "Нажал")} «Нет»`, "нажал «Нет»"), at: event.at, noCount: 1 });
        }
        break;
      }
      case "declined":
        rows.push({ key, emoji: "🥲", text: say("Честный отказ", "честный отказ"), at: event.at });
        break;
      case "yes":
        rows.push({ key, emoji: "🎉", text: say(`${pick("Нажала", "Нажал")} «Да»`, "«Да»"), at: event.at });
        break;
      case "confirmed":
        rows.push({ key, emoji: "🙈", text: say(`${pick("Подтвердила", "Подтвердил")} «да»`, "подтверждение"), at: event.at });
        break;
      case "when_chosen": {
        const date = typeof data.date === "string" ? data.date : "";
        const time = typeof data.time === "string" ? data.time : "";
        const when = `${formatDayMonth(date)} в ${time}`;
        rows.push({ key, emoji: "📅", text: say(`${pick("Выбрала", "Выбрал")} ${when}`, when), at: event.at });
        break;
      }
      case "choice_made": {
        const choices = Array.isArray(data.choices) ? data.choices.map(String) : [];
        rows.push({
          key,
          emoji: "✨",
          text: say(`${pick("Выбрала", "Выбрал")}: ${joinChoices(choices)}`, joinChoices(choices)),
          at: event.at,
        });
        break;
      }
      case "finished":
        rows.push({ key, emoji: "💘", text: say(`${pick("Дошла", "Дошёл")} до финала`, "ответ готов"), at: event.at });
        break;
    }
  });

  return rows.reverse();
}
