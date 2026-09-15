// Стикеры — эмодзи на мягкой подложке. На телефоне получателя они рисуются
// системным шрифтом, поэтому своих картинок для набора не нужно.

import type { ChoiceCategory } from "./types";

export interface Sticker {
  id: string;
  emoji: string;
  label: string;
}

export const SCREEN_STICKERS: Sticker[] = [
  { id: "pleading", emoji: "🥺", label: "Пожалуйста" },
  { id: "love-letter", emoji: "💌", label: "Письмо" },
  { id: "rose", emoji: "🌹", label: "Роза" },
  { id: "bouquet", emoji: "💐", label: "Букет" },
  { id: "teddy", emoji: "🧸", label: "Мишка" },
  { id: "shy", emoji: "🙈", label: "Стесняюсь" },
  { id: "smitten", emoji: "🥰", label: "Нежность" },
  { id: "heart-eyes", emoji: "😍", label: "Восторг" },
  { id: "cupid", emoji: "💘", label: "Стрела" },
  { id: "sparkle-heart", emoji: "💖", label: "Сердце" },
  { id: "kiss", emoji: "😘", label: "Поцелуй" },
  { id: "cat", emoji: "😻", label: "Котик" },
  { id: "party", emoji: "🥳", label: "Праздник" },
  { id: "confetti", emoji: "🎉", label: "Ура" },
  { id: "calendar", emoji: "📅", label: "Календарь" },
  { id: "clock", emoji: "⏰", label: "Будильник" },
  { id: "hourglass", emoji: "⏳", label: "Жду" },
  { id: "moon", emoji: "🌙", label: "Вечер" },
  { id: "car", emoji: "🚗", label: "Заеду" },
  { id: "sparkles", emoji: "✨", label: "Магия" },
];

export interface ChoiceCategoryPreset {
  label: string;
  title: string;
  subtitle: string;
  /** Строка для финального текста, {choice} подставится выбором получателя. */
  finalLine: string;
  options: Sticker[];
}

export const CHOICE_CATEGORIES: Record<ChoiceCategory, ChoiceCategoryPreset> = {
  food: {
    label: "Блюда",
    title: "Что будем есть?",
    subtitle: "Выбери, что тебе по душе",
    finalLine: "На ужин — {choice} 😋",
    options: [
      { id: "food-pizza", emoji: "🍕", label: "Пицца" },
      { id: "food-sushi", emoji: "🍣", label: "Суши" },
      { id: "food-burger", emoji: "🍔", label: "Бургер" },
      { id: "food-pasta", emoji: "🍝", label: "Паста" },
      { id: "food-ramen", emoji: "🍜", label: "Рамен" },
      { id: "food-shawarma", emoji: "🌯", label: "Шаурма" },
      { id: "food-steak", emoji: "🥩", label: "Стейк" },
      { id: "food-khinkali", emoji: "🥟", label: "Хинкали" },
      { id: "food-dessert", emoji: "🍰", label: "Десерты" },
    ],
  },
  movie: {
    label: "Кино",
    title: "Что посмотрим?",
    subtitle: "Выбери жанр под настроение",
    finalLine: "Смотрим: {choice} 🍿",
    options: [
      { id: "movie-comedy", emoji: "😂", label: "Комедия" },
      { id: "movie-romance", emoji: "💕", label: "Мелодрама" },
      { id: "movie-horror", emoji: "👻", label: "Ужастик" },
      { id: "movie-scifi", emoji: "🚀", label: "Фантастика" },
      { id: "movie-action", emoji: "💥", label: "Боевик" },
      { id: "movie-cartoon", emoji: "🦄", label: "Мультфильм" },
      { id: "movie-detective", emoji: "🔍", label: "Детектив" },
    ],
  },
  activity: {
    label: "Занятия",
    title: "Чем займёмся?",
    subtitle: "Можно выбрать то, что давно хотелось",
    finalLine: "В планах: {choice} ✨",
    options: [
      { id: "act-walk", emoji: "👟", label: "Прогулка" },
      { id: "act-cinema", emoji: "🎬", label: "Кино" },
      { id: "act-skating", emoji: "⛸️", label: "Каток" },
      { id: "act-bowling", emoji: "🎳", label: "Боулинг" },
      { id: "act-karting", emoji: "🏎️", label: "Картинг" },
      { id: "act-quest", emoji: "🗝️", label: "Квест" },
      { id: "act-karaoke", emoji: "🎤", label: "Караоке" },
      { id: "act-museum", emoji: "🖼️", label: "Музей" },
      { id: "act-concert", emoji: "🎸", label: "Концерт" },
    ],
  },
  drink: {
    label: "Напитки",
    title: "Что будем пить?",
    subtitle: "Выбери свой напиток",
    finalLine: "Для настроения — {choice} 🥂",
    options: [
      { id: "drink-coffee", emoji: "☕", label: "Кофе" },
      { id: "drink-tea", emoji: "🍵", label: "Чай" },
      { id: "drink-cocoa", emoji: "🍫", label: "Какао" },
      { id: "drink-lemonade", emoji: "🍋", label: "Лимонад" },
      { id: "drink-cocktail", emoji: "🍹", label: "Коктейль" },
      { id: "drink-wine", emoji: "🍷", label: "Вино" },
      { id: "drink-smoothie", emoji: "🥤", label: "Смузи" },
    ],
  },
  place: {
    label: "Места",
    title: "Куда пойдём?",
    subtitle: "Выбери место для свидания",
    finalLine: "Идём сюда: {choice} 📍",
    options: [
      { id: "place-restaurant", emoji: "🍽️", label: "Ресторан" },
      { id: "place-cafe", emoji: "🥐", label: "Кофейня" },
      { id: "place-park", emoji: "🌳", label: "Парк" },
      { id: "place-embankment", emoji: "🌊", label: "Набережная" },
      { id: "place-roof", emoji: "🌆", label: "Крыша" },
      { id: "place-home", emoji: "🏠", label: "Дома" },
      { id: "place-bar", emoji: "🍸", label: "Бар" },
    ],
  },
};

export const CHOICE_CATEGORY_ORDER: ChoiceCategory[] = ["food", "movie", "activity", "drink", "place"];

const byId = new Map<string, Sticker>();
for (const s of SCREEN_STICKERS) byId.set(s.id, s);
for (const category of CHOICE_CATEGORY_ORDER) {
  for (const s of CHOICE_CATEGORIES[category].options) byId.set(s.id, s);
}

/** Все стикеры разом — для выбора картинки у варианта. */
export const ALL_STICKERS: Sticker[] = [...byId.values()];

export function findSticker(id: string): Sticker | undefined {
  return byId.get(id);
}
