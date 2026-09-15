import type { Gender } from "@/lib/invite/types";
import { ScreenCard, ScreenText, ScreenTitle, SoftButton } from "../ui";

export function DeclinedScreen({ gender, onBack }: { gender: Gender; onBack: () => void }) {
  return (
    <ScreenCard>
      <span aria-hidden className="animate-float text-[84px] leading-none">
        🥲
      </span>
      <ScreenTitle>Жаль…</ScreenTitle>
      <ScreenText>Ответ передан. Но если что — кнопка «Да» всё ещё ждёт.</ScreenText>
      <SoftButton className="w-full" onClick={onBack}>
        {gender === "female" ? "Я передумала" : "Я передумал"}
      </SoftButton>
    </ScreenCard>
  );
}
