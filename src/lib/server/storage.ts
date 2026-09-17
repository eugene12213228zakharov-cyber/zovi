// Приглашения лежат JSON-файлами в data/. Для личного использования этого хватает,
// а остальной код ходит только через функции ниже — переезд в базу затронет один этот файл.

import { promises as fs } from "node:fs";
import path from "node:path";
import { defaultPartyConfig } from "@/lib/invite/defaults";
import type { InviteAnswer, InviteEvent, InviteRecord } from "@/lib/invite/types";
import { DATA_DIR } from "./dataDir";
import { isSafeId } from "./ids";

/** Как выглядели приглашения до режима компании: один ответ прямо в записи. */
type StoredRecord = InviteRecord & { answer?: InviteAnswer; events?: InviteEvent[] };

/**
 * Приводит запись с диска к нынешнему виду: старый единственный ответ становится
 * первым участником, а в настройках появляются поля режима компании.
 */
function normalize(stored: StoredRecord | null): InviteRecord | null {
  if (!stored) return null;
  const { answer, events, ...rest } = stored;
  const config = {
    ...rest.config,
    audience: rest.config.audience ?? "single",
    party: rest.config.party ?? defaultPartyConfig(),
  };
  const pinFails = rest.pinFails ?? (events ?? []).filter((e) => e.type === "pin_failed").map((e) => e.at);
  if (Array.isArray(rest.participants)) return { ...rest, config, pinFails };
  const own = (events ?? []).filter((e) => e.type !== "pin_failed");
  return {
    ...rest,
    config,
    pinFails,
    participants: answer
      ? [{ key: "solo", name: "", joinedAt: answer.openedAt ?? rest.createdAt, answer, events: own }]
      : [],
  };
}

const INVITES_DIR = path.join(DATA_DIR, "invites");
const TOKENS_DIR = path.join(DATA_DIR, "author-tokens");

// Замки храним на globalThis: в dev-режиме Next может загрузить модуль в нескольких экземплярах.
type LockMap = Map<string, Promise<unknown>>;
const globalForLocks = globalThis as typeof globalThis & { __zoviLocks?: LockMap };
const locks: LockMap = (globalForLocks.__zoviLocks ??= new Map());

/** Выполняет операции над одним приглашением строго по очереди. */
async function withLock<T>(key: string, task: () => Promise<T>): Promise<T> {
  const previous = locks.get(key) ?? Promise.resolve();
  const current = previous.catch(() => undefined).then(task);
  const settled = current.catch(() => undefined);
  locks.set(key, settled);
  try {
    return await current;
  } finally {
    if (locks.get(key) === settled) locks.delete(key);
  }
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// На Windows файл может на мгновение держать антивирус или индексатор — такие ошибки повторяем.
const isTransient = (error: unknown) => {
  const code = (error as NodeJS.ErrnoException).code;
  return code === "EPERM" || code === "EBUSY" || code === "EACCES";
};

export async function writeJsonAtomic(file: string, data: unknown): Promise<void> {
  await fs.mkdir(path.dirname(file), { recursive: true });
  const tmp = `${file}.${process.pid}-${Date.now()}-${Math.random().toString(36).slice(2)}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(data, null, 2), "utf8");
  for (let attempt = 0; ; attempt++) {
    try {
      await fs.rename(tmp, file);
      return;
    } catch (error) {
      if (attempt >= 5 || !isTransient(error)) {
        await fs.rm(tmp, { force: true });
        throw error;
      }
      await sleep(25 * (attempt + 1));
    }
  }
}

export async function readJson<T>(file: string): Promise<T | null> {
  for (let attempt = 0; ; attempt++) {
    try {
      return JSON.parse(await fs.readFile(file, "utf8")) as T;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") return null;
      if (attempt >= 5 || !isTransient(error)) throw error;
      await sleep(25 * (attempt + 1));
    }
  }
}

const inviteFile = (id: string) => path.join(INVITES_DIR, `${id}.json`);
const tokenFile = (token: string) => path.join(TOKENS_DIR, `${token}.json`);

export async function createInvite(record: InviteRecord): Promise<void> {
  await withLock(record.id, async () => {
    await writeJsonAtomic(inviteFile(record.id), record);
    await writeJsonAtomic(tokenFile(record.authorToken), { id: record.id });
  });
}

export async function getInvite(id: string): Promise<InviteRecord | null> {
  if (!isSafeId(id)) return null;
  return normalize(await readJson<StoredRecord>(inviteFile(id)));
}

export async function getInviteByAuthorToken(token: string): Promise<InviteRecord | null> {
  if (!isSafeId(token)) return null;
  const link = await readJson<{ id: string }>(tokenFile(token));
  if (!link) return null;
  const record = await getInvite(link.id);
  return record?.authorToken === token ? record : null;
}

/**
 * Читает, меняет и сохраняет приглашение под замком.
 * Если mutate вернул null — ничего не записываем и возвращаем как было.
 */
export async function updateInvite(
  id: string,
  mutate: (record: InviteRecord) => InviteRecord | null,
): Promise<InviteRecord | null> {
  if (!isSafeId(id)) return null;
  return withLock(id, async () => {
    const record = normalize(await readJson<StoredRecord>(inviteFile(id)));
    if (!record) return null;
    const next = mutate(record);
    if (!next) return record;
    await writeJsonAtomic(inviteFile(id), next);
    return next;
  });
}
