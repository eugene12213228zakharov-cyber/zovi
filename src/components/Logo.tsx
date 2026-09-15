import Link from "next/link";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link href="/" className={`font-brand text-2xl font-bold tracking-tight text-app-ink ${className}`}>
      зови<span className="text-app-accent">♥</span>
    </Link>
  );
}
