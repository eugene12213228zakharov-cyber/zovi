import type {
  AuthorView,
  InviteConfig,
  InviteEvent,
  InviteEventType,
  PublicInviteConfig,
} from "@/lib/invite/types";

export class ApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(url, init);
  } catch {
    throw new ApiError("Нет связи с сервером", 0);
  }
  const body = (await response.json().catch(() => null)) as { error?: string } | null;
  if (!response.ok) throw new ApiError(body?.error ?? "Что-то пошло не так", response.status);
  return body as T;
}

const json = (method: string, data: unknown, headers: Record<string, string> = {}): RequestInit => ({
  method,
  headers: { "content-type": "application/json", ...headers },
  body: JSON.stringify(data),
});

export const mediaUrl = (id: string) => `/api/media/${id}`;

export function createInvite(config: InviteConfig) {
  return request<{ id: string; authorToken: string }>("/api/invites", json("POST", { config }));
}

export function saveInvite(id: string, authorToken: string, config: InviteConfig) {
  return request<{ id: string; authorToken: string }>(
    `/api/invites/${id}`,
    json("PUT", { config }, { "x-author-token": authorToken }),
  );
}

export function fetchAuthorView(token: string) {
  return request<AuthorView>(`/api/author/${token}`, { cache: "no-store" });
}

export function unlockInvite(id: string, pin?: string) {
  return request<{ config: PublicInviteConfig }>(`/api/invites/${id}/unlock`, json("POST", { pin }));
}

/** Событие получателя уходит «в фоне»: ответ не ждём, ошибки не показываем. */
export function sendInviteEvent(id: string, type: InviteEventType, data?: InviteEvent["data"]) {
  void fetch(`/api/invites/${id}/events`, { ...json("POST", { type, data }), keepalive: true }).catch(
    () => undefined,
  );
}

export function uploadFile(file: Blob, kind: "image" | "audio" | "video", fileName: string) {
  const form = new FormData();
  form.append("kind", kind);
  form.append("file", file, fileName);
  return request<{ id: string; mime: string; size: number }>("/api/uploads", { method: "POST", body: form });
}
