import { mediaUrl } from "@/lib/client/api";
import { findSticker } from "@/lib/invite/stickers";
import type { ImageRef } from "@/lib/invite/types";

const STICKER_SIZES = {
  xl: "h-44 w-44 text-[92px]",
  lg: "h-32 w-32 text-[64px]",
  md: "h-20 w-20 text-[40px]",
  sm: "h-12 w-12 text-[26px]",
  xs: "h-9 w-9 text-[19px]",
} as const;

const PHOTO_SIZES = {
  xl: "w-full max-w-[260px] aspect-square rounded-[32px]",
  lg: "w-full max-w-[200px] aspect-square rounded-[28px]",
  md: "h-20 w-20 rounded-[20px]",
  sm: "h-12 w-12 rounded-[14px]",
  xs: "h-9 w-9 rounded-[10px]",
} as const;

export type StickerSize = keyof typeof STICKER_SIZES;

interface StickerImageProps {
  image: ImageRef | null;
  size?: StickerSize;
  float?: boolean;
  className?: string;
}

/** Картинка экрана: эмодзи-стикер на круглой подложке или загруженное фото. */
export function StickerImage({ image, size = "lg", float = false, className = "" }: StickerImageProps) {
  if (!image) return null;

  if (image.kind === "upload") {
    return (
      <img
        src={mediaUrl(image.id)}
        alt=""
        draggable={false}
        className={`${PHOTO_SIZES[size]} object-cover shadow-[0_18px_40px_-20px_rgba(0,0,0,0.45)] ${className}`}
      />
    );
  }

  const sticker = findSticker(image.id);
  if (!sticker) return null;
  return (
    <span
      aria-hidden
      className={`relative inline-grid shrink-0 place-items-center rounded-full bg-sticker ${STICKER_SIZES[size]} ${
        float ? "animate-float" : ""
      } ${className}`}
    >
      <span className="select-none leading-none drop-shadow-[0_6px_10px_rgba(0,0,0,0.15)]">{sticker.emoji}</span>
    </span>
  );
}
