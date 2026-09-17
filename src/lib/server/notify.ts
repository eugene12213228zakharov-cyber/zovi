// Необязательные уведомления автору в Telegram. Включаются двумя строками в .env.local:
//   TELEGRAM_BOT_TOKEN=токен бота от @BotFather
//   TELEGRAM_CHAT_ID=твой chat id
// Без них приложение работает как обычно — ответы видны на странице автора.

import { findParticipant, soloAnswer } from "@/lib/invite/answer";
import { formatDayMonth, joinChoices } from "@/lib/invite/format";
import type { InviteEvent, InviteRecord } from "@/lib/invite/types";

export function authorMessageFor(record: InviteRecord, key: string | null, event: InviteEvent): string | null {
  const party = record.config.audience === "party";
  const participant = findParticipant(record, key);
  const answer = party ? participant?.answer : soloAnswer(record);
  if (!answer) return null;

  const female = record.config.gender === "female";
  const pick = (f: string, m: string) => (female ? f : m);
  // В компании имена разные, поэтому вместо «она сказала» подставляем имя гостя.
  const who = party ? (participant?.name ?? "Гость") : null;

  switch (event.type) {
    case "opened":
      if (answer.opens !== 1) return null;
      return who ? `💌 ${who} открыл(а) приглашение` : "💌 Приглашение открыли!";
    case "yes":
      return who ? `🎉 ${who} идёт!` : `🎉 ${pick("Она сказала", "Он сказал")} «да»!`;
    case "declined":
      return who ? `😔 ${who} не придёт` : `😔 ${pick("Она нажала", "Он нажал")} «Нет» по-настоящему`;
    case "finished": {
      const lines = [who ? `✅ Ответ от ${who}` : "✅ Ответ готов"];
      if (answer.date || answer.time) lines.push(`🗓 ${formatDayMonth(answer.date)} ${answer.time ?? ""}`.trim());
      if (answer.choices.length > 0) lines.push(`✨ ${joinChoices(answer.choices)}`);
      if (answer.noClicks > 0 && !who) lines.push(`🙈 «Нет» ${pick("нажимала", "нажимал")}: ${answer.noClicks}`);
      if (party) {
        const going = record.participants.filter((p) => p.answer.yesAt && !p.answer.declinedAt).length;
        lines.push(`👥 Идут: ${going}`);
      }
      return lines.join("\n");
    }
    default:
      return null;
  }
}

export async function notifyAuthor(record: InviteRecord, key: string | null, event: InviteEvent): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  const text = authorMessageFor(record, key, event);
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
