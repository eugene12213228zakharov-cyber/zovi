"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ApiError, joinInvite, sendInviteEvent, unlockInvite } from "@/lib/client/api";
import type { InviteGate } from "@/lib/invite/public";
import type { GuestSummary, InviteEvent, InviteEventType, PublicInviteConfig } from "@/lib/invite/types";
import { PinGate, type PinResult } from "./gates/PinGate";
import { ScheduledGate } from "./gates/ScheduledGate";
import { loadGuest, saveGuest, type GuestIdentity } from "./guest";
import { firstStage, InviteFlow, type FlowStage } from "./InviteFlow";
import { NameScreen } from "./screens/NameScreen";
import { ThemedStage } from "./ThemedStage";

// Защита от двойного «открыли» в dev-режиме, где React монтирует компонент дважды.
const openedSent = new Set<string>();

/** Страница получателя: «дверь» (PIN или таймер), затем само приглашение. */
export function LiveViewer({ inviteId, gate }: { inviteId: string; gate: InviteGate }) {
  const [config, setConfig] = useState<PublicInviteConfig | null>(gate.kind === "open" ? gate.config : null);
  const [stage, setStage] = useState<FlowStage>(gate.kind === "open" ? firstStage(gate.config) : "ask");
  const unlocked = useRef<PublicInviteConfig | null>(null);

  // Режим «зову компанию»: пока гость не назвался, отвечать не за кого.
  const [guest, setGuest] = useState<GuestIdentity | null>(null);
  const [guestLoaded, setGuestLoaded] = useState(false);
  const [joining, setJoining] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);
  const [guests, setGuests] = useState<GuestSummary[]>([]);

  useEffect(() => {
    setGuest(loadGuest(inviteId));
    setGuestLoaded(true);
  }, [inviteId]);

  const party = config?.audience === "party";
  const guestKey = guest?.key;

  // В компании «открыл» засчитываем гостю, поэтому ждём, пока он назовётся.
  useEffect(() => {
    if (party && !guestKey) return;
    if (openedSent.has(inviteId)) return;
    openedSent.add(inviteId);
    void sendInviteEvent(inviteId, "opened", undefined, guestKey);
  }, [inviteId, party, guestKey]);

  const onEvent = useCallback(
    (type: InviteEventType, data?: InviteEvent["data"]) => {
      void sendInviteEvent(inviteId, type, data, guestKey).then((result) => {
        if (result?.guests) setGuests(result.guests);
      });
    },
    [inviteId, guestKey],
  );

  const submitName = useCallback(
    async (name: string) => {
      setJoining(true);
      setJoinError(null);
      try {
        const result = await joinInvite(inviteId, name, guest?.key);
        const identity = { key: result.key, name: result.name };
        saveGuest(inviteId, identity);
        setGuest(identity);
        setGuests(result.guests);
      } catch (error) {
        setJoinError(error instanceof ApiError ? error.message : "Не получилось — попробуй ещё раз");
      } finally {
        setJoining(false);
      }
    },
    [inviteId, guest?.key],
  );

  if (config) {
    // Ждём, пока прочитается память браузера, иначе гость на секунду увидит чужой экран.
    if (config.audience === "party" && !guestLoaded) return null;
    if (config.audience === "party" && !guest) {
      return (
        <ThemedStage theme={config.theme} party>
          <NameScreen party={config.party} busy={joining} error={joinError} onSubmit={(name) => void submitName(name)} />
        </ThemedStage>
      );
    }
    return (
      <ThemedStage theme={config.theme} party={config.audience === "party"}>
        <InviteFlow
          config={config}
          stage={stage}
          onStageChange={setStage}
          onEvent={onEvent}
          guestName={guest?.name}
          guests={guests}
        />
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
