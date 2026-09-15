import { randomBytes } from "node:crypto";

// Без похожих друг на друга символов (I/l/1, O/0), чтобы ссылку можно было продиктовать.
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
const LIMIT = 256 - (256 % ALPHABET.length);

export function randomId(length: number): string {
  let out = "";
  while (out.length < length) {
    for (const byte of randomBytes(length * 2)) {
      if (byte < LIMIT) out += ALPHABET[byte % ALPHABET.length];
      if (out.length === length) break;
    }
  }
  return out;
}

export const newInviteId = () => randomId(10);
export const newAuthorToken = () => randomId(32);
export const newUploadId = () => randomId(16);

/** Годится ли строка в имя файла: только буквы и цифры. */
export function isSafeId(value: string): boolean {
  return /^[A-Za-z0-9]{6,64}$/.test(value);
}
