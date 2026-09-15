"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { mediaUrl } from "@/lib/client/api";
import type { MediaRef } from "@/lib/invite/types";
import { PauseIcon, PlayIcon } from "./icons";

export function formatDuration(seconds: number): string {
  const total = Math.max(0, Math.round(seconds));
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`;
}

/** Псевдо-«волна» голосового: одинаковая на сервере и в браузере, зависит только от id. */
function waveform(seed: string, count: number): number[] {
  let hash = 0;
  for (const char of seed) hash = (Math.imul(hash, 31) + char.charCodeAt(0)) >>> 0;
  return Array.from({ length: count }, () => {
    hash = (Math.imul(hash, 1103515245) + 12345) >>> 0;
    return 25 + (hash % 75);
  });
}

/** Голосовое сообщение в стиле мессенджера. */
export function VoiceBubble({ media }: { media: MediaRef }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(media.durationSec);
  const bars = useMemo(() => waveform(media.id, 30), [media.id]);

  function toggle() {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) void audio.play().catch(() => undefined);
    else audio.pause();
  }

  const shown = progress > 0 ? duration * (1 - progress) : duration;

  return (
    <div className="flex w-full max-w-[300px] items-center gap-3 rounded-full bg-accent-soft py-2 pl-2 pr-4">
      <button
        type="button"
        onClick={toggle}
        aria-label={playing ? "Пауза" : "Слушать голосовое"}
        className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-accent text-accent-ink shadow-md transition active:scale-90"
      >
        {playing ? <PauseIcon /> : <PlayIcon className="ml-0.5 h-5 w-5" />}
      </button>
      <div className="flex h-8 flex-1 items-center gap-[3px]" aria-hidden>
        {bars.map((height, index) => (
          <span
            key={index}
            className={`w-[3px] rounded-full transition-colors ${index / bars.length < progress ? "bg-accent" : "bg-ink-soft/35"}`}
            style={{ height: `${height}%` }}
          />
        ))}
      </div>
      <span className="w-10 text-right text-sm font-bold tabular-nums text-ink-soft">{formatDuration(shown)}</span>
      <audio
        ref={audioRef}
        src={mediaUrl(media.id)}
        preload="metadata"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => {
          setPlaying(false);
          setProgress(0);
        }}
        onLoadedMetadata={(event) => {
          const value = event.currentTarget.duration;
          if (Number.isFinite(value) && value > 0) setDuration(value);
        }}
        onTimeUpdate={(event) => {
          const audio = event.currentTarget;
          // У записей из Chrome длительность бывает Infinity — тогда берём ту, что посчитали при записи.
          const total = Number.isFinite(audio.duration) && audio.duration > 0 ? audio.duration : duration;
          if (total > 0) setProgress(Math.min(1, audio.currentTime / total));
        }}
      />
    </div>
  );
}

/** Видеокружок: без звука крутится по кругу, по нажатию играет со звуком с начала. */
export function CirclePlayer({ media, size = 230 }: { media: MediaRef; size?: number }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);
  const [paused, setPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const radius = size / 2 - 4;
  const circumference = 2 * Math.PI * radius;

  // React не выставляет атрибут muted при первом рендере, а без него iPhone не запустит автоплей.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = true;
    void video.play().catch(() => undefined);
  }, [media.id]);

  function handleClick() {
    const video = videoRef.current;
    if (!video) return;
    if (muted) {
      video.muted = false;
      video.loop = false;
      video.currentTime = 0;
      setMuted(false);
      void video.play().catch(() => undefined);
      return;
    }
    if (video.paused) void video.play().catch(() => undefined);
    else video.pause();
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={muted ? "Послушать кружок" : paused ? "Продолжить" : "Пауза"}
      className="relative shrink-0 rounded-full shadow-[0_20px_40px_-20px_rgba(0,0,0,0.5)]"
      style={{ width: size, height: size }}
    >
      <video
        ref={videoRef}
        src={mediaUrl(media.id)}
        className="h-full w-full rounded-full object-cover"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        onPlay={() => setPaused(false)}
        onPause={() => setPaused(true)}
        onEnded={() => {
          const video = videoRef.current;
          if (!video) return;
          video.muted = true;
          video.loop = true;
          setMuted(true);
          setProgress(0);
          void video.play().catch(() => undefined);
        }}
        onTimeUpdate={(event) => {
          const video = event.currentTarget;
          const total = Number.isFinite(video.duration) && video.duration > 0 ? video.duration : media.durationSec;
          if (total > 0) setProgress(Math.min(1, video.currentTime / total));
        }}
      />
      <svg className="pointer-events-none absolute inset-0 -rotate-90" viewBox={`0 0 ${size} ${size}`} aria-hidden>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="var(--accent-soft)" strokeWidth="5" />
        {!muted && (
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="var(--accent)"
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - progress)}
          />
        )}
      </svg>
      {muted && (
        <span className="absolute bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-black/55 px-3 py-1 text-xs font-bold text-white">
          🔊 Нажми, чтобы послушать
        </span>
      )}
      {!muted && paused && (
        <span className="absolute inset-0 grid place-items-center">
          <span className="grid h-14 w-14 place-items-center rounded-full bg-black/45 text-white">
            <PlayIcon className="ml-1 h-6 w-6" />
          </span>
        </span>
      )}
    </button>
  );
}
