import { MAX_PARTICIPANTS, cleanGuestName, guestList, newParticipant } from "@/lib/invite/answer";
import { joinInputSchema } from "@/lib/invite/schema";
import type { GuestSummary } from "@/lib/invite/types";
import { newGuestKey } from "@/lib/server/ids";
import { updateInvite } from "@/lib/server/storage";

/**
 * Гость представляется в режиме «зову компанию»: получает свой ключ и попадает в список.
 * Если ключ уже есть (гость вернулся или поправил имя) — обновляем имя, нового не заводим.
 */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const parsed = joinInputSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Не разобрал имя" }, { status: 400 });

  const name = cleanGuestName(parsed.data.name);
  if (name === "") return Response.json({ error: "Напиши, как тебя зовут" }, { status: 400 });

  const known = parsed.data.key ?? null;
  let key = "";
  let guests: GuestSummary[] = [];
  let full = false;

  const updated = await updateInvite(id, (record) => {
    if (record.config.audience !== "party") return null;
    const now = new Date().toISOString();
    const index = record.participants.findIndex((participant) => participant.key === known);

    if (index < 0 && record.participants.length >= MAX_PARTICIPANTS) {
      full = true;
      return null;
    }

    key = index < 0 ? newGuestKey() : record.participants[index].key;
    const participants =
      index < 0
        ? [...record.participants, newParticipant(key, name, now)]
        : record.participants.map((participant, at) => (at === index ? { ...participant, name } : participant));

    guests = guestList({ participants });
    return { ...record, participants, updatedAt: now };
  });

  if (!updated) return Response.json({ error: "Приглашение не найдено" }, { status: 404 });
  if (full) return Response.json({ error: "Больше гостей не помещается" }, { status: 409 });
  if (key === "") return Response.json({ error: "Это приглашение не для компании" }, { status: 400 });
  return Response.json({ key, name, guests }, { headers: { "cache-control": "no-store" } });
}
