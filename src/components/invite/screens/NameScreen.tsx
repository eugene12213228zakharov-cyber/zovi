"use client";

import { useState } from "react";
import type { PartyConfig } from "@/lib/invite/types";
import { PrimaryButton, ScreenCard, ScreenText, ScreenTitle } from "../ui";

/** Первый экран в режиме «зову компанию»: гость называет себя, чтобы автор знал, кто придёт. */
export function NameScreen({
  party,
  busy,
  error,
  initialName = "",
  onSubmit,
}: {
  party: PartyConfig;
  busy: boolean;
  error: string | null;
  initialName?: string;
  onSubmit: (name: string) => void;
}) {
  const [name, setName] = useState(initialName);
  const ready = name.trim().length > 0 && !busy;

  return (
    <ScreenCard>
      <div className="flex flex-col gap-2">
        <ScreenTitle>{party.title}</ScreenTitle>
        {party.subtitle && <ScreenText>{party.subtitle}</ScreenText>}
      </div>
      <form
        className="flex w-full flex-col gap-3"
        onSubmit={(event) => {
          event.preventDefault();
          if (ready) onSubmit(name.trim());
        }}
      >
        <input
          autoFocus
          value={name}
          maxLength={40}
          onChange={(event) => setName(event.target.value)}
          placeholder={party.placeholder}
          aria-label={party.title}
          autoComplete="name"
          className="min-h-14 w-full rounded-full border-2 border-line bg-card px-6 text-center text-[17px] font-bold text-ink outline-none transition focus:border-accent"
        />
        {error && <p className="text-[15px] font-semibold text-accent">{error}</p>}
        <PrimaryButton type="submit" className="w-full" disabled={!ready}>
          {busy ? "Секунду…" : party.buttonText}
        </PrimaryButton>
      </form>
    </ScreenCard>
  );
}
