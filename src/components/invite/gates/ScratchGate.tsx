"use client";

import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent, type ReactNode } from "react";

interface ScratchGateProps {
  /** true — слой ещё лежит поверх экрана; false — просто показываем содержимое. */
  active: boolean;
  color: string;
  message: string;
  onDone: () => void;
  children: ReactNode;
}

const BRUSH = 46;
const REVEAL_RATIO = 0.5;

/** «Стереть, как лотерейку»: цветной слой поверх экрана вопроса, стирается пальцем. */
export function ScratchGate({ active, color, message, onDone, children }: ScratchGateProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [revealing, setRevealing] = useState(false);
  const stroke = useRef({ drawing: false, last: null as { x: number; y: number } | null, moves: 0, done: false });
  const onDoneRef = useRef(onDone);

  useEffect(() => {
    onDoneRef.current = onDone;
  });

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!active || !wrap || !canvas) return;
    stroke.current = { drawing: false, last: null, moves: 0, done: false };
    setRevealing(false);

    const paint = () => {
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      // Размеры по раскладке, а не по экрану: в превью телефон уменьшен через transform.
      const ratio = window.devicePixelRatio || 1;
      const width = wrap.clientWidth;
      const height = wrap.clientHeight;
      canvas.width = Math.max(1, Math.round(width * ratio));
      canvas.height = Math.max(1, Math.round(height * ratio));
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      ctx.globalCompositeOperation = "source-over";

      const gradient = ctx.createLinearGradient(0, 0, width, height);
      gradient.addColorStop(0, color);
      gradient.addColorStop(1, shade(color, -0.22));
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "rgba(255,255,255,0.18)";
      ctx.font = "20px sans-serif";
      for (let row = 0, y = 24; y < height; row++, y += 44) {
        for (let x = row % 2 ? 46 : 24; x < width; x += 44) ctx.fillText("♥", x, y);
      }

      const fontSize = Math.max(18, Math.min(28, width / 13));
      ctx.fillStyle = "#ffffff";
      ctx.font = `800 ${fontSize}px ${getComputedStyle(wrap).fontFamily}`;
      drawLines(ctx, message, width / 2, height / 2 - 18, width - 56, fontSize * 1.25);
      ctx.font = "46px sans-serif";
      ctx.fillText("👆", width / 2, height / 2 + 58);
    };

    paint();
    // Перерисовываем, пока человек не начал стирать: картинки под слоем могут догрузиться и сменить высоту.
    const observer = new ResizeObserver(() => {
      if (!stroke.current.done && stroke.current.moves === 0) paint();
    });
    observer.observe(wrap);
    return () => observer.disconnect();
  }, [active, color, message]);

  /** Точка касания в координатах раскладки — с поправкой на уменьшенный телефон в превью. */
  function pointFrom(event: ReactPointerEvent<HTMLCanvasElement>) {
    const canvas = event.currentTarget;
    const rect = canvas.getBoundingClientRect();
    const scaleX = rect.width > 0 ? canvas.clientWidth / rect.width : 1;
    const scaleY = rect.height > 0 ? canvas.clientHeight / rect.height : 1;
    return { x: (event.clientX - rect.left) * scaleX, y: (event.clientY - rect.top) * scaleY };
  }

  function scratch(point: { x: number; y: number }) {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const from = stroke.current.last ?? { x: point.x - 0.1, y: point.y };
    ctx.globalCompositeOperation = "destination-out";
    ctx.lineWidth = BRUSH;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(point.x, point.y);
    ctx.stroke();
    stroke.current.last = point;
  }

  function checkProgress() {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx || stroke.current.done) return;
    const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
    let cleared = 0;
    let total = 0;
    for (let index = 3; index < data.length; index += 4 * 29) {
      total++;
      if (data[index] === 0) cleared++;
    }
    if (total > 0 && cleared / total >= REVEAL_RATIO) {
      stroke.current.done = true;
      setRevealing(true);
      window.setTimeout(() => onDoneRef.current(), 480);
    }
  }

  return (
    <div ref={wrapRef} className="relative w-full">
      <div aria-hidden={active && !revealing}>{children}</div>
      {active && (
        <canvas
          ref={canvasRef}
          role="img"
          aria-label={message}
          className={`absolute inset-0 z-20 h-full w-full touch-none rounded-[36px] transition-opacity duration-500 ${
            revealing ? "pointer-events-none opacity-0" : "opacity-100"
          }`}
          onPointerDown={(event) => {
            event.currentTarget.setPointerCapture(event.pointerId);
            stroke.current.drawing = true;
            stroke.current.last = null;
            scratch(pointFrom(event));
          }}
          onPointerMove={(event) => {
            if (!stroke.current.drawing) return;
            scratch(pointFrom(event));
            stroke.current.moves += 1;
            if (stroke.current.moves % 20 === 0) checkProgress();
          }}
          onPointerUp={() => {
            stroke.current.drawing = false;
            stroke.current.last = null;
            checkProgress();
          }}
          onPointerCancel={() => {
            stroke.current.drawing = false;
            stroke.current.last = null;
          }}
        />
      )}
    </div>
  );
}

/** Затемнить (amount < 0) или осветлить цвет #RRGGBB. */
function shade(hex: string, amount: number): string {
  const value = Number.parseInt(hex.slice(1), 16);
  const channel = (shift: number) => {
    const current = (value >> shift) & 255;
    const next = amount < 0 ? current * (1 + amount) : current + (255 - current) * amount;
    return Math.round(Math.min(255, Math.max(0, next)));
  };
  return `rgb(${channel(16)}, ${channel(8)}, ${channel(0)})`;
}

function drawLines(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
) {
  const lines: string[] = [];
  let line = "";
  for (const word of text.split(/\s+/).filter(Boolean)) {
    const candidate = line ? `${line} ${word}` : word;
    if (line && ctx.measureText(candidate).width > maxWidth) {
      lines.push(line);
      line = word;
    } else {
      line = candidate;
    }
  }
  if (line) lines.push(line);
  const top = y - ((lines.length - 1) * lineHeight) / 2;
  lines.forEach((current, index) => ctx.fillText(current, x, top + index * lineHeight));
}
