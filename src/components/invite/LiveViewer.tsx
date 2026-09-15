"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ApiError, sendInviteEvent, unlockInvite } from "@/lib/client/api";
import type { InviteGate } from "@/lib/invite/public";
import type { InviteEvent, InviteEventType, PublicInviteConfig } from "@/lib/invite/types";
import { PinGate, type PinResult } from "./gates/PinGate";
import { ScheduledGate } from "./gates/ScheduledGate";
import { firstStage, InviteFlow, type FlowStage } from "./InviteFlow";
import { ThemedStage } from "./ThemedStage";

// Защита от двойного «открыли» в dev-режиме, где React монтирует компонент дважды.
const openedSent = new Set<string>();

/** Страница получателя: «дверь» (PIN или таймер), затем само приглашение. */
export function LiveViewer({ inviteId, gate }: { inviteId: string; gate: InviteGate }) {
  const [config, setConfig] = useState<PublicInviteConfig | null>(gate.kind === "open" ? gate.config : null);
  const [stage, setStage] = useState<FlowStage>(gate.kind === "open" ? firstStage(gate.config) : "ask");
  const unlocked = useRef<PublicInviteConfig | null>(null);

  useEffect(() => {
    if (openedSent.has(inviteId)) return;
    openedSent.add(inviteId);
    sendInviteEvent(inviteId, "opened");
  }, [inviteId]);

  const onEvent = useCallback(
    (type: InviteEventType, data?: InviteEvent["data"]) => sendInviteEvent(inviteId, type, data),
    [inviteId],
  );

  if (config) {
    return (
      <ThemedStage theme={config.theme}>
        <InviteFlow config={config} stage={stage} onStageChange={setStage} onEvent={onEvent} />
      </ThemedStage>
    );
  }

  if (gate.kind === "pin") {
    const submit = async (pin: string): Promise<PinResult> => {
      try {
        const result = await unlockInvite(inviteId, pin);
        unlocked.current = result.config;
        return "ok";
      } catch (error) {
        if (error instanceof ApiError && error.status === 403) return "wrong";
        if (error instanceof ApiError && error.status === 429) return "blocked";
        return "error";
      }
    };
    return (
      <ThemedStage theme={gate.theme}>
        <PinGate
          question={gate.question}
          digits={gate.digits}
          onSubmit={submit}
          onUnlocked={() => {
            if (!unlocked.current) return;
            onEvent("intro_passed");
            setStage("ask");
            setConfig(unlocked.current);
          }}
        />
      </ThemedStage>
    );
  }

  if (gate.kind === "scheduled") {
    const openWhenReady = async () => {
      // Часы телефона и сервера могут расходиться на пару секунд — повторяем, пока сервер не откроет.
      for (let attempt = 0; attempt < 40; attempt++) {
        try {
          const result = await unlockInvite(inviteId);
          setStage(firstStage(result.config));
          setConfig(result.config);
          return;
        } catch {
          await new Promise((resolve) => window.setTimeout(resolve, 1500));
        }
      }
    };
    return (
      <ThemedStage theme={gate.theme}>
        <ScheduledGate
          unlockAt={gate.unlockAt}
          timezone={gate.timezone}
          waitMessage={gate.waitMessage}
          image={gate.image}
          onReady={() => void openWhenReady()}
        />
      </ThemedStage>
    );
  }

  return null;
}
