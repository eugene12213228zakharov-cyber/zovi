import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LiveViewer } from "@/components/invite/LiveViewer";
import { gateFor } from "@/lib/invite/public";
import { getInvite } from "@/lib/server/storage";

export const dynamic = "force-dynamic";

// Превью ссылки в мессенджерах: заголовок интригует, но ничего не раскрывает.
export const metadata: Metadata = {
  title: { absolute: "Тебе приглашение 💌" },
  description: "Открой — там кое-что важное",
  robots: { index: false, follow: false },
  openGraph: { title: "Тебе приглашение 💌", description: "Открой — там кое-что важное" },
};

export default async function InvitePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const record = await getInvite(id);
  if (!record) notFound();
  return <LiveViewer inviteId={record.id} gate={gateFor(record.config)} />;
}
