import Link from "next/link";
import { LandingDemo } from "@/components/invite/LandingDemo";
import { Logo } from "@/components/Logo";
import { MyInvites } from "@/components/MyInvites";

const STEPS = [
  {
    emoji: "🎨",
    title: "Собери",
    text: "Семь коротких шагов: вопрос, дата, выбор, финал. Всё сразу видно на телефоне в превью.",
  },
  {
    emoji: "🔗",
    title: "Отправь ссылку",
    text: "В Telegram, WhatsApp или ВКонтакте — приглашение откроется в браузере телефона.",
  },
  {
    emoji: "💘",
    title: "Узнай ответ",
    text: "На твоей личной странице появятся дата, время и выбор — в момент ответа.",
  },
];

const FEATURES = [
  { emoji: "🔒", title: "Секретный вход", text: "PIN-код, конверт, слой «сотри меня» или таймер до нужной минуты." },
  { emoji: "🏃", title: "«Нет» с характером", text: "Кнопка уменьшается, убегает от пальца или отвечает поцелуем." },
  { emoji: "🎙️", title: "Голосовое и кружок", text: "Запиши прямо в браузере — как в мессенджере." },
  { emoji: "📅", title: "Дата и выбор", text: "Получатель выбирает день, время и что вы будете есть, смотреть или делать." },
  { emoji: "🌙", title: "Четыре настроения", text: "Зефир, Вечер, Мята и Письмо — под любой характер." },
  { emoji: "👀", title: "Ответ вживую", text: "Видно, когда открыли и сколько раз рука тянулась к «Нет»." },
];

export default function HomePage() {
  return (
    <div className="min-h-dvh overflow-x-hidden">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
        <Logo />
        <Link
          href="/create"
          className="rounded-full bg-app-ink px-5 py-2.5 text-sm font-extrabold text-white transition hover:opacity-90"
        >
          Создать
        </Link>
      </header>

      <section className="mx-auto grid max-w-6xl items-center gap-12 px-5 pb-16 pt-4 lg:grid-cols-[1.1fr_1fr] lg:pt-8">
        <div className="flex flex-col items-start gap-6">
          <span className="rounded-full bg-app-accent-soft px-4 py-1.5 text-sm font-extrabold text-app-accent-strong">
            Приглашение на свидание по ссылке
          </span>
          <h1 className="font-brand text-[38px] font-bold leading-[1.05] tracking-tight text-balance sm:text-[54px]">
            Позови на свидание так, чтобы <span className="text-app-accent">не смогли отказать</span>
          </h1>
          <p className="max-w-xl text-lg leading-relaxed text-app-soft">
            Собери интерактивное приглашение за пару минут: хитрая кнопка «Нет», выбор даты и места, голосовое или
            кружок. Отправь ссылку — и смотри ответ в реальном времени.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/create"
              className="rounded-full bg-app-accent px-7 py-4 text-lg font-extrabold text-app-accent-ink shadow-[0_14px_30px_-14px_var(--app-accent)] transition hover:bg-app-accent-strong active:scale-95"
            >
              Создать приглашение 💌
            </Link>
            <Link
              href="/demo"
              className="rounded-full border-2 border-app-line bg-app-card px-7 py-4 text-lg font-extrabold transition hover:border-app-accent/40 active:scale-95"
            >
              Открыть пример
            </Link>
          </div>
          <p className="text-sm text-app-soft">Попробуй нажать «Нет» в превью 😉</p>
        </div>
        <LandingDemo />
      </section>

      <MyInvites />

      <section className="mx-auto max-w-6xl px-5 py-12">
        <h2 className="font-brand text-3xl font-bold">Как это работает</h2>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {STEPS.map((step, index) => (
            <div key={step.title} className="rounded-[28px] bg-app-card p-6 shadow-[0_18px_40px_-30px_rgba(36,23,42,0.35)]">
              <div className="flex items-center gap-3">
                <span className="grid h-9 w-9 place-items-center rounded-full bg-app-accent-soft font-brand text-sm font-bold text-app-accent-strong">
                  {index + 1}
                </span>
                <span aria-hidden className="text-2xl">
                  {step.emoji}
                </span>
              </div>
              <h3 className="mt-4 text-xl font-extrabold">{step.title}</h3>
              <p className="mt-2 leading-relaxed text-app-soft">{step.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-20 pt-4">
        <h2 className="font-brand text-3xl font-bold">Что внутри</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => (
            <div key={feature.title} className="flex gap-4 rounded-[28px] border border-app-line bg-app-card p-5">
              <span aria-hidden className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-app-accent-soft text-2xl">
                {feature.emoji}
              </span>
              <div>
                <h3 className="text-lg font-extrabold">{feature.title}</h3>
                <p className="mt-1 leading-relaxed text-app-soft">{feature.text}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center gap-5 rounded-[36px] bg-app-ink px-6 py-12 text-center text-white">
          <h2 className="font-brand text-3xl font-bold text-balance">Осталось только нажать «Да»</h2>
          <Link
            href="/create"
            className="rounded-full bg-app-accent px-7 py-4 text-lg font-extrabold text-app-accent-ink transition hover:bg-app-accent-strong active:scale-95"
          >
            Создать приглашение 💌
          </Link>
        </div>
      </section>
    </div>
  );
}
