"use client";

import { useRef, useState, type ReactNode } from "react";
import { mediaUrl, uploadFile } from "@/lib/client/api";
import { SCREEN_STICKERS, type Sticker } from "@/lib/invite/stickers";
import type { ImageRef } from "@/lib/invite/types";

const COLLAPSED_COUNT = 11;
const MAX_BYTES = 10 * 1024 * 1024;

interface ImagePickerProps {
  value: ImageRef | null;
  onChange: (value: ImageRef | null) => void;
  stickers?: Sticker[];
  allowNone?: boolean;
}

export function ImagePicker({ value, onChange, stickers = SCREEN_STICKERS, allowNone = true }: ImagePickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(
    () => value?.kind === "sticker" && stickers.findIndex((sticker) => sticker.id === value.id) >= COLLAPSED_COUNT,
  );
  const visible = expanded ? stickers : stickers.slice(0, COLLAPSED_COUNT);

  async function handleFile(file: File) {
    setError(null);
    if (!file.type.startsWith("image/")) {
      setError("Нужна картинка: JPG, PNG, WEBP или GIF");
      return;
    }
    if (file.size > MAX_BYTES) {
      setError("Файл больше 10 МБ");
      return;
    }
    setUploading(true);
    try {
      const result = await uploadFile(file, "image", file.name);
      onChange({ kind: "upload", id: result.id });
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Не получилось загрузить");
    } finally {
      setUploading(false);
    }
  }

  const isSticker = (id: string) => value?.kind === "sticker" && value.id === id;

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-6 gap-2 sm:grid-cols-8">
        {allowNone && (
          <Tile selected={value === null} onClick={() => onChange(null)} label="Без картинки">
            <span className="text-xs font-bold text-app-soft">нет</span>
          </Tile>
        )}
        {visible.map((sticker) => (
          <Tile
            key={sticker.id}
            selected={isSticker(sticker.id)}
            onClick={() => onChange({ kind: "sticker", id: sticker.id })}
            label={sticker.label}
          >
            <span className="text-2xl leading-none">{sticker.emoji}</span>
          </Tile>
        ))}
        {!expanded && stickers.length > visible.length && (
          <Tile selected={false} onClick={() => setExpanded(true)} label="Показать все">
            <span className="text-xs font-bold text-app-soft">ещё</span>
          </Tile>
        )}
      </div>

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className={`flex items-center gap-3 rounded-2xl border-2 border-dashed px-3 py-2.5 text-left transition hover:border-app-accent/50 ${
          value?.kind === "upload" ? "border-app-accent bg-app-accent-soft/40" : "border-app-line bg-app-bg/50"
        }`}
      >
        {value?.kind === "upload" ? (
          <img src={mediaUrl(value.id)} alt="" className="h-12 w-12 rounded-xl object-cover" />
        ) : (
          <span aria-hidden className="grid h-12 w-12 place-items-center rounded-xl bg-white text-xl">
            📷
          </span>
        )}
        <span className="flex-1">
          <span className="block font-bold">
            {uploading ? "Загружаю…" : value?.kind === "upload" ? "Своё фото — заменить" : "Загрузить своё фото"}
          </span>
          <span className="block text-xs text-app-soft">JPG, PNG, WEBP или GIF до 10 МБ</span>
        </span>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = "";
          if (file) void handleFile(file);
        }}
      />
      {error && <p className="text-sm font-semibold text-app-accent">{error}</p>}
    </div>
  );
}

function Tile({
  selected,
  onClick,
  label,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  label: string;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={selected}
      onClick={onClick}
      className={`grid aspect-square place-items-center rounded-2xl border-2 transition active:scale-95 ${
        selected ? "border-app-accent bg-app-accent-soft" : "border-app-line bg-white hover:border-app-accent/40"
      }`}
    >
      {children}
    </button>
  );
}
