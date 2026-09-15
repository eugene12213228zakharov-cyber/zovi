// Всё, что конструктор хранит в браузере: черновик и список созданных приглашений
// (чтобы не потерять секретную ссылку на ответ).

import { parseInviteConfig } from "@/lib/invite/schema";
import type { InviteConfig } from "@/lib/invite/types";

const DRAFT_KEY = "zovi:draft:v1";
const INVITES_KEY = "zovi:invites:v1";

export interface Draft {
  config: InviteConfig;
  step: number;
}

export function loadDraft(): Draft | null {
  try {
    const raw = window.localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { config?: unknown; step?: unknown };
    const config = parseInviteConfig(parsed.config);
    if (!config) return null;
    return { config, step: typeof parsed.step === "number" ? parsed.step : 0 };
  } catch {
    return null;
  }
}

export function saveDraft(config: InviteConfig, step: number): void {
  try {
    window.localStorage.setItem(DRAFT_KEY, JSON.stringify({ config, step }));
  } catch {
    // Приватный режим или переполненное хранилище — черновик просто не сохранится.
  }
}

export function clearDraft(): void {
  try {
    window.localStorage.removeItem(DRAFT_KEY);
  } catch {
    // см. saveDraft
  }
}

export interface SavedInvite {
  id: string;
  authorToken: string;
  title: string;
  createdAt: string;
}

const isSavedInvite = (value: unknown): value is SavedInvite => {
  const item = value as Partial<SavedInvite> | null;
  return typeof item?.id === "string" && typeof item.authorToken === "string";
};

export function loadSavedInvites(): SavedInvite[] {
  try {
    const list: unknown = JSON.parse(window.localStorage.getItem(INVITES_KEY) ?? "[]");
    return Array.isArray(list) ? list.filter(isSavedInvite) : [];
  } catch {
    return [];
  }
}

export function rememberInvite(invite: SavedInvite): void {
  try {
    const list = loadSavedInvites().filter((item) => item.id !== invite.id);
    const previous = loadSavedInvites().find((item) => item.id === invite.id);
    list.unshift(previous ? { ...invite, createdAt: previous.createdAt } : invite);
    window.localStorage.setItem(INVITES_KEY, JSON.stringify(list.slice(0, 30)));
  } catch {
    // см. saveDraft
  }
}

export function forgetInvite(id: string): void {
  try {
    const list = loadSavedInvites().filter((item) => item.id !== id);
    window.localStorage.setItem(INVITES_KEY, JSON.stringify(list));
  } catch {
    // см. saveDraft
  }
}
