import type { ImageRef, InviteConfig, PublicInviteConfig, ThemeId } from "./types";

/** PIN всегда из 4 цифр — именно такой требует конструктор. */
export const PIN_DIGITS = 4;

export function toPublicConfig(config: InviteConfig): PublicInviteConfig {
  const { pin, ...intro } = config.intro;
  return { ...config, intro: { ...intro, pin: { question: pin.question, digits: PIN_DIGITS } } };
}

/**
 * Что можно показать получателю сразу. Для PIN и таймера отдаём только «дверь»,
 * а само приглашение приходит с сервера после кода или наступления времени —
 * так его не подсмотреть в исходнике страницы.
 */
export type InviteGate =
  | { kind: "open"; config: PublicInviteConfig }
  | { kind: "pin"; theme: ThemeId; question: string; digits: number }
  | {
      kind: "scheduled";
      theme: ThemeId;
      unlockAt: string;
      timezone: string;
      waitMessage: string;
      image: ImageRef | null;
    };

export function gateFor(config: InviteConfig, nowMs: number = Date.now()): InviteGate {
  const { intro } = config;
  if (intro.mode === "pin") {
    return { kind: "pin", theme: config.theme, question: intro.pin.question, digits: PIN_DIGITS };
  }
  if (intro.mode === "scheduled" && Date.parse(intro.scheduled.unlockAt) > nowMs) {
    const scheduled = intro.scheduled;
    return {
      kind: "scheduled",
      theme: config.theme,
      unlockAt: scheduled.unlockAt,
      timezone: scheduled.timezone,
      waitMessage: scheduled.waitMessage,
      image: scheduled.image,
    };
  }
  return { kind: "open", config: toPublicConfig(config) };
}
