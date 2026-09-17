// Проверка того, что приходит в API: конфиг приглашения от конструктора и события от получателя.

import { z } from "zod";
import { defaultPartyConfig } from "./defaults";
import { MAX_GUEST_NAME } from "./answer";
import type { InviteConfig, InviteEventType } from "./types";

const ref = z.string().regex(/^[A-Za-z0-9-]{1,64}$/);
const text = (max: number) => z.string().max(max);
const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const hhmm = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/);
const isoDateTime = z
  .string()
  .max(40)
  .refine((value) => !Number.isNaN(Date.parse(value)));
const hexColor = z.string().regex(/^#[0-9a-fA-F]{6}$/);

const imageRef = z
  .discriminatedUnion("kind", [
    z.object({ kind: z.literal("sticker"), id: ref }),
    z.object({ kind: z.literal("upload"), id: ref }),
  ])
  .nullable();

const mediaRef = z.object({ id: ref, mime: text(100), durationSec: z.number().min(0).max(600) }).nullable();

export const inviteConfigSchema = z.object({
  v: z.literal(1),
  // Приглашения, созданные до режима компании, лежат в data/ без этих полей — подставляем значения по умолчанию.
  audience: z.enum(["single", "party"]).default("single"),
  gender: z.enum(["female", "male"]),
  party: z
    .object({
      title: text(300),
      subtitle: text(300),
      placeholder: text(40),
      buttonText: text(40),
      showGuests: z.boolean(),
    })
    .default(defaultPartyConfig),
  theme: z.enum(["zefir", "vecher", "myata", "bumaga", "bilet"]),
  intro: z.object({
    mode: z.enum(["none", "pin", "scratch", "envelope", "scheduled"]),
    pin: z.object({ question: text(200), code: z.string().regex(/^\d{0,8}$/) }),
    scratch: z.object({ message: text(120), color: hexColor }),
    envelope: z.object({ hint: text(120) }),
    scheduled: z.object({
      unlockAt: isoDateTime,
      timezone: text(64),
      waitMessage: text(200),
      readyMessage: text(200),
      image: imageRef,
    }),
  }),
  ask: z.object({
    visual: z.discriminatedUnion("type", [
      z.object({ type: z.literal("image"), image: imageRef }),
      z.object({ type: z.literal("voice"), audio: mediaRef, image: imageRef }),
      z.object({ type: z.literal("circle"), video: mediaRef }),
    ]),
    title: text(300),
    yesText: text(40),
    noText: text(40),
    yesEffect: z.enum(["boom", "none"]),
    noEffect: z.enum(["shrink", "runaway", "kiss", "honest"]),
  }),
  confirm: z.object({
    enabled: z.boolean(),
    image: imageRef,
    title: text(300),
    subtitle: text(300),
    buttonText: text(40),
  }),
  when: z.object({
    enabled: z.boolean(),
    mode: z.enum(["recipient", "fixed"]),
    date: isoDate,
    time: hhmm,
    image: imageRef,
    title: text(300),
    buttonText: text(40),
  }),
  choice: z.object({
    enabled: z.boolean(),
    category: z.enum(["food", "movie", "activity", "drink", "place"]),
    title: text(300),
    subtitle: text(300),
    multiple: z.boolean(),
    options: z.array(z.object({ id: ref, label: text(40), image: imageRef })).min(1).max(12),
    buttonText: text(40),
  }),
  final: z.object({
    image: imageRef,
    title: text(300),
    text: text(500),
    showCalendar: z.boolean(),
  }),
});

export function parseInviteConfig(input: unknown): InviteConfig | null {
  const result = inviteConfigSchema.safeParse(input);
  return result.success ? (result.data satisfies InviteConfig) : null;
}

/** События, которые может прислать страница получателя (pin_failed пишет только сервер). */
const CLIENT_EVENT_TYPES = [
  "opened",
  "intro_passed",
  "no_clicked",
  "declined",
  "yes",
  "confirmed",
  "when_chosen",
  "choice_made",
  "finished",
] as const satisfies readonly InviteEventType[];

/** Гость представляется: имя и, если он уже был здесь, его прежний ключ. */
export const joinInputSchema = z.object({
  name: z.string().max(MAX_GUEST_NAME * 4),
  key: z.string().max(64).optional(),
});

export const eventInputSchema = z.object({
  type: z.enum(CLIENT_EVENT_TYPES),
  data: z
    .record(z.string().max(32), z.union([text(200), z.number(), z.boolean(), z.array(text(60)).max(12)]))
    .optional(),
});
