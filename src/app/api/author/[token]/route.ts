import type { AuthorView } from "@/lib/invite/types";
import { getInviteByAuthorToken } from "@/lib/server/storage";

/** Данные для страницы автора: настройки и свежий ответ получателя. */
export async function GET(_request: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const record = await getInviteByAuthorToken(token);
  if (!record) return Response.json({ error: "not_found" }, { status: 404 });

  const view: AuthorView = {
    id: record.id,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
    config: record.config,
    answer: record.answer,
    events: record.events.slice(-100),
  };
  return Response.json(view, { headers: { "cache-control": "no-store" } });
}
