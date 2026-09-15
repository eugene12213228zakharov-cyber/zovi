import { applyEvent } from "@/lib/invite/answer";
import { eventInputSchema } from "@/lib/invite/schema";
import type { InviteEvent } from "@/lib/invite/types";
import { notifyAuthor } from "@/lib/server/notify";
import { updateInvite } from "@/lib/server/storage";

/** Что сделал получатель: открыл, нажал «Нет», выбрал дату и т.д. */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const parsed = eventInputSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "bad_event" }, { status: 400 });

  const event: InviteEvent = {
    type: parsed.data.type,
    at: new Date().toISOString(),
    ...(parsed.data.data ? { data: parsed.data.data } : {}),
  };

  const updated = await updateInvite(id, (record) => applyEvent(record, event));
  if (!updated) return Response.json({ error: "not_found" }, { status: 404 });

  await notifyAuthor(updated, event);
  return Response.json({ ok: true });
}
