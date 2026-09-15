import type { InviteAnswer, InviteEvent, InviteRecord } from "./types";

const MAX_EVENTS = 300;

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

/** Применяет событие от получателя к сохранённому ответу. */
export function applyEvent(record: InviteRecord, event: InviteEvent): InviteRecord {
  const answer: InviteAnswer = { ...record.answer, choices: [...record.answer.choices] };
  const data = event.data ?? {};

  switch (event.type) {
    case "opened":
      answer.opens += 1;
      answer.openedAt ??= event.at;
      break;
    case "no_clicked":
      answer.noClicks += 1;
      break;
    case "declined":
      answer.declinedAt = event.at;
      break;
    case "yes":
      answer.yesAt = event.at;
      answer.declinedAt = null;
      break;
    case "when_chosen":
      answer.date = typeof data.date === "string" ? data.date : null;
      answer.time = typeof data.time === "string" ? data.time : null;
      break;
    case "choice_made":
      answer.choices = Array.isArray(data.choices) ? data.choices.map(String) : [];
      break;
    case "finished":
      answer.finishedAt = event.at;
      break;
    default:
      break;
  }

  return {
    ...record,
    answer,
    events: [...record.events, event].slice(-MAX_EVENTS),
    updatedAt: event.at,
  };
}
