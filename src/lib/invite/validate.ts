import { parseIsoDate } from "./format";
import type { InviteConfig } from "./types";

export type EditorStepId = "who" | "intro" | "ask" | "confirm" | "when" | "choice" | "final";

export interface SubmitProblem {
  step: EditorStepId;
  message: string;
}

/** Что мешает отправить приглашение. Пустой список — можно создавать. */
export function validateForSubmit(
  config: InviteConfig,
  options: { checkTime: boolean } = { checkTime: true },
): SubmitProblem[] {
  const problems: SubmitProblem[] = [];
  const blank = (value: string) => value.trim().length === 0;
  const { intro, ask, confirm, when, choice, final } = config;

  if (intro.mode === "pin" && !/^\d{4}$/.test(intro.pin.code)) {
    problems.push({ step: "intro", message: "Придумай PIN-код из 4 цифр" });
  }
  if (intro.mode === "scheduled") {
    const unlockAt = Date.parse(intro.scheduled.unlockAt);
    if (Number.isNaN(unlockAt)) {
      problems.push({ step: "intro", message: "Укажи, когда откроется приглашение" });
    } else if (options.checkTime && unlockAt <= Date.now()) {
      problems.push({ step: "intro", message: "Время открытия уже прошло — выбери момент в будущем" });
    }
  }

  if (blank(ask.title)) problems.push({ step: "ask", message: "Напиши главный вопрос" });
  if (blank(ask.yesText) || blank(ask.noText)) problems.push({ step: "ask", message: "Подпиши обе кнопки" });
  if (ask.visual.type === "voice" && !ask.visual.audio) {
    problems.push({ step: "ask", message: "Запиши голосовое или выбери картинку" });
  }
  if (ask.visual.type === "circle" && !ask.visual.video) {
    problems.push({ step: "ask", message: "Запиши кружок или выбери картинку" });
  }

  if (confirm.enabled && (blank(confirm.title) || blank(confirm.buttonText))) {
    problems.push({ step: "confirm", message: "Заполни заголовок и кнопку экрана подтверждения" });
  }

  if (when.enabled) {
    if (blank(when.buttonText)) problems.push({ step: "when", message: "Подпиши кнопку на экране даты" });
    if (when.mode === "fixed" && (!parseIsoDate(when.date) || !/^([01]\d|2[0-3]):[0-5]\d$/.test(when.time))) {
      problems.push({ step: "when", message: "Укажи дату и время свидания" });
    }
  }

  if (choice.enabled) {
    if (choice.options.length < 2) problems.push({ step: "choice", message: "Добавь хотя бы два варианта" });
    if (choice.options.some((option) => blank(option.label))) {
      problems.push({ step: "choice", message: "У каждого варианта должно быть название" });
    }
    if (choice.multiple && blank(choice.buttonText)) {
      problems.push({ step: "choice", message: "Подпиши кнопку на экране выбора" });
    }
  }

  if (blank(final.title)) problems.push({ step: "final", message: "Напиши заголовок финального экрана" });

  return problems;
}
