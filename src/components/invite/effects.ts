// «Взрыв сердечек» и конфетти. Частицы рисуются прямо в DOM поверх страницы,
// без React-состояния: живут секунду-две и сами удаляются.

const HEARTS = ["❤️", "💖", "💕", "💗", "✨", "💘"];

function canAnimate(): boolean {
  return typeof window !== "undefined" && !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function createLayer(): HTMLDivElement {
  const layer = document.createElement("div");
  layer.setAttribute("aria-hidden", "true");
  layer.style.cssText = "position:fixed;inset:0;pointer-events:none;z-index:9999;overflow:hidden";
  document.body.appendChild(layer);
  return layer;
}

function particle(emoji: string, x: number, y: number, size: number): HTMLSpanElement {
  const element = document.createElement("span");
  element.textContent = emoji;
  element.style.cssText = `position:absolute;left:${x}px;top:${y}px;font-size:${size}px;line-height:1;margin:-0.5em 0 0 -0.5em;will-change:transform,opacity`;
  return element;
}

export function burstFrom(
  element: Element | null,
  options: { count?: number; emojis?: string[]; spread?: number } = {},
): void {
  if (!element || !canAnimate()) return;
  const rect = element.getBoundingClientRect();
  burstAt(rect.left + rect.width / 2, rect.top + rect.height / 2, options);
}

export function burstAt(
  x: number,
  y: number,
  { count = 26, emojis = HEARTS, spread = 170 }: { count?: number; emojis?: string[]; spread?: number } = {},
): void {
  if (!canAnimate()) return;
  const layer = createLayer();
  let alive = count;

  for (let index = 0; index < count; index++) {
    const element = particle(emojis[index % emojis.length], x, y, 16 + Math.random() * 22);
    layer.appendChild(element);

    const angle = Math.random() * Math.PI * 2;
    const distance = spread * (0.45 + Math.random() * 0.75);
    const dx = Math.cos(angle) * distance;
    const dy = Math.sin(angle) * distance - 50;
    const animation = element.animate(
      [
        { transform: "translate(0, 0) scale(0.3)", opacity: 1 },
        { transform: `translate(${dx}px, ${dy}px) scale(1) rotate(${(Math.random() - 0.5) * 90}deg)`, opacity: 1, offset: 0.7 },
        { transform: `translate(${dx * 1.1}px, ${dy + 90}px) scale(0.9) rotate(${(Math.random() - 0.5) * 140}deg)`, opacity: 0 },
      ],
      { duration: 900 + Math.random() * 600, easing: "cubic-bezier(0.2, 0.8, 0.3, 1)" },
    );
    animation.onfinish = () => {
      element.remove();
      if (--alive === 0) layer.remove();
    };
  }
}

export function confettiRain({ count = 60, emojis = ["🎉", "💖", "✨", "🎊", "💘", "🌸"] } = {}): void {
  if (!canAnimate()) return;
  const layer = createLayer();
  const width = window.innerWidth;
  const height = window.innerHeight;
  let alive = count;

  for (let index = 0; index < count; index++) {
    const element = particle(emojis[index % emojis.length], Math.random() * width, -30, 14 + Math.random() * 18);
    layer.appendChild(element);

    const drift = (Math.random() - 0.5) * 160;
    const animation = element.animate(
      [
        { transform: "translate(0, 0) rotate(0deg)", opacity: 1 },
        { transform: `translate(${drift}px, ${height + 80}px) rotate(${(Math.random() - 0.5) * 720}deg)`, opacity: 0.9 },
      ],
      {
        duration: 2200 + Math.random() * 1800,
        delay: Math.random() * 900,
        easing: "cubic-bezier(0.25, 0.6, 0.4, 1)",
        fill: "backwards",
      },
    );
    animation.onfinish = () => {
      element.remove();
      if (--alive === 0) layer.remove();
    };
  }
}
