import { applyEvent, guestList } from "@/lib/invite/answer";
import { eventInputSchema } from "@/lib/invite/schema";
import type { InviteEvent, InviteRecord } from "@/lib/invite/types";
import { notifyAuthor } from "@/lib/server/notify";
import { updateInvite } from "@/lib/server/storage";

/** Что сделал получатель: открыл, нажал «Нет», выбрал дату и т.д. */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const parsed = eventInputSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "bad_event" }, { status: 400 });

  // Ключ гостя есть только в режиме «зову компанию» — его выдаёт /join.
  const key = request.headers.get("x-guest-key");
  const event: InviteEvent = {
    type: parsed.data.type,
    at: new Date().toISOString(),
    ...(parsed.data.data ? { data: parsed.data.data } : {}),
  };

  let applied = false;
  const updated = await updateInvite(id, (record) => {
    const next = applyEvent(record, key, event);
    applied = next !== null;
    return next;
  });

  if (!updated) return Response.json({ error: "not_found" }, { status: 404 });
  // Гость не представился: ответ записывать некуда, но и ошибки на экране показывать незачем.
  if (!applied) return Response.json({ ok: false, needName: true });

  await notifyAuthor(updated, key, event);
  const guests = updated.config.audience === "party" ? guestList(updated) : [];
  return Response.json({ ok: true, guests });
}
