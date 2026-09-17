import type { FlowStage } from "@/components/invite/InviteFlow";
import type { EditorStepId } from "@/lib/invite/validate";

export interface EditorStep {
  id: "start" | "dossier" | "send";
  title: string;
  short: string;
  hint: string;
  /** Подсказка для режима «зову компанию», если обычная там не подходит. */
  partyHint?: string;
  /** Какой экран показать в превью на этом шаге. */
  stage: FlowStage;
  /** Разделы проверки, которые правятся на этом шаге: по ним ищем, куда вести за ошибкой. */
  covers: EditorStepId[];
}

/**
 * Три шага вместо восьми: быстрый путь по умолчанию, всё остальное — в «деталях».
 * Разделы внутри шага те же самые, просто сгруппированы.
 */
export const STEPS: EditorStep[] = [
  {
    id: "start",
    title: "Повод и стиль",
    short: "Повод",
    hint: "Кого зовёшь и как это будет выглядеть. Полминуты.",
    partyHint: "Одна ссылка на всех: каждый гость назовёт себя, а ты увидишь, кто идёт.",
    stage: "ask",
    covers: ["who"],
  },
  {
    id: "dossier",
    title: "Досье",
    short: "Досье",
    hint: "Главное послание и когда встречаетесь. Остальное — в «деталях», если захочешь.",
    stage: "ask",
    covers: ["ask", "when", "confirm", "choice", "final"],
  },
  {
    id: "send",
    title: "Интрига и отправка",
    short: "Отправка",
    hint: "Как гость откроет приглашение — и ссылка, которую можно отправлять.",
    stage: "intro",
    covers: ["intro"],
  },
];
