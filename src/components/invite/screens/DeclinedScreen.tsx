import type { Gender } from "@/lib/invite/types";
import { ScreenCard, ScreenText, ScreenTitle, SoftButton } from "../ui";

export function DeclinedScreen({ gender, party = false, onBack }: { gender: Gender; party?: boolean; onBack: () => void }) {
  return (
    <ScreenCard>
      <span aria-hidden className="animate-float text-[84px] leading-none">
        🥲
      </span>
      <ScreenTitle>Жаль…</ScreenTitle>
      <ScreenText>Ответ передан. Но если что — кнопка «Да» всё ещё ждёт.</ScreenText>
      <SoftButton className="w-full" onClick={onBack}>
        {/* В компании гости разного пола, поэтому там обходимся без «передумала». */}
        {party ? "Вернуться к вопросу" : gender === "female" ? "Я передумала" : "Я передумал"}
      </SoftButton>
    </ScreenCard>
  );
}
