"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import type { GuestSummary, InviteEvent, InviteEventType, PublicInviteConfig } from "@/lib/invite/types";
import { EnvelopeGate } from "./gates/EnvelopeGate";
import { PinGate, type PinResult } from "./gates/PinGate";
import { ReadyScreen, ScheduledGate } from "./gates/ScheduledGate";
import { ScratchGate } from "./gates/ScratchGate";
import { AskScreen } from "./screens/AskScreen";
import { ChoiceScreen } from "./screens/ChoiceScreen";
import { ConfirmScreen } from "./screens/ConfirmScreen";
import { DeclinedScreen } from "./screens/DeclinedScreen";
import { FinalScreen } from "./screens/FinalScreen";
import { WhenScreen } from "./screens/WhenScreen";

export type FlowStage = "intro" | "ask" | "declined" | "confirm" | "when" | "choice" | "final";

const ORDER: FlowStage[] = ["intro", "ask", "confirm", "when", "choice", "final"];

export function firstStage(config: PublicInviteConfig): FlowStage {
  return config.intro.mode === "none" ? "ask" : "intro";
}

/** Следующий включённый экран после stage. */
export function stageAfter(config: PublicInviteConfig, stage: FlowStage): FlowStage {
  const enabled: Record<FlowStage, boolean> = {
    intro: config.intro.mode !== "none",
    ask: true,
    declined: false,
    confirm: config.confirm.enabled,
    when: config.when.enabled,
    choice: config.choice.enabled,
    final: true,
  };
  const from = ORDER.indexOf(stage === "declined" ? "ask" : stage);
  return ORDER.slice(from + 1).find((next) => enabled[next]) ?? "final";
}

interface InviteFlowProps {
  config: PublicInviteConfig;
  stage: FlowStage;
  onStageChange: (stage: FlowStage) => void;
  /** Живой режим: события уходят на сервер. В превью не передаётся. */
  onEvent?: (type: InviteEventType, data?: InviteEvent["data"]) => void;
  /** Превью: проверка PIN без сервера. */
  verifyPin?: (pin: string) => Promise<PinResult>;
  preview?: boolean;
  /** Режим «зову компанию»: как зовут этого гостя и кто уже ответил. */
  guestName?: string;
  guests?: GuestSummary[];
}

/** Все экраны приглашения по порядку. Один и тот же код у получателя и в превью конструктора. */
export function InviteFlow({
  config,
  stage,
  onStageChange,
  onEvent,
  verifyPin,
  preview = false,
  guestName,
  guests = [],
}: InviteFlowProps) {
  const [pickedDate, setPickedDate] = useState<string | null>(null);
  const [pickedTime, setPickedTime] = useState<string | null>(null);
  const [choiceIds, setChoiceIds] = useState<string[]>([]);
  const [skipTimer, setSkipTimer] = useState(false);
  const finishedSent = useRef(false);

  const fixed = config.when.mode === "fixed";
  const date = fixed ? config.when.date : pickedDate;
  const time = fixed ? config.when.time : pickedTime;
  const choiceLabels = config.choice.options
    .filter((option) => choiceIds.includes(option.id))
    .map((option) => option.label);

  useEffect(() => {
    if (stage !== "final" || !onEvent || finishedSent.current) return;
    finishedSent.current = true;
    onEvent("finished");
  }, [stage, onEvent]);

  const advance = (from: FlowStage) => onStageChange(stageAfter(config, from));
  const passIntro = () => {
    onEvent?.("intro_passed");
    advance("intro");
  };

  const renderAsk = (interactive: boolean) => (
    <AskScreen
      ask={config.ask}
      interactive={interactive}
      onYes={() => {
        onEvent?.("yes");
        advance("ask");
      }}
      onNo={(count) => onEvent?.("no_clicked", { count })}
      onDecline={() => {
        onEvent?.("declined");
        onStageChange("declined");
      }}
    />
  );

  function renderIntro(): ReactNode {
    const { intro } = config;
    switch (intro.mode) {
      case "pin":
        return (
          <PinGate
            question={intro.pin.question}
            digits={intro.pin.digits}
            onSubmit={verifyPin ?? (async () => "ok")}
            onUnlocked={passIntro}
          />
        );
      case "scratch":
        return (
          <ScratchGate active color={intro.scratch.color} message={intro.scratch.message} onDone={passIntro}>
            {renderAsk(false)}
          </ScratchGate>
        );
      case "envelope":
        return <EnvelopeGate hint={intro.envelope.hint} onDone={passIntro} />;
      case "scheduled": {
        const scheduled = intro.scheduled;
        // У получателя сервер отдаёт приглашение только после наступления времени,
        // поэтому таймер здесь нужен лишь в превью.
        if (preview && !skipTimer && Date.parse(scheduled.unlockAt) > Date.now()) {
          return (
            <ScheduledGate
              unlockAt={scheduled.unlockAt}
              timezone={scheduled.timezone}
              waitMessage={scheduled.waitMessage}
              image={scheduled.image}
              onReady={() => setSkipTimer(true)}
            >
              <button
                type="button"
                onClick={() => setSkipTimer(true)}
                className="text-sm font-bold text-accent underline underline-offset-4"
              >
                Показать, что будет после таймера
              </button>
            </ScheduledGate>
          );
        }
        return <ReadyScreen message={scheduled.readyMessage} onOpen={passIntro} />;
      }
      default:
        return renderAsk(true);
    }
  }

  let screen: ReactNode = null;
  switch (stage) {
    case "intro":
      screen = renderIntro();
      break;
    case "ask":
      screen =
        config.intro.mode === "scratch" ? (
          <ScratchGate
            active={false}
            color={config.intro.scratch.color}
            message={config.intro.scratch.message}
            onDone={passIntro}
          >
            {renderAsk(true)}
          </ScratchGate>
        ) : (
          renderAsk(true)
        );
      break;
    case "declined":
      screen = (
        <DeclinedScreen
          gender={config.gender}
          party={config.audience === "party"}
          onBack={() => onStageChange("ask")}
        />
      );
      break;
    case "confirm":
      screen = (
        <ConfirmScreen
          confirm={config.confirm}
          onNext={() => {
            onEvent?.("confirmed");
            advance("confirm");
          }}
        />
      );
      break;
    case "when":
      screen = (
        <WhenScreen
          when={config.when}
          date={date}
          time={time}
          onChange={(value) => {
            setPickedDate(value.date);
            setPickedTime(value.time);
          }}
          onNext={() => {
            onEvent?.("when_chosen", { date: date ?? "", time: time ?? "" });
            advance("when");
          }}
        />
      );
      break;
    case "choice":
      screen = (
        <ChoiceScreen
          choice={config.choice}
          selectedIds={choiceIds}
          onChange={setChoiceIds}
          onNext={(labels) => {
            onEvent?.("choice_made", { choices: labels });
            advance("choice");
          }}
        />
      );
      break;
    case "final": {
      // В превью подставляем примерные значения, чтобы автор видел, как прочитается текст.
      const sampleChoices = preview ? config.choice.options.slice(0, 1).map((option) => option.label) : [];
      screen = (
        <FinalScreen
          final={config.final}
          party={config.audience === "party"}
          guestName={guestName}
          guests={guests}
          values={{
            date: config.when.enabled ? (date ?? (preview ? config.when.date : null)) : null,
            time: config.when.enabled ? (time ?? (preview ? config.when.time : null)) : null,
            choices: config.choice.enabled ? (choiceLabels.length > 0 ? choiceLabels : sampleChoices) : [],
          }}
        />
      );
      break;
    }
  }

  // Для «стереть» экран вопроса не пересоздаём: слой просто исчезает с уже нарисованного экрана.
  const screenKey = config.intro.mode === "scratch" && (stage === "intro" || stage === "ask") ? "scratch" : stage;
  return (
    <div key={screenKey} className="w-full animate-pop">
      {screen}
    </div>
  );
}
