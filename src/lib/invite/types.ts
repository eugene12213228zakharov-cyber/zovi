// Модель приглашения. Всё, что настраивает автор, лежит в InviteConfig;
// всё, что сделал получатель, — в InviteAnswer и журнале событий.

export type Gender = "female" | "male";

/** Кого зовём: одного человека (свидание) или компанию (день рождения, свадьба, посиделки). */
export type Audience = "single" | "party";

export type ThemeId = "zefir" | "vecher" | "myata" | "bumaga" | "bilet";

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

/** Настройки режима «зову компанию»: как гость представляется и что видит о других. */
export interface PartyConfig {
  title: string;
  subtitle: string;
  placeholder: string;
  buttonText: string;
  /** Гость видит, кто уже согласился прийти. */
  showGuests: boolean;
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
  audience: Audience;
  gender: Gender;
  theme: ThemeId;
  party: PartyConfig;
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

/** Гость глазами автора: всё, кроме его секретного ключа. */
export type AuthorParticipant = Omit<Participant, "key">;

/** Что видит автор на своей странице ответов. */
export type AuthorView = Omit<InviteRecord, "authorToken" | "participants"> & {
  participants: AuthorParticipant[];
};

/** pin_failed не хранится у участника — страница автора собирает его из pinFails. */
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

/**
 * Один отвечающий. В режиме «зову одного» участник ровно один и без имени —
 * туда же попадают ответы, если ссылку открыли с нескольких устройств.
 * В режиме «зову компанию» участник заводится на каждого гостя, который представился.
 */
export interface Participant {
  /** Секретный ключ гостя: лежит у него в браузере, по нему узнаём его при возврате. */
  key: string;
  name: string;
  joinedAt: string;
  answer: InviteAnswer;
  events: InviteEvent[];
}

export interface InviteRecord {
  id: string;
  authorToken: string;
  createdAt: string;
  updatedAt: string;
  config: InviteConfig;
  participants: Participant[];
  /** Время неудачных попыток PIN: защита у приглашения общая, к гостю не привязана. */
  pinFails: string[];
}

/** Короткая сводка по гостю — её видят другие гости, без ключей и подробностей. */
export interface GuestSummary {
  name: string;
  status: "going" | "declined" | "thinking";
}
