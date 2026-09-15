import type { ConfirmScreen as ConfirmScreenConfig } from "@/lib/invite/types";
import { StickerImage } from "../StickerImage";
import { PrimaryButton, ScreenCard, ScreenText, ScreenTitle } from "../ui";

export function ConfirmScreen({ confirm, onNext }: { confirm: ConfirmScreenConfig; onNext: () => void }) {
  return (
    <ScreenCard>
      <StickerImage image={confirm.image} size="xl" float />
      <div className="flex flex-col gap-2">
        <ScreenTitle>{confirm.title}</ScreenTitle>
        {confirm.subtitle && <ScreenText>{confirm.subtitle}</ScreenText>}
      </div>
      <PrimaryButton className="w-full" onClick={onNext}>
        {confirm.buttonText}
      </PrimaryButton>
    </ScreenCard>
  );
}
