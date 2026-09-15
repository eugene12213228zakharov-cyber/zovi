import type { ComponentProps, ReactNode } from "react";

type ButtonProps = ComponentProps<"button">;

export function PrimaryButton({ className = "", type = "button", ...props }: ButtonProps) {
  return (
    <button
      type={type}
      {...props}
      className={`inline-flex min-h-14 select-none items-center justify-center gap-2 rounded-full bg-accent px-7 text-[17px] font-extrabold text-accent-ink shadow-[0_12px_28px_-12px_var(--accent)] transition-[transform,opacity,box-shadow] duration-200 active:scale-95 disabled:opacity-40 disabled:shadow-none ${className}`}
    />
  );
}

export function SoftButton({ className = "", type = "button", ...props }: ButtonProps) {
  return (
    <button
      type={type}
      {...props}
      className={`inline-flex min-h-14 select-none items-center justify-center gap-2 rounded-full bg-muted px-7 text-[17px] font-bold text-muted-ink transition-[transform,opacity] duration-200 active:scale-95 disabled:opacity-40 ${className}`}
    />
  );
}

export function ScreenCard({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <section
      className={`relative flex w-full flex-col items-center gap-5 rounded-[36px] bg-card/85 px-6 py-8 text-center shadow-[0_24px_60px_-34px_rgba(40,12,40,0.45)] backdrop-blur-md ${className}`}
    >
      {children}
    </section>
  );
}

export function ScreenTitle({ children }: { children: ReactNode }) {
  return <h1 className="font-display text-[26px] font-bold leading-[1.15] text-balance text-ink">{children}</h1>;
}

export function ScreenText({ children }: { children: ReactNode }) {
  return <p className="whitespace-pre-line text-[16px] leading-relaxed text-pretty text-ink-soft">{children}</p>;
}

export function SectionLabel({ children }: { children: ReactNode }) {
  return <div className="mb-2 text-xs font-extrabold uppercase tracking-wider text-ink-soft">{children}</div>;
}
