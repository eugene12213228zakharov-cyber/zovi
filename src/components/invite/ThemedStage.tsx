import type { ReactNode } from "react";
import type { ThemeId } from "@/lib/invite/types";
import { themeClass } from "@/lib/themes";
import { DecoBackground } from "./DecoBackground";

interface ThemedStageProps {
  theme: ThemeId;
  /** page — страница получателя на весь экран; frame — внутри телефона в превью. */
  layout?: "page" | "frame";
  children: ReactNode;
}

export function ThemedStage({ theme, layout = "page", children }: ThemedStageProps) {
  if (layout === "frame") {
    return (
      <div className={`${themeClass(theme)} relative isolate h-full w-full overflow-hidden text-ink`}>
        <DecoBackground />
        <div className="no-scrollbar relative z-10 flex h-full w-full flex-col overflow-y-auto px-4 pb-8 pt-12">
          <div className="mx-auto my-auto flex w-full max-w-[420px] flex-col items-center">{children}</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${themeClass(theme)} relative isolate min-h-dvh w-full text-ink`}>
      <DecoBackground />
      <main className="relative z-10 mx-auto flex min-h-dvh w-full max-w-[440px] flex-col items-center justify-center px-5 py-10">
        {children}
      </main>
    </div>
  );
}
