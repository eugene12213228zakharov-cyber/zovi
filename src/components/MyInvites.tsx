"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { forgetInvite, loadSavedInvites, type SavedInvite } from "@/components/constructor/local";

/** Созданные в этом браузере приглашения — чтобы не потерять секретные ссылки на ответы. */
export function MyInvites() {
  const [invites, setInvites] = useState<SavedInvite[]>([]);

  useEffect(() => {
    setInvites(loadSavedInvites());
  }, []);

  if (invites.length === 0) return null;

  return (
    <section className="mx-auto max-w-6xl px-5 pb-6">
      <div className="rounded-[28px] border border-app-line bg-app-card p-5">
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="text-lg font-extrabold">Мои приглашения</h2>
          <span className="text-xs text-app-soft">хранятся в этом браузере</span>
        </div>
        <ul className="mt-2 divide-y divide-app-line">
          {invites.map((invite) => (
            <li key={invite.id} className="flex items-center gap-3 py-3">
              <span className="min-w-0 flex-1 truncate font-semibold">{invite.title || "Приглашение"}</span>
              <span className="hidden text-sm text-app-soft sm:block">
                {new Date(invite.createdAt).toLocaleDateString("ru-RU", { day: "numeric", month: "long" })}
              </span>
              <Link
                href={`/a/${invite.authorToken}`}
                className="shrink-0 rounded-full bg-app-accent-soft px-4 py-2 text-sm font-extrabold text-app-accent-strong"
              >
                Ответ →
              </Link>
              <button
                type="button"
                aria-label="Убрать из списка"
                title="Убрать из списка"
                onClick={() => {
                  forgetInvite(invite.id);
                  setInvites(loadSavedInvites());
                }}
                className="grid h-9 w-9 shrink-0 place-items-center rounded-xl text-app-soft transition hover:bg-app-bg"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
