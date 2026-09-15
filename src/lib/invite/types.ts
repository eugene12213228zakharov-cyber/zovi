// Модель приглашения. Всё, что настраивает автор, лежит в InviteConfig;
// всё, что сделал получатель, — в InviteAnswer и журнале событий.

export type Gender = "female" | "male";

export type ThemeId = "zefir" | "vecher" | "myata" | "bumaga";

/** Картинка на экране: стикер из набора или загруженный файл. */
export type ImageRef = { kind: "sticker"; id: string } | { kind: "upload"; id: string };

/** Загруженный аудио- или видеофайл (голосовое, кружок). */
export interface MediaRef {
  id: string;
  mime: string;
  durationSec: number;
}

export type AskVisual =
  | { type: "image"; image: ImageRef | null }
  | { type: "voice"; audio: MediaRef | null; image: ImageRef | null }
  | { type: "circle"; video: MediaRef | null };

export type IntroMode = "none" | "pin" | "scratch" | "envelope" | "scheduled";

export interface IntroConfig {
  mode: IntroMode;
  /** Код проверяется на сервере и получателю не отдаётся. */
  pin: { question: string; code: string };
  scratch: { message: string; color: string };
  envelope: { hint: string };
  scheduled: {
    /** Момент открытия в UTC (ISO). */
    unlockAt: string;
    timezone: string;
    waitMessage: string;
    readyMessage: string;
    image: ImageRef | null;
  };
}

export type YesEffect = "boom" | "none";

/**
 * shrink — «Нет» уменьшается, «Да» растёт; runaway — «Нет» убегает;
 * kiss — вместо отказа прилетает поцелуй; honest — отказ засчитывается по-настоящему.
 */
export type NoEffect = "shrink" | "runaway" | "kiss" | "honest";

export interface AskScreen {
  visual: AskVisual;
  title: string;
  yesText: string;
  noText: string;
  yesEffect: YesEffect;
  noEffect: NoEffect;
}

export interface ConfirmScreen {
  enabled: boolean;
  image: ImageRef | null;
  title: string;
  subtitle: string;
  buttonText: string;
}

export interface WhenScreen {
  enabled: boolean;
  /** recipient — дату и время выбирает получатель; fixed — автор задал сам. */
  mode: "recipient" | "fixed";
  /** YYYY-MM-DD, используется в режиме fixed. */
  date: string;
  /** HH:MM, используется в режиме fixed. */
  time: string;
  image: ImageRef | null;
  title: string;
  buttonText: string;
}

export type ChoiceCategory = "food" | "movie" | "activity" | "drink" | "place";

export interface ChoiceOption {
  id: string;
  label: string;
  image: ImageRef | null;
}

export interface ChoiceScreen {
  enabled: boolean;
  category: ChoiceCategory;
  title: string;
  subtitle: string;
  multiple: boolean;
  options: ChoiceOption[];
  buttonText: string;
}

export interface FinalScreen {
  image: ImageRef | null;
  title: string;
  /** Поддерживает подстановки {date}, {time}, {choice}. */
  text: string;
  showCalendar: boolean;
}

export interface InviteConfig {
  v: 1;
  gender: Gender;
  theme: ThemeId;
  intro: IntroConfig;
  ask: AskScreen;
  confirm: ConfirmScreen;
  when: WhenScreen;
  choice: ChoiceScreen;
  final: FinalScreen;
}

/** То, что уходит получателю: всё, кроме PIN-кода (вместо него — сколько в нём цифр). */
export type PublicInviteConfig = Omit<InviteConfig, "intro"> & {
  intro: Omit<IntroConfig, "pin"> & { pin: { question: string; digits: number } };
};

/** Что видит автор на своей странице ответов. */
export type AuthorView = Omit<InviteRecord, "authorToken">;

export type InviteEventType =
  | "opened"
  | "intro_passed"
  | "pin_failed"
  | "no_clicked"
  | "declined"
  | "yes"
  | "confirmed"
  | "when_chosen"
  | "choice_made"
  | "finished";

export interface InviteEvent {
  type: InviteEventType;
  at: string;
  data?: Record<string, string | number | boolean | string[]>;
}

export interface InviteAnswer {
  openedAt: string | null;
  opens: number;
  noClicks: number;
  declinedAt: string | null;
  yesAt: string | null;
  date: string | null;
  time: string | null;
  /** Подписи выбранных вариантов — не id, чтобы ответ читался даже после правки приглашения. */
  choices: string[];
  finishedAt: string | null;
}

export interface InviteRecord {
  id: string;
  authorToken: string;
  createdAt: string;
  updatedAt: string;
  config: InviteConfig;
  answer: InviteAnswer;
  events: InviteEvent[];
}
