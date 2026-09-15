"use client";

import { useCallback, useMemo } from "react";
import type { PinResult } from "@/components/invite/gates/PinGate";
import { InviteFlow, type FlowStage } from "@/components/invite/InviteFlow";
import { PhoneFrame } from "@/components/invite/PhoneFrame";
import { ThemedStage } from "@/components/invite/ThemedStage";
import { toPublicConfig } from "@/lib/invite/public";
import type { InviteConfig } from "@/lib/invite/types";

interface PreviewPanelProps {
  config: InviteConfig;
  stage: FlowStage;
  onStageChange: (stage: FlowStage) => void;
  runKey: string;
  onRestart: () => void;
  onPlayAll: () => void;
  note: string | null;
  heightClass?: string;
  showCaption?: boolean;
}

export function PreviewPanel({
  config,
  stage,
  onStageChange,
  runKey,
  onRestart,
  onPlayAll,
  note,
  heightClass = "h-[min(660px,calc(100dvh-290px))]",
  showCaption = true,
}: PreviewPanelProps) {
  const publicConfig = useMemo(() => toPublicConfig(config), [config]);
  const code = config.intro.pin.code;
  // Пока код не придуман, в превью подходит любой.
  const verifyPin = useCallback(
    async (pin: string): Promise<PinResult> => (code.length !== 4 || pin === code ? "ok" : "wrong"),
    [code],
  );

  return (
    <div className="flex w-full flex-col items-center gap-3">
      {showCaption && (
        <p className="text-center text-sm font-semibold text-app-soft">Нажимай — так увидит получатель</p>
      )}
      <PhoneFrame heightClass={heightClass}>
        <ThemedStage theme={config.theme} layout="frame">
          <InviteFlow
            key={runKey}
            config={publicConfig}
            stage={stage}
            onStageChange={onStageChange}
            verifyPin={verifyPin}
            preview
          />
        </ThemedStage>
        {note && (
          <div className="absolute inset-x-4 top-12 z-40 rounded-2xl bg-[#1d1520]/80 px-4 py-3 text-center text-sm font-bold text-white backdrop-blur">
            {note}
          </div>
        )}
      </PhoneFrame>
      <div className="flex flex-wrap justify-center gap-2">
        <button
          type="button"
          onClick={onRestart}
          className="rounded-full border border-app-line bg-app-card px-4 py-2 text-sm font-bold shadow-sm transition hover:border-app-accent/40"
        >
          ↺ К этому шагу
        </button>
        <button
          type="button"
          onClick={onPlayAll}
          className="rounded-full bg-app-ink px-4 py-2 text-sm font-bold text-white transition hover:opacity-90"
        >
          ▶ Пройти целиком
        </button>
      </div>
    </div>
  );
}
