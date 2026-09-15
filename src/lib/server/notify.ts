// Необязательные уведомления автору в Telegram. Включаются двумя строками в .env.local:
//   TELEGRAM_BOT_TOKEN=токен бота от @BotFather
//   TELEGRAM_CHAT_ID=твой chat id
// Без них приложение работает как обычно — ответы видны на странице автора.

import { formatDayMonth, joinChoices } from "@/lib/invite/format";
import type { InviteEvent, InviteRecord } from "@/lib/invite/types";

export function authorMessageFor(record: InviteRecord, event: InviteEvent): string | null {
  const female = record.config.gender === "female";
  const pick = (f: string, m: string) => (female ? f : m);
  const { answer } = record;

  switch (event.type) {
    case "opened":
      return answer.opens === 1 ? "💌 Приглашение открыли!" : null;
    case "yes":
      return `🎉 ${pick("Она сказала", "Он сказал")} «да»!`;
    case "declined":
      return `😔 ${pick("Она нажала", "Он нажал")} «Нет» по-настоящему`;
    case "finished": {
      const lines = ["✅ Ответ готов"];
      if (answer.date || answer.time) lines.push(`🗓 ${formatDayMonth(answer.date)} ${answer.time ?? ""}`.trim());
      if (answer.choices.length > 0) lines.push(`✨ ${joinChoices(answer.choices)}`);
      if (answer.noClicks > 0) lines.push(`🙈 «Нет» ${pick("нажимала", "нажимал")}: ${answer.noClicks}`);
      return lines.join("\n");
    }
    default:
      return null;
  }
}

export async function notifyAuthor(record: InviteRecord, event: InviteEvent): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  const text = authorMessageFor(record, event);
  if (!token || !chatId || !text) return;

  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text, disable_web_page_preview: true }),
      signal: AbortSignal.timeout(5000),
    });
  } catch {
    // Уведомление — бонус: из-за него ответ получателя не должен теряться.
  }
}
