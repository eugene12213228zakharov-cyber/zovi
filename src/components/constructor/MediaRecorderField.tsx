"use client";

import { useEffect, useRef, useState } from "react";
import { CirclePlayer, formatDuration, VoiceBubble } from "@/components/invite/media";
import { uploadFile } from "@/lib/client/api";
import type { MediaRef } from "@/lib/invite/types";

const MAX_SECONDS = 60;
// Сначала MP4: его играют и iPhone, и Android. WebM — запасной вариант для браузеров без MP4-записи.
const AUDIO_TYPES = ["audio/mp4", "audio/webm;codecs=opus", "audio/webm", "audio/ogg;codecs=opus"];
const VIDEO_TYPES = ["video/mp4;codecs=avc1,mp4a.40.2", "video/mp4", "video/webm;codecs=vp9,opus", "video/webm"];

type Phase = "idle" | "asking" | "recording" | "uploading";

interface MediaRecorderFieldProps {
  kind: "voice" | "circle";
  value: MediaRef | null;
  onChange: (value: MediaRef | null) => void;
}

function pickMimeType(candidates: string[]): string | undefined {
  if (typeof MediaRecorder === "undefined") return undefined;
  return candidates.find((type) => MediaRecorder.isTypeSupported(type));
}

function probeDuration(file: File, kind: "voice" | "circle"): Promise<number> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const element = document.createElement(kind === "voice" ? "audio" : "video");
    const done = (seconds: number) => {
      URL.revokeObjectURL(url);
      resolve(seconds);
    };
    element.preload = "metadata";
    element.onloadedmetadata = () => done(Number.isFinite(element.duration) ? Math.round(element.duration) : 0);
    element.onerror = () => done(0);
    element.src = url;
  });
}

/** Запись голосового или кружка прямо в браузере, либо загрузка готового файла. */
export function MediaRecorderField({ kind, value, onChange }: MediaRecorderFieldProps) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [seconds, setSeconds] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startedAtRef = useRef(0);
  const tickRef = useRef<number | null>(null);
  const liveVideoRef = useRef<HTMLVideoElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const voice = kind === "voice";

  useEffect(
    () => () => {
      if (tickRef.current) window.clearInterval(tickRef.current);
      if (recorderRef.current?.state === "recording") {
        recorderRef.current.onstop = null;
        recorderRef.current.stop();
      }
      streamRef.current?.getTracks().forEach((track) => track.stop());
    },
    [],
  );

  // Живое изображение с камеры, пока пишем кружок.
  useEffect(() => {
    const video = liveVideoRef.current;
    if (phase !== "recording" || voice || !video || !streamRef.current) return;
    video.srcObject = streamRef.current;
    void video.play().catch(() => undefined);
  }, [phase, voice]);

  function releaseStream() {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }

  async function start() {
    setError(null);
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      setError("Этот браузер не умеет записывать. Загрузи готовый файл.");
      return;
    }
    setPhase("asking");
    try {
      const stream = await navigator.mediaDevices.getUserMedia(
        voice
          ? { audio: { echoCancellation: true, noiseSuppression: true } }
          : { audio: true, video: { facingMode: "user", width: { ideal: 720 }, height: { ideal: 720 } } },
      );
      streamRef.current = stream;
      const mimeType = pickMimeType(voice ? AUDIO_TYPES : VIDEO_TYPES);
      const recorder = new MediaRecorder(
        stream,
        mimeType ? { mimeType, ...(voice ? {} : { videoBitsPerSecond: 1_500_000 }) } : undefined,
      );
      chunksRef.current = [];
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };
      recorder.onstop = () => {
        const type = recorder.mimeType || mimeType || (voice ? "audio/webm" : "video/webm");
        const duration = Math.max(1, Math.round((Date.now() - startedAtRef.current) / 1000));
        releaseStream();
        void upload(new Blob(chunksRef.current, { type }), type, duration);
        chunksRef.current = [];
      };
      recorderRef.current = recorder;
      recorder.start(250);
      startedAtRef.current = Date.now();
      setSeconds(0);
      setPhase("recording");
      tickRef.current = window.setInterval(() => {
        const elapsed = (Date.now() - startedAtRef.current) / 1000;
        setSeconds(elapsed);
        if (elapsed >= MAX_SECONDS) stop();
      }, 200);
    } catch {
      releaseStream();
      setPhase("idle");
      setError(
        voice
          ? "Нет доступа к микрофону. Разреши его в настройках браузера или загрузи файл."
          : "Нет доступа к камере. Разреши её в настройках браузера или загрузи файл.",
      );
    }
  }

  function stop() {
    if (tickRef.current) {
      window.clearInterval(tickRef.current);
      tickRef.current = null;
    }
    if (recorderRef.current && recorderRef.current.state !== "inactive") recorderRef.current.stop();
  }

  async function upload(blob: Blob, mime: string, durationSec: number) {
    setPhase("uploading");
    try {
      const extension = mime.includes("mp4") ? "mp4" : mime.includes("ogg") ? "ogg" : "webm";
      const result = await uploadFile(blob, voice ? "audio" : "video", `${kind}.${extension}`);
      onChange({ id: result.id, mime: result.mime, durationSec: Math.min(600, durationSec) });
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Не получилось загрузить запись");
    } finally {
      setPhase("idle");
    }
  }

  async function handleFile(file: File) {
    setError(null);
    const duration = await probeDuration(file, kind);
    await upload(file, file.type, duration);
  }

  const recording = phase === "recording";

  return (
    <div className="flex flex-col items-stretch gap-3">
      {!voice && (phase === "asking" || recording) && (
        <div className="relative mx-auto h-56 w-56 overflow-hidden rounded-full bg-[#1d1520] shadow-lg">
          <video ref={liveVideoRef} className="h-full w-full -scale-x-100 object-cover" muted playsInline />
          <svg className="pointer-events-none absolute inset-0 -rotate-90" viewBox="0 0 224 224" aria-hidden>
            <circle
              cx="112"
              cy="112"
              r="108"
              fill="none"
              stroke="#ff3d7f"
              strokeWidth="6"
              strokeDasharray={2 * Math.PI * 108}
              strokeDashoffset={2 * Math.PI * 108 * (1 - Math.min(1, seconds / MAX_SECONDS))}
            />
          </svg>
        </div>
      )}

      {value && phase === "idle" && (
        <div className="flex justify-center rounded-2xl bg-app-bg/60 p-4">
          {voice ? <VoiceBubble media={value} /> : <CirclePlayer media={value} size={180} />}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        {recording ? (
          <button
            type="button"
            onClick={stop}
            className="flex items-center gap-3 rounded-full bg-app-ink px-5 py-3 font-extrabold text-white"
          >
            <span className="h-3 w-3 animate-pulse rounded-sm bg-[#ff3d5f]" />
            Стоп · {formatDuration(seconds)} / {formatDuration(MAX_SECONDS)}
          </button>
        ) : (
          <button
            type="button"
            onClick={() => void start()}
            disabled={phase !== "idle"}
            className="flex items-center gap-2 rounded-full bg-app-accent px-5 py-3 font-extrabold text-app-accent-ink transition hover:bg-app-accent-strong disabled:opacity-50"
          >
            <span className="h-3 w-3 rounded-full bg-white" />
            {phase === "asking"
              ? "Жду разрешения…"
              : phase === "uploading"
                ? "Сохраняю…"
                : value
                  ? "Перезаписать"
                  : voice
                    ? "Записать голосовое"
                    : "Записать кружок"}
          </button>
        )}
        {!recording && (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={phase !== "idle"}
            className="rounded-full border-2 border-app-line px-4 py-2.5 text-sm font-extrabold text-app-soft transition hover:border-app-accent/40 hover:text-app-ink disabled:opacity-50"
          >
            Загрузить файл
          </button>
        )}
        {value && phase === "idle" && (
          <button
            type="button"
            onClick={() => onChange(null)}
            className="rounded-full px-3 py-2.5 text-sm font-bold text-app-soft hover:text-app-accent"
          >
            Удалить
          </button>
        )}
      </div>

      <p className="text-xs text-app-soft">
        До {MAX_SECONDS} секунд. {voice ? "Файл — mp3, m4a, ogg или webm." : "Файл — mp4, mov или webm, лучше квадратный."}
      </p>
      <input
        ref={fileRef}
        type="file"
        accept={voice ? "audio/*" : "video/mp4,video/quicktime,video/webm"}
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = "";
          if (file) void handleFile(file);
        }}
      />
      {error && <p className="text-sm font-semibold text-app-accent">{error}</p>}
    </div>
  );
}
