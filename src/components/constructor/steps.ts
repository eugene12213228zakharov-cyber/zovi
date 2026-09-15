import type { FlowStage } from "@/components/invite/InviteFlow";
import type { EditorStepId } from "@/lib/invite/validate";

export interface EditorStep {
  id: EditorStepId | "done";
  title: string;
  short: string;
  hint: string;
  /** Какой экран показать в превью на этом шаге. */
  stage: FlowStage;
}

export const STEPS: EditorStep[] = [
  {
    id: "who",
    title: "Кого зовём",
    short: "Кого",
    hint: "От этого зависят тексты — «сказала» или «сказал», «свободна» или «свободен». Всё можно поменять.",
    stage: "ask",
  },
  {
    id: "intro",
    title: "Как откроется",
    short: "Вход",
    hint: "Что увидит человек, когда откроет ссылку.",
    stage: "intro",
  },
  {
    id: "ask",
    title: "Главный вопрос",
    short: "Вопрос",
    hint: "Картинка, голосовое или кружок — и характер кнопки «Нет».",
    stage: "ask",
  },
  {
    id: "confirm",
    title: "Подтверждение",
    short: "«Да»",
    hint: "Экран сразу после «Да». Можно выключить.",
    stage: "confirm",
  },
  {
    id: "when",
    title: "Дата и время",
    short: "Дата",
    hint: "Получатель выбирает день и время — или ты назначаешь сам.",
    stage: "when",
  },
  {
    id: "choice",
    title: "Выбор",
    short: "Выбор",
    hint: "Что будете есть, смотреть или делать. Можно выключить.",
    stage: "choice",
  },
  {
    id: "final",
    title: "Финал",
    short: "Финал",
    hint: "Последний экран: подставь выбранные дату, время и вариант.",
    stage: "final",
  },
  {
    id: "done",
    title: "Готово",
    short: "Готово",
    hint: "Проверь, что всё на месте, и получи ссылку.",
    stage: "final",
  },
];
