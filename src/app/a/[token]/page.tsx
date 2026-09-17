import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Results } from "@/components/results/Results";
import type { AuthorView } from "@/lib/invite/types";
import { getInviteByAuthorToken } from "@/lib/server/storage";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Ответ на приглашение",
  robots: { index: false, follow: false },
  // Секрет живёт в адресе страницы — не отдаём его другим сайтам через Referer.
  referrer: "no-referrer",
};

export default async function AuthorPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const record = await getInviteByAuthorToken(token);
  if (!record) notFound();

  const view: AuthorView = {
    id: record.id,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
    config: record.config,
    participants: record.participants.map(({ key: _key, ...participant }) => ({
      ...participant,
      events: participant.events.slice(-100),
    })),
    pinFails: record.pinFails.slice(-100),
  };
  return <Results token={token} initial={view} />;
}
