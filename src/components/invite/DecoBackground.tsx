const HEARTS = [
  { left: 4, size: 16, delay: 0, duration: 13 },
  { left: 14, size: 26, delay: 5, duration: 16 },
  { left: 27, size: 14, delay: 2.5, duration: 11 },
  { left: 41, size: 22, delay: 8, duration: 15 },
  { left: 55, size: 12, delay: 1, duration: 12 },
  { left: 66, size: 28, delay: 6.5, duration: 18 },
  { left: 78, size: 16, delay: 3.5, duration: 13 },
  { left: 89, size: 22, delay: 9, duration: 16 },
  { left: 95, size: 12, delay: 4.5, duration: 10 },
];

/** Фон экрана получателя: мягкий градиент темы и всплывающие сердечки. */
export function DecoBackground() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden"
      style={{ background: "radial-gradient(120% 80% at 50% 0%, var(--bg-2) 0%, var(--bg) 62%)" }}
    >
      {HEARTS.map((heart, index) => (
        <span
          key={index}
          className="deco-heart absolute -bottom-10 text-deco"
          style={{
            left: `${heart.left}%`,
            fontSize: heart.size,
            opacity: 0,
            animation: `zovi-rise ${heart.duration}s linear ${heart.delay}s infinite`,
          }}
        >
          ♥
        </span>
      ))}
    </div>
  );
}
