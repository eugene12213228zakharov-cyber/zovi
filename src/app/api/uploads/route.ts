import { saveUpload } from "@/lib/server/uploads";

/** Загрузить фото, голосовое или кружок. Поля формы: file, kind = image | audio | video. */
export async function POST(request: Request) {
  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  const kind = form?.get("kind");
  if (!(file instanceof File) || (kind !== "image" && kind !== "audio" && kind !== "video")) {
    return Response.json({ error: "Файл не передан" }, { status: 400 });
  }

  const result = await saveUpload(kind, file);
  if (!result.ok) return Response.json({ error: result.error }, { status: result.status });
  return Response.json({ id: result.meta.id, mime: result.meta.mime, size: result.meta.size }, { status: 201 });
}
