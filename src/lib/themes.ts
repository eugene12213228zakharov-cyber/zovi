import type { ThemeId } from "./invite/types";

export interface ThemeMeta {
  id: ThemeId;
  name: string;
  description: string;
  /** Фон, акцент и второй цвет фона — для карточки выбора темы. */
  swatches: [string, string, string];
}

export const THEMES: ThemeMeta[] = [
  { id: "zefir", name: "Зефир", description: "Нежно-розовый и игривый", swatches: ["#FFF1F5", "#FF3D7F", "#F3E6FF"] },
  { id: "vecher", name: "Вечер", description: "Тёмный, как ужин при свечах", swatches: ["#1B1024", "#FF7A59", "#33172F"] },
  { id: "myata", name: "Мята", description: "Свежая мята и коралл", swatches: ["#EAFBF4", "#FF6B57", "#FFF4E6"] },
  { id: "bumaga", name: "Письмо", description: "Тёплая бумага и чернила", swatches: ["#F4EDE1", "#C8413A", "#EADCC6"] },
];

export const themeClass = (id: ThemeId) => `theme-${id}`;
