import { parseInviteConfig } from "@/lib/invite/schema";
import { validateForSubmit } from "@/lib/invite/validate";
import { getInvite, updateInvite } from "@/lib/server/storage";

/** Сохранить правки автора. Ответы получателя при этом не трогаем. */
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const token = request.headers.get("x-author-token") ?? "";

  const existing = await getInvite(id);
  if (!existing) return Response.json({ error: "Приглашение не найдено" }, { status: 404 });
  if (existing.authorToken !== token) return Response.json({ error: "Нет доступа" }, { status: 403 });

  const body = (await request.json().catch(() => null)) as { config?: unknown } | null;
  const config = parseInviteConfig(body?.config);
  if (!config) return Response.json({ error: "Приглашение заполнено с ошибкой" }, { status: 400 });

  const problems = validateForSubmit(config, { checkTime: false });
  if (problems.length > 0) return Response.json({ error: problems[0].message }, { status: 400 });

  const updated = await updateInvite(id, (record) =>
    record.authorToken === token ? { ...record, config, updatedAt: new Date().toISOString() } : null,
  );
  if (!updated) return Response.json({ error: "Приглашение не найдено" }, { status: 404 });
  return Response.json({ id: updated.id, authorToken: updated.authorToken });
}
