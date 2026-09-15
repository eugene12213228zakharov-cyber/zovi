import type { Metadata } from "next";
import { Constructor } from "@/components/constructor/Constructor";

export const metadata: Metadata = {
  title: "Конструктор приглашения",
  robots: { index: false, follow: false },
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function CreatePage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const editToken = typeof params.edit === "string" ? params.edit : undefined;
  return <Constructor key={editToken ?? "new"} editToken={editToken} />;
}
