import { addDays, nextSaturdayIso } from "./format";
import { CHOICE_CATEGORIES } from "./stickers";
import type { ChoiceCategory, ChoiceOption, Gender, InviteConfig } from "./types";

/** Тексты по умолчанию, которые зависят от того, кого зовём. */
interface GenderTexts {
  askTitle: string;
  confirmTitle: string;
  confirmSubtitle: string;
  whenTitle: string;
  finalTitle: string;
  finalWhen: string;
  finalNoWhen: string;
  pinQuestion: string;
  scratchMessage: string;
  envelopeHint: string;
  waitMessage: string;
  readyMessage: string;
}

const TEXTS: Record<Gender, GenderTexts> = {
  female: {
    askTitle: "Ты пойдёшь со мной на свидание?",
    confirmTitle: "Подожди, ты правда сказала «да»?",
    confirmSubtitle: "Сердце уже стучит в два раза быстрее 🙈",
    whenTitle: "Когда ты свободна?",
    finalTitle: "Ура, это свидание! 💘",
    finalWhen: "Будь готова {date} в {time} — я заеду за тобой.",
    finalNoWhen: "Скоро напишу, где и когда. Жду не дождусь!",
    pinQuestion: "Введи наш секретный код 🤫",
    scratchMessage: "Сотри, чтобы открыть",
    envelopeHint: "Тебе письмо! Нажми, чтобы открыть",
    waitMessage: "Потерпи немного — откроется через",
    readyMessage: "Время пришло! Открывай 💌",
  },
  male: {
    askTitle: "Ты пойдёшь со мной на свидание?",
    confirmTitle: "Подожди, ты правда сказал «да»?",
    confirmSubtitle: "Сердце уже стучит в два раза быстрее 🙈",
    whenTitle: "Когда ты свободен?",
    finalTitle: "Ура, это свидание! 💘",
    finalWhen: "Жду тебя {date} в {time}. Не опаздывай 😉",
    finalNoWhen: "Скоро напишу, где и когда. Жду не дождусь!",
    pinQuestion: "Введи наш секретный код 🤫",
    scratchMessage: "Сотри, чтобы открыть",
    envelopeHint: "Тебе письмо! Нажми, чтобы открыть",
    waitMessage: "Потерпи немного — откроется через",
    readyMessage: "Время пришло! Открывай 💌",
  },
};

/** От чего зависят тексты по умолчанию. */
export interface DefaultsBasis {
  gender: Gender;
  whenEnabled: boolean;
  choiceEnabled: boolean;
  category: ChoiceCategory;
}

export function basisOf(config: InviteConfig): DefaultsBasis {
  return {
    gender: config.gender,
    whenEnabled: config.when.enabled,
    choiceEnabled: config.choice.enabled,
    category: config.choice.category,
  };
}

export function defaultFinalText(basis: DefaultsBasis): string {
  const t = TEXTS[basis.gender];
  const parts = [basis.whenEnabled ? t.finalWhen : t.finalNoWhen];
  if (basis.choiceEnabled) parts.push(CHOICE_CATEGORIES[basis.category].finalLine);
  return parts.join(" ");
}

export function defaultChoiceOptions(category: ChoiceCategory): ChoiceOption[] {
  return CHOICE_CATEGORIES[category].options.slice(0, 6).map((s) => ({
    id: s.id,
    label: s.label,
    image: { kind: "sticker", id: s.id },
  }));
}

/** Завтра в 10:00 по местному времени. */
export function defaultUnlockAt(now: Date = new Date()): string {
  const date = addDays(now, 1);
  date.setHours(10, 0, 0, 0);
  return date.toISOString();
}

export function createDefaultConfig(gender: Gender = "female", now: Date = new Date()): InviteConfig {
  const t = TEXTS[gender];
  const category: ChoiceCategory = "food";
  const basis: DefaultsBasis = { gender, whenEnabled: true, choiceEnabled: true, category };
  return {
    v: 1,
    gender,
    theme: "zefir",
    intro: {
      mode: "none",
      pin: { question: t.pinQuestion, code: "" },
      scratch: { message: t.scratchMessage, color: "#FF5C8A" },
      envelope: { hint: t.envelopeHint },
      scheduled: {
        unlockAt: defaultUnlockAt(now),
        timezone: "Europe/Moscow",
        waitMessage: t.waitMessage,
        readyMessage: t.readyMessage,
        image: { kind: "sticker", id: "hourglass" },
      },
    },
    ask: {
      visual: { type: "image", image: { kind: "sticker", id: "pleading" } },
      title: t.askTitle,
      yesText: "Да",
      noText: "Нет",
      yesEffect: "boom",
      noEffect: "shrink",
    },
    confirm: {
      enabled: true,
      image: { kind: "sticker", id: "shy" },
      title: t.confirmTitle,
      subtitle: t.confirmSubtitle,
      buttonText: "Да, да, да!",
    },
    when: {
      enabled: true,
      mode: "recipient",
      date: nextSaturdayIso(now),
      time: "19:00",
      image: { kind: "sticker", id: "calendar" },
      title: t.whenTitle,
      buttonText: "Договорились ❤️",
    },
    choice: {
      enabled: true,
      category,
      title: CHOICE_CATEGORIES[category].title,
      subtitle: CHOICE_CATEGORIES[category].subtitle,
      multiple: false,
      options: defaultChoiceOptions(category),
      buttonText: "Дальше",
    },
    final: {
      image: { kind: "sticker", id: "party" },
      title: t.finalTitle,
      text: defaultFinalText(basis),
      showCalendar: true,
    },
  };
}

/**
 * Меняет пол, включённость экранов или категорию выбора. Тексты, которые автор
 * не трогал (совпадают со старыми значениями по умолчанию), подтягиваются под новые.
 */
export function rebaseDefaults(config: InviteConfig, next: DefaultsBasis): InviteConfig {
  const prev = basisOf(config);
  const a = TEXTS[prev.gender];
  const b = TEXTS[next.gender];
  const prevCategory = CHOICE_CATEGORIES[prev.category];
  const nextCategory = CHOICE_CATEGORIES[next.category];
  const keep = (current: string, oldDefault: string, newDefault: string) =>
    current === oldDefault ? newDefault : current;

  return {
    ...config,
    gender: next.gender,
    intro: {
      ...config.intro,
      pin: { ...config.intro.pin, question: keep(config.intro.pin.question, a.pinQuestion, b.pinQuestion) },
      scratch: { ...config.intro.scratch, message: keep(config.intro.scratch.message, a.scratchMessage, b.scratchMessage) },
      envelope: { ...config.intro.envelope, hint: keep(config.intro.envelope.hint, a.envelopeHint, b.envelopeHint) },
      scheduled: {
        ...config.intro.scheduled,
        waitMessage: keep(config.intro.scheduled.waitMessage, a.waitMessage, b.waitMessage),
        readyMessage: keep(config.intro.scheduled.readyMessage, a.readyMessage, b.readyMessage),
      },
    },
    ask: { ...config.ask, title: keep(config.ask.title, a.askTitle, b.askTitle) },
    confirm: {
      ...config.confirm,
      title: keep(config.confirm.title, a.confirmTitle, b.confirmTitle),
      subtitle: keep(config.confirm.subtitle, a.confirmSubtitle, b.confirmSubtitle),
    },
    when: {
      ...config.when,
      enabled: next.whenEnabled,
      title: keep(config.when.title, a.whenTitle, b.whenTitle),
    },
    choice: {
      ...config.choice,
      enabled: next.choiceEnabled,
      category: next.category,
      title: keep(config.choice.title, prevCategory.title, nextCategory.title),
      subtitle: keep(config.choice.subtitle, prevCategory.subtitle, nextCategory.subtitle),
      options: prev.category === next.category ? config.choice.options : defaultChoiceOptions(next.category),
    },
    final: {
      ...config.final,
      title: keep(config.final.title, a.finalTitle, b.finalTitle),
      text: keep(config.final.text, defaultFinalText(prev), defaultFinalText(next)),
    },
  };
}
