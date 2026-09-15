import { promises as fs } from "node:fs";
import path from "node:path";
import { DATA_DIR } from "./dataDir";
import { isSafeId, newUploadId } from "./ids";
import { readJson, writeJsonAtomic } from "./storage";

export type UploadKind = "image" | "audio" | "video";

const UPLOADS_DIR = path.join(DATA_DIR, "uploads");
const MB = 1024 * 1024;

// SVG и HTML не принимаем: их нельзя безопасно отдавать с нашего же домена.
const RULES: Record<UploadKind, { maxBytes: number; extensions: Record<string, string> }> = {
  image: {
    maxBytes: 10 * MB,
    extensions: {
      "image/jpeg": "jpg",
      "image/png": "png",
      "image/webp": "webp",
      "image/gif": "gif",
      "image/avif": "avif",
    },
  },
  audio: {
    maxBytes: 25 * MB,
    extensions: {
      "audio/webm": "webm",
      "audio/ogg": "ogg",
      "audio/mp4": "m4a",
      "audio/x-m4a": "m4a",
      "audio/aac": "aac",
      "audio/mpeg": "mp3",
      "audio/wav": "wav",
    },
  },
  video: {
    maxBytes: 80 * MB,
    extensions: {
      "video/mp4": "mp4",
      "video/webm": "webm",
      "video/quicktime": "mov",
    },
  },
};

export interface UploadMeta {
  id: string;
  kind: UploadKind;
  mime: string;
  size: number;
  file: string;
  createdAt: string;
}

export type SaveUploadResult = { ok: true; meta: UploadMeta } | { ok: false; status: number; error: string };

/** «audio/webm;codecs=opus» → «audio/webm». */
export function baseMime(mime: string): string {
  return mime.split(";")[0].trim().toLowerCase();
}

export async function saveUpload(kind: UploadKind, file: File): Promise<SaveUploadResult> {
  const rules = RULES[kind];
  const mime = baseMime(file.type);
  const extension = rules.extensions[mime];
  if (!extension) return { ok: false, status: 415, error: "Такой формат файла не поддерживается" };
  if (file.size <= 0) return { ok: false, status: 400, error: "Файл пустой" };
  if (file.size > rules.maxBytes) {
    return { ok: false, status: 413, error: `Файл больше ${rules.maxBytes / MB} МБ` };
  }

  const id = newUploadId();
  const name = `${id}.${extension}`;
  await fs.mkdir(UPLOADS_DIR, { recursive: true });
  await fs.writeFile(path.join(UPLOADS_DIR, name), Buffer.from(await file.arrayBuffer()));

  const meta: UploadMeta = { id, kind, mime, size: file.size, file: name, createdAt: new Date().toISOString() };
  await writeJsonAtomic(path.join(UPLOADS_DIR, `${id}.json`), meta);
  return { ok: true, meta };
}

export async function getUpload(id: string): Promise<{ meta: UploadMeta; filePath: string } | null> {
  if (!isSafeId(id)) return null;
  const meta = await readJson<UploadMeta>(path.join(UPLOADS_DIR, `${id}.json`));
  if (!meta) return null;
  return { meta, filePath: path.join(UPLOADS_DIR, meta.file) };
}
