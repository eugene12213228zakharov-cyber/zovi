import { emptyAnswer } from "@/lib/invite/answer";
import { parseInviteConfig } from "@/lib/invite/schema";
import type { InviteRecord } from "@/lib/invite/types";
import { validateForSubmit } from "@/lib/invite/validate";
import { newAuthorToken, newInviteId } from "@/lib/server/ids";
import { createInvite } from "@/lib/server/storage";

/** Создать приглашение. Возвращает id для ссылки получателя и секрет для страницы автора. */
export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { config?: unknown } | null;
  const config = parseInviteConfig(body?.config);
  if (!config) return Response.json({ error: "Приглашение заполнено с ошибкой" }, { status: 400 });

  const problems = validateForSubmit(config, { checkTime: false });
  if (problems.length > 0) return Response.json({ error: problems[0].message }, { status: 400 });

  const now = new Date().toISOString();
  const record: InviteRecord = {
    id: newInviteId(),
    authorToken: newAuthorToken(),
    createdAt: now,
    updatedAt: now,
    config,
    answer: emptyAnswer(),
    events: [],
  };
  await createInvite(record);
  return Response.json({ id: record.id, authorToken: record.authorToken }, { status: 201 });
}
