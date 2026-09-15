import Link from "next/link";

export default function NotFound() {
  return (
    <main className="grid min-h-dvh place-items-center px-6 text-center">
      <div className="flex max-w-sm flex-col items-center gap-4">
        <span aria-hidden className="text-6xl">
          🫥
        </span>
        <h1 className="font-brand text-2xl font-bold">Такого приглашения нет</h1>
        <p className="text-app-soft">Возможно, в ссылке опечатка или приглашение удалили.</p>
        <Link href="/" className="rounded-full bg-app-accent px-6 py-3 font-extrabold text-app-accent-ink">
          На главную
        </Link>
      </div>
    </main>
  );
}
