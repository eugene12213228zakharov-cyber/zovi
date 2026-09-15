import { createReadStream, promises as fs } from "node:fs";
import { Readable } from "node:stream";
import { getUpload } from "@/lib/server/uploads";

/**
 * Отдаёт загруженный файл. Поддерживает Range-запросы: без них Safari на iPhone
 * отказывается проигрывать видео и аудио.
 */
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const upload = await getUpload(id);
  const stat = upload ? await fs.stat(upload.filePath).catch(() => null) : null;
  if (!upload || !stat) return new Response("Not found", { status: 404 });

  const size = stat.size;
  const headers = new Headers({
    "content-type": upload.meta.mime,
    "accept-ranges": "bytes",
    "cache-control": "public, max-age=31536000, immutable",
    "x-content-type-options": "nosniff",
  });

  const range = parseRange(request.headers.get("range"), size);
  if (range === "unsatisfiable") {
    headers.set("content-range", `bytes */${size}`);
    return new Response(null, { status: 416, headers });
  }

  const { start, end } = range ?? { start: 0, end: size - 1 };
  headers.set("content-length", String(end - start + 1));
  if (range) headers.set("content-range", `bytes ${start}-${end}/${size}`);

  const stream = Readable.toWeb(createReadStream(upload.filePath, { start, end })) as unknown as ReadableStream;
  return new Response(stream, { status: range ? 206 : 200, headers });
}

function parseRange(header: string | null, size: number): { start: number; end: number } | null | "unsatisfiable" {
  if (!header) return null;
  const match = /^bytes=(\d*)-(\d*)$/.exec(header.trim());
  // Несколько диапазонов сразу браузеры для медиа не просят — такое отдаём целиком.
  if (!match) return null;
  if (match[1] === "" && match[2] === "") return "unsatisfiable";

  let start: number;
  let end: number;
  if (match[1] === "") {
    start = Math.max(0, size - Number(match[2]));
    end = size - 1;
  } else {
    start = Number(match[1]);
    end = match[2] === "" ? size - 1 : Math.min(Number(match[2]), size - 1);
  }
  return start > end || start >= size ? "unsatisfiable" : { start, end };
}
