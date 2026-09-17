import type { GuestSummary, InviteAnswer, InviteEvent, InviteRecord, Participant } from "./types";

const MAX_EVENTS = 300;
/** Столько гостей помещается в одно приглашение — дальше отвечать уже некуда. */
export const MAX_PARTICIPANTS = 300;
export const MAX_GUEST_NAME = 40;

export function emptyAnswer(): InviteAnswer {
  return {
    openedAt: null,
    opens: 0,
    noClicks: 0,
    declinedAt: null,
    yesAt: null,
    date: null,
    time: null,
    choices: [],
    finishedAt: null,
  };
}

export function newParticipant(key: string, name: string, at: string): Participant {
  return { key, name, joinedAt: at, answer: emptyAnswer(), events: [] };
}

export function findParticipant(record: InviteRecord, key: string | null): Participant | null {
  if (!key) return null;
  return record.participants.find((participant) => participant.key === key) ?? null;
}

/** Ответ для режима «зову одного»: участник там всегда первый и единственный. */
export function soloAnswer(source: { participants: { answer: InviteAnswer }[] }): InviteAnswer {
  return source.participants[0]?.answer ?? emptyAnswer();
}

export function soloEvents(source: { participants: { events: InviteEvent[] }[] }): InviteEvent[] {
  return source.participants[0]?.events ?? [];
}

/** Имя гостя: обрезаем, схлопываем пробелы, запрещаем управляющие символы. */
export function cleanGuestName(value: unknown): string {
  if (typeof value !== "string") return "";
  return value
    .replace(/[\u0000-\u001f\u007f]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, MAX_GUEST_NAME);
}

function applyToAnswer(answer: InviteAnswer, event: InviteEvent): InviteAnswer {
  const next: InviteAnswer = { ...answer, choices: [...answer.choices] };
  const data = event.data ?? {};

  switch (event.type) {
    case "opened":
      next.opens += 1;
      next.openedAt ??= event.at;
      break;
    case "no_clicked":
      next.noClicks += 1;
      break;
    case "declined":
      next.declinedAt = event.at;
      break;
    case "yes":
      next.yesAt = event.at;
      next.declinedAt = null;
      break;
    case "when_chosen":
      next.date = typeof data.date === "string" ? data.date : null;
      next.time = typeof data.time === "string" ? data.time : null;
      break;
    case "choice_made":
      next.choices = Array.isArray(data.choices) ? data.choices.map(String) : [];
      break;
    case "finished":
      next.finishedAt = event.at;
      break;
    default:
      break;
  }

  return next;
}

/**
 * Применяет событие к участнику с этим ключом.
 * В режиме «зову одного» ключа может не быть — тогда пишем первому участнику,
 * заводя его при первом же событии.
 */
export function applyEvent(record: InviteRecord, key: string | null, event: InviteEvent): InviteRecord | null {
  const solo = record.config.audience !== "party";
  const found = record.participants.findIndex((participant) => participant.key === key);
  if (found < 0 && !solo) return null;

  // В одиночном режиме участник один: если его ещё нет — заводим на первом же событии.
  const base =
    found < 0 && record.participants.length === 0
      ? { ...record, participants: [newParticipant(key ?? "solo", "", event.at)] }
      : record;
  const index = found < 0 ? 0 : found;

  const participants = base.participants.map((participant, at) =>
    at === index
      ? {
          ...participant,
          answer: applyToAnswer(participant.answer, event),
          events: [...participant.events, event].slice(-MAX_EVENTS),
        }
      : participant,
  );

  return { ...base, participants, updatedAt: event.at };
}

export function guestStatus(answer: InviteAnswer): GuestSummary["status"] {
  if (answer.declinedAt) return "declined";
  if (answer.yesAt) return "going";
  return "thinking";
}

/** Кого показываем гостям: только представившихся и только имя со статусом. */
export function guestList(source: { participants: { name: string; answer: InviteAnswer }[] }): GuestSummary[] {
  return source.participants
    .filter((participant) => participant.name !== "")
    .map((participant) => ({ name: participant.name, status: guestStatus(participant.answer) }));
}
