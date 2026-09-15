import { applyEvent } from "@/lib/invite/answer";
import { toPublicConfig } from "@/lib/invite/public";
import { getInvite, updateInvite } from "@/lib/server/storage";

const PIN_WINDOW_MS = 10 * 60 * 1000;
const PIN_MAX_FAILS = 15;

/** Открыть приглашение за «дверью»: проверить PIN или дождаться времени. */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const record = await getInvite(id);
  if (!record) return Response.json({ error: "not_found" }, { status: 404 });

  const { intro } = record.config;

  if (intro.mode === "pin") {
    const since = Date.now() - PIN_WINDOW_MS;
    const recentFails = record.events.filter((e) => e.type === "pin_failed" && Date.parse(e.at) > since).length;
    if (recentFails >= PIN_MAX_FAILS) {
      return Response.json({ error: "too_many_attempts" }, { status: 429 });
    }

    const body = (await request.json().catch(() => null)) as { pin?: unknown } | null;
    const pin = typeof body?.pin === "string" ? body.pin : "";
    if (pin !== intro.pin.code) {
      await updateInvite(id, (current) => applyEvent(current, { type: "pin_failed", at: new Date().toISOString() }));
      return Response.json({ error: "wrong_pin" }, { status: 403 });
    }
  } else if (intro.mode === "scheduled" && Date.parse(intro.scheduled.unlockAt) > Date.now()) {
    return Response.json({ error: "too_early", unlockAt: intro.scheduled.unlockAt }, { status: 423 });
  }

  return Response.json({ config: toPublicConfig(record.config) }, { headers: { "cache-control": "no-store" } });
}
