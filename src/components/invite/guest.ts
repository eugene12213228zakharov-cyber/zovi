// Кто открыл приглашение в режиме «зову компанию». Ключ и имя лежат в браузере гостя:
// по ключу сервер узнаёт его, когда он вернётся на ту же ссылку.

export interface GuestIdentity {
  key: string;
  name: string;
}

const storageKey = (inviteId: string) => `zovi:guest:${inviteId}`;

export function loadGuest(inviteId: string): GuestIdentity | null {
  try {
    const raw = window.localStorage.getItem(storageKey(inviteId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<GuestIdentity> | null;
    if (typeof parsed?.key !== "string" || typeof parsed.name !== "string") return null;
    return { key: parsed.key, name: parsed.name };
  } catch {
    return null;
  }
}

export function saveGuest(inviteId: string, guest: GuestIdentity): void {
  try {
    window.localStorage.setItem(storageKey(inviteId), JSON.stringify(guest));
  } catch {
    // Приватный режим или переполненное хранилище: гость просто представится заново.
  }
}
