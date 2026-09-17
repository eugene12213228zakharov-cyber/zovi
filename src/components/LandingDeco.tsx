// Фон главной: полупрозрачные конверты и карточки-приглашения, которые медленно плывут вверх.

const ITEMS = [
  { left: 5, size: 54, delay: 0, duration: 26, tilt: -12, kind: "envelope" },
  { left: 17, size: 38, delay: 7, duration: 32, tilt: 9, kind: "card" },
  { left: 29, size: 64, delay: 3, duration: 29, tilt: 6, kind: "card" },
  { left: 43, size: 42, delay: 12, duration: 35, tilt: -8, kind: "envelope" },
  { left: 57, size: 58, delay: 5, duration: 30, tilt: 14, kind: "card" },
  { left: 69, size: 36, delay: 16, duration: 27, tilt: -6, kind: "envelope" },
  { left: 81, size: 60, delay: 9, duration: 34, tilt: 10, kind: "envelope" },
  { left: 92, size: 40, delay: 2, duration: 31, tilt: -14, kind: "card" },
] as const;

function Envelope({ size }: { size: number }) {
  return (
    <svg width={size} height={size * 0.72} viewBox="0 0 100 72" fill="none" aria-hidden>
      <rect x="1" y="1" width="98" height="70" rx="10" fill="var(--app-card)" stroke="var(--app-accent)" strokeWidth="2" />
      <path d="M4 9l46 33L96 9" stroke="var(--app-accent)" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function Card({ size }: { size: number }) {
  return (
    <svg width={size} height={size * 1.3} viewBox="0 0 100 130" fill="none" aria-hidden>
      <rect x="1" y="1" width="98" height="128" rx="12" fill="var(--app-card)" stroke="var(--app-violet)" strokeWidth="2" />
      <circle cx="50" cy="40" r="16" fill="var(--app-violet)" opacity="0.25" />
      <rect x="22" y="70" width="56" height="7" rx="3.5" fill="var(--app-violet)" opacity="0.3" />
      <rect x="32" y="87" width="36" height="7" rx="3.5" fill="var(--app-violet)" opacity="0.2" />
      <rect x="28" y="104" width="44" height="12" rx="6" fill="var(--app-accent)" opacity="0.35" />
    </svg>
  );
}

export function LandingDeco() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {ITEMS.map((item, index) => (
        <span
          key={index}
          className="absolute -bottom-40 opacity-0 blur-[0.4px]"
          style={{
            left: `${item.left}%`,
            ["--tilt" as string]: `${item.tilt}deg`,
            animation: `yavka-drift ${item.duration}s linear ${item.delay}s infinite`,
          }}
        >
          {item.kind === "envelope" ? <Envelope size={item.size} /> : <Card size={item.size} />}
        </span>
      ))}
    </div>
  );
}
