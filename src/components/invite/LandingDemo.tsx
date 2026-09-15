"use client";

import { useMemo, useState } from "react";
import { createDefaultConfig } from "@/lib/invite/defaults";
import { toPublicConfig } from "@/lib/invite/public";
import { firstStage, InviteFlow, type FlowStage } from "./InviteFlow";
import { PhoneFrame } from "./PhoneFrame";
import { ThemedStage } from "./ThemedStage";

/** Живой пример на главной: можно понажимать, ничего никуда не отправляется. */
export function LandingDemo() {
  const config = useMemo(() => {
    const base = createDefaultConfig("female");
    return toPublicConfig({ ...base, ask: { ...base.ask, noEffect: "runaway" } });
  }, []);
  const [stage, setStage] = useState<FlowStage>(() => firstStage(config));
  const [run, setRun] = useState(0);

  return (
    <div className="flex w-full flex-col items-center gap-3">
      <PhoneFrame>
        <ThemedStage theme={config.theme} layout="frame">
          <InviteFlow key={run} config={config} stage={stage} onStageChange={setStage} preview />
        </ThemedStage>
      </PhoneFrame>
      <button
        type="button"
        onClick={() => {
          setRun((count) => count + 1);
          setStage(firstStage(config));
        }}
        className="rounded-full px-4 py-2 text-sm font-bold text-app-soft transition hover:bg-app-line/70"
      >
        ↺ Пройти заново
      </button>
    </div>
  );
}
