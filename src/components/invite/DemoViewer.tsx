"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { createDefaultConfig } from "@/lib/invite/defaults";
import { toPublicConfig } from "@/lib/invite/public";
import type { IntroMode, InviteConfig, NoEffect, ThemeId } from "@/lib/invite/types";
import { firstStage, InviteFlow, type FlowStage } from "./InviteFlow";
import { ThemedStage } from "./ThemedStage";

const THEMES: ThemeId[] = ["zefir", "vecher", "myata", "bumaga"];
const INTROS: IntroMode[] = ["none", "pin", "scratch", "envelope", "scheduled"];
const NO_EFFECTS: NoEffect[] = ["shrink", "runaway", "kiss", "honest"];

const oneOf = <T extends string>(list: readonly T[], value: string | undefined): T | undefined =>
  list.find((item) => item === value);

interface DemoViewerProps {
  theme?: string;
  intro?: string;
  no?: string;
  gender?: string;
}

/** Пример приглашения без сохранения. Варианты можно пощупать через ?theme=vecher&intro=envelope&no=kiss. */
export function DemoViewer({ theme, intro, no, gender }: DemoViewerProps) {
  const config = useMemo<InviteConfig>(() => {
    const base = createDefaultConfig(gender === "male" ? "male" : "female");
    return {
      ...base,
      theme: oneOf(THEMES, theme) ?? base.theme,
      intro: { ...base.intro, mode: oneOf(INTROS, intro) ?? base.intro.mode, pin: { ...base.intro.pin, code: "1234" } },
      ask: { ...base.ask, noEffect: oneOf(NO_EFFECTS, no) ?? base.ask.noEffect },
    };
  }, [theme, intro, no, gender]);

  const publicConfig = useMemo(() => toPublicConfig(config), [config]);
  const [stage, setStage] = useState<FlowStage>(() => firstStage(publicConfig));

  return (
    <ThemedStage theme={config.theme}>
      <InviteFlow
        config={publicConfig}
        stage={stage}
        onStageChange={setStage}
        preview
        verifyPin={async (pin) => (pin === config.intro.pin.code ? "ok" : "wrong")}
      />
      <p className="relative mt-6 text-center text-sm font-semibold text-ink-soft">
        Это пример{config.intro.mode === "pin" ? " (код — 1234)" : ""}.{" "}
        <Link href="/create" className="text-accent underline underline-offset-4">
          Создать своё →
        </Link>
      </p>
    </ThemedStage>
  );
}
