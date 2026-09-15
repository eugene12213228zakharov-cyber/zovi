"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import type { FlowStage } from "@/components/invite/InviteFlow";
import { Logo } from "@/components/Logo";
import { ApiError, createInvite, fetchAuthorView, saveInvite } from "@/lib/client/api";
import { createDefaultConfig } from "@/lib/invite/defaults";
import { TIMEZONES } from "@/lib/invite/timezones";
import type { InviteConfig } from "@/lib/invite/types";
import { validateForSubmit, type EditorStepId } from "@/lib/invite/validate";
import { clearDraft, loadDraft, rememberInvite, saveDraft } from "./local";
import { PreviewPanel } from "./PreviewPanel";
import { STEPS } from "./steps";
import { StepAsk } from "./steps/StepAsk";
import { StepChoice } from "./steps/StepChoice";
import { StepConfirm } from "./steps/StepConfirm";
import { StepDone } from "./steps/StepDone";
import { StepFinal } from "./steps/StepFinal";
import { StepIntro } from "./steps/StepIntro";
import { StepWhen } from "./steps/StepWhen";
import { StepWho } from "./steps/StepWho";

function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    const media = window.matchMedia(query);
    const sync = () => setMatches(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, [query]);
  return matches;
}

const DISABLED_NOTE = "Экран выключен — получатель его не увидит";

export function Constructor({ editToken }: { editToken?: string }) {
  const [config, setConfig] = useState<InviteConfig>(() => createDefaultConfig("female"));
  const [stepIndex, setStepIndex] = useState(0);
  const [maxVisited, setMaxVisited] = useState(0);
  const [ready, setReady] = useState(false);
  const [editing, setEditing] = useState<{ id: string; token: string } | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [result, setResult] = useState<{ id: string; authorToken: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [previewStage, setPreviewStage] = useState<FlowStage>("ask");
  const [previewRun, setPreviewRun] = useState(0);
  const [mobilePreview, setMobilePreview] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 1024px)");

  const step = STEPS[stepIndex];
  const update = useCallback((updater: (current: InviteConfig) => InviteConfig) => setConfig(updater), []);

  // Старт: правка существующего приглашения или черновик из браузера.
  useEffect(() => {
    let cancelled = false;
    async function init() {
      if (editToken) {
        try {
          const view = await fetchAuthorView(editToken);
          if (cancelled) return;
          setConfig(view.config);
          setEditing({ id: view.id, token: editToken });
          setMaxVisited(STEPS.length - 1);
        } catch {
          if (!cancelled) setLoadError("Не нашёл приглашение для правки — проверь ссылку.");
        }
      } else {
        const draft = loadDraft();
        if (draft) {
          const index = Math.min(Math.max(0, draft.step), STEPS.length - 2);
          setConfig(draft.config);
          setStepIndex(index);
          setMaxVisited(index);
        } else {
          const zone = Intl.DateTimeFormat().resolvedOptions().timeZone;
          if (TIMEZONES.some((item) => item.id === zone)) {
            setConfig((current) => ({
              ...current,
              intro: { ...current.intro, scheduled: { ...current.intro.scheduled, timezone: zone } },
            }));
          }
        }
      }
      if (!cancelled) setReady(true);
    }
    void init();
    return () => {
      cancelled = true;
    };
  }, [editToken]);

  // Черновик сохраняется сам, чтобы перезагрузка страницы ничего не стёрла.
  useEffect(() => {
    if (!ready || editing || result) return;
    const timer = window.setTimeout(() => saveDraft(config, stepIndex), 400);
    return () => window.clearTimeout(timer);
  }, [config, stepIndex, ready, editing, result]);

  // На каждом шаге превью открывается на «его» экране.
  useEffect(() => {
    setPreviewStage(step.stage);
    setPreviewRun((run) => run + 1);
  }, [step.stage, stepIndex, config.intro.mode]);

  const problems = useMemo(() => validateForSubmit(config), [config]);

  const goTo = useCallback((index: number) => {
    const next = Math.max(0, Math.min(STEPS.length - 1, index));
    setStepIndex(next);
    setMaxVisited((visited) => Math.max(visited, next));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const goToStep = (id: EditorStepId) => goTo(STEPS.findIndex((item) => item.id === id));

  async function submit() {
    if (submitting || validateForSubmit(config).length > 0) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const saved = editing ? await saveInvite(editing.id, editing.token, config) : await createInvite(config);
      rememberInvite({
        id: saved.id,
        authorToken: saved.authorToken,
        title: config.ask.title,
        createdAt: new Date().toISOString(),
      });
      if (!editing) clearDraft();
      setResult(saved);
    } catch (error) {
      setSubmitError(error instanceof ApiError ? error.message : "Не получилось сохранить. Попробуй ещё раз.");
    } finally {
      setSubmitting(false);
    }
  }

  function startOver() {
    clearDraft();
    setResult(null);
    setEditing(null);
    setSubmitError(null);
    setConfirmReset(false);
    setConfig(createDefaultConfig(config.gender));
    setMaxVisited(0);
    goTo(0);
    if (editToken) window.history.replaceState(null, "", "/create");
  }

  const note =
    (step.id === "confirm" && !config.confirm.enabled) ||
    (step.id === "when" && !config.when.enabled) ||
    (step.id === "choice" && !config.choice.enabled)
      ? DISABLED_NOTE
      : null;

  const previewProps = {
    config,
    stage: previewStage,
    onStageChange: setPreviewStage,
    runKey: String(previewRun),
    note,
    onRestart: () => {
      setPreviewStage(step.stage);
      setPreviewRun((run) => run + 1);
    },
    onPlayAll: () => {
      setPreviewStage(config.intro.mode === "none" ? "ask" : "intro");
      setPreviewRun((run) => run + 1);
    },
  };

  const stepProps = { config, update };
  let body: ReactNode = null;
  switch (step.id) {
    case "who":
      body = <StepWho {...stepProps} />;
      break;
    case "intro":
      body = <StepIntro {...stepProps} />;
      break;
    case "ask":
      body = <StepAsk {...stepProps} />;
      break;
    case "confirm":
      body = <StepConfirm {...stepProps} />;
      break;
    case "when":
      body = <StepWhen {...stepProps} />;
      break;
    case "choice":
      body = <StepChoice {...stepProps} />;
      break;
    case "final":
      body = <StepFinal {...stepProps} />;
      break;
    case "done":
      body = (
        <StepDone
          config={config}
          problems={problems}
          onGoTo={goToStep}
          editing={editing !== null}
          submitting={submitting}
          submitError={submitError}
          result={result}
          onSubmit={() => void submit()}
          onStartOver={startOver}
        />
      );
      break;
  }

  if (loadError) {
    return (
      <main className="grid min-h-dvh place-items-center px-6 text-center">
        <div className="flex max-w-sm flex-col items-center gap-4">
          <span className="text-5xl">🔍</span>
          <h1 className="font-brand text-2xl font-bold">{loadError}</h1>
          <Link href="/create" className="rounded-full bg-app-accent px-6 py-3 font-extrabold text-app-accent-ink">
            Создать новое
          </Link>
        </div>
      </main>
    );
  }

  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-40 border-b border-app-line bg-app-bg/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4">
          <Logo />
          <nav aria-label="Шаги" className="no-scrollbar hidden flex-1 items-center justify-center gap-1 overflow-x-auto md:flex">
            {STEPS.map((item, index) => {
              const current = index === stepIndex;
              const reachable = index <= maxVisited;
              return (
                <button
                  key={item.id}
                  type="button"
                  disabled={!reachable}
                  onClick={() => goTo(index)}
                  aria-current={current ? "step" : undefined}
                  className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-extrabold transition ${
                    current ? "bg-app-ink text-white" : reachable ? "text-app-ink hover:bg-app-line/70" : "text-app-soft/50"
                  }`}
                >
                  <span className={`grid h-5 w-5 place-items-center rounded-full text-[11px] ${current ? "bg-white/20" : "bg-app-line"}`}>
                    {index + 1}
                  </span>
                  {item.short}
                </button>
              );
            })}
          </nav>
          <div className="ml-auto flex items-center gap-2 md:ml-0">
            {editing ? (
              <span className="rounded-full bg-app-accent-soft px-3 py-1 text-xs font-extrabold text-app-accent-strong">
                Правка
              </span>
            ) : confirmReset ? (
              <>
                <button type="button" onClick={startOver} className="rounded-full bg-app-accent px-3 py-1.5 text-sm font-extrabold text-white">
                  Да, сначала
                </button>
                <button type="button" onClick={() => setConfirmReset(false)} className="rounded-full px-3 py-1.5 text-sm font-bold text-app-soft">
                  Отмена
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmReset(true)}
                className="rounded-full px-3 py-1.5 text-sm font-bold text-app-soft transition hover:bg-app-line/70"
              >
                Начать заново
              </button>
            )}
          </div>
        </div>
        <div className="h-1 bg-app-line/60">
          <div
            className="h-full bg-app-accent transition-[width] duration-500"
            style={{ width: `${((stepIndex + 1) / STEPS.length) * 100}%` }}
          />
        </div>
      </header>

      <main className="mx-auto grid max-w-7xl gap-10 px-4 pb-32 pt-6 lg:grid-cols-[minmax(340px,400px)_1fr]">
        <aside className="hidden lg:block">
          {isDesktop && (
            <div className="sticky top-24">
              <PreviewPanel {...previewProps} />
            </div>
          )}
        </aside>
        <section className="min-w-0">
          <div className="text-sm font-extrabold text-app-soft">
            Шаг {stepIndex + 1} из {STEPS.length}
          </div>
          <h1 className="mt-1 font-brand text-[30px] font-bold leading-tight">{step.title}</h1>
          <p className="mt-2 max-w-2xl text-app-soft">{step.hint}</p>
          <div className={`mt-6 flex flex-col gap-4 transition-opacity duration-300 ${ready ? "opacity-100" : "opacity-0"}`}>
            {body}
          </div>
        </section>
      </main>

      <footer className="fixed inset-x-0 bottom-0 z-40 border-t border-app-line bg-app-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 py-3 lg:grid lg:grid-cols-[minmax(340px,400px)_1fr] lg:gap-10">
          <div className="hidden lg:block" />
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => goTo(stepIndex - 1)}
              disabled={stepIndex === 0}
              className="rounded-full px-4 py-3 font-extrabold text-app-soft transition hover:bg-app-line/70 disabled:opacity-40"
            >
              ← Назад
            </button>
            <button
              type="button"
              onClick={() => setMobilePreview(true)}
              className="rounded-full border-2 border-app-line px-4 py-2.5 font-extrabold lg:hidden"
            >
              👀 Превью
            </button>
            {step.id !== "done" && (
              <button
                type="button"
                onClick={() => goTo(stepIndex + 1)}
                className="ml-auto rounded-full bg-app-accent px-6 py-3 font-extrabold text-app-accent-ink shadow-[0_12px_26px_-14px_var(--app-accent)] transition hover:bg-app-accent-strong active:scale-95"
              >
                {stepIndex === STEPS.length - 2 ? "К ссылке →" : "Дальше →"}
              </button>
            )}
          </div>
        </div>
      </footer>

      {mobilePreview && !isDesktop && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Превью приглашения"
          className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-3 bg-[#1d1520]/85 p-4 backdrop-blur-sm"
        >
          <PreviewPanel {...previewProps} heightClass="h-[calc(100dvh-150px)]" showCaption={false} />
          <button
            type="button"
            onClick={() => setMobilePreview(false)}
            className="rounded-full bg-white px-6 py-2.5 font-extrabold text-app-ink"
          >
            Закрыть
          </button>
        </div>
      )}
    </div>
  );
}
