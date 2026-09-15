import type { Metadata } from "next";
import { DemoViewer } from "@/components/invite/DemoViewer";

export const metadata: Metadata = {
  title: "Пример приглашения",
  robots: { index: false, follow: false },
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function DemoPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const pick = (key: string) => {
    const value = params[key];
    return typeof value === "string" ? value : undefined;
  };
  return <DemoViewer theme={pick("theme")} intro={pick("intro")} no={pick("no")} gender={pick("gender")} />;
}
