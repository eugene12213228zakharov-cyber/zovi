import Link from "next/link";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link
      href="/"
      className={`font-hand text-[34px] font-bold leading-none tracking-tight text-app-ink ${className}`}
      aria-label="Явка — на главную"
    >
      Явка<span className="text-app-accent">.</span>
    </Link>
  );
}
