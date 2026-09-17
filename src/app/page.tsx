import Link from "next/link";
import { LandingDemo } from "@/components/invite/LandingDemo";
import { LandingDeco } from "@/components/LandingDeco";
import { Logo } from "@/components/Logo";
import { MyInvites } from "@/components/MyInvites";

const NAV = [
  { href: "#plan", label: "План операции" },
  { href: "#materials", label: "Секретные материалы" },
  { href: "/demo", label: "Кейсы" },
];

const PLAN = [
  {
    emoji: "📂",
    title: "Составь досье",
    text: "Выбери повод и оформление, впиши, кого зовёшь, когда и где. Пара минут — и приглашение готово.",
  },
  {
    emoji: "🎙",
    title: "Добавь улики",
    text: "Голосовое на виниловой пластинке, видеокружок или фото. И варианты на выбор: что поесть, куда пойти.",
  },
  {
    emoji: "🔗",
    title: "Отправь явку",
    text: "Реши, как гость откроет приглашение, и отправь ссылку. Ответ придёт на твою секретную страницу.",
  },
];

const MATERIALS = [
  {
    emoji: "🪄",
    title: "Интрига с первой секунды",
    text: "Ссылка — не просто текст. Гость стирает слой пальцем, вводит ваш код или распечатывает конверт.",
  },
  {
    emoji: "👥",
    title: "Одна ссылка на всю компанию",
    text: "День рождения или посиделки: каждый гость называет себя и отвечает за себя. Ты видишь, кто идёт.",
  },
  {
    emoji: "🏃",
    title: "«Нет» с характером",
    text: "Кнопка уменьшается, убегает от пальца или отвечает поцелуем. А можно оставить честный отказ.",
  },
  {
    emoji: "📊",
    title: "Ответ вживую",
    text: "Секретная страница обновляется сама: кто открыл, кто согласился, что выбрал и когда ответил.",
  },
  {
    emoji: "🎫",
    title: "Билет на событие",
    text: "После согласия гость получает именной билет с датой и выбором — и кладёт его в календарь.",
  },
  {
    emoji: "🔒",
    title: "Ничего лишнего",
    text: "Ни регистрации, ни номера телефона. Приглашение живёт по ссылке, которую знаете только вы.",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-dvh overflow-x-hidden">
      <LandingDeco />

      <header className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-5">
        <Logo />
        <nav className="hidden items-center gap-7 md:flex">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href} className="text-sm font-bold text-app-soft transition hover:text-app-ink">
              {item.label}
            </Link>
          ))}
        </nav>
        <Link
          href="/create"
          className="rounded-xl bg-app-ink px-5 py-2.5 text-sm font-extrabold text-white transition hover:opacity-90 active:scale-95"
        >
          Оформить явку
        </Link>
      </header>

      <section className="mx-auto grid max-w-6xl items-center gap-12 px-5 pb-16 pt-4 lg:grid-cols-[1.1fr_1fr] lg:pt-8">
        <div className="flex flex-col items-start gap-6">
          <span className="rounded-full bg-app-accent-soft px-4 py-1.5 text-sm font-extrabold text-app-accent-strong">
            Свидания · дни рождения · вечеринки
          </span>
          <h1 className="font-brand text-[32px] font-bold leading-[1.1] tracking-tight text-balance sm:text-[40px]">
            Встречи назначены.<br />
            <span className="text-app-accent">Явка обязательна.</span>
          </h1>
          <p className="max-w-xl text-lg leading-relaxed text-app-soft">
            Не сайт-открытка, а досье на событие: кого зовёшь, когда, что будете делать. Гость откроет ссылку, пройдёт
            интригу и подтвердит — а ты увидишь ответ в ту же секунду.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/create"
              className="btn-primary px-7 py-4 text-lg"
            >
              Оформить явку
            </Link>
            <Link
              href="/demo"
              className="btn-secondary px-7 py-4 text-lg"
            >
              Посмотреть пример
            </Link>
          </div>
          <p className="font-hand text-xl text-app-soft">а в примере попробуй нажать «Нет» 😉</p>
        </div>
        <LandingDemo />
      </section>

      <MyInvites />

      <section id="plan" className="mx-auto max-w-6xl scroll-mt-8 px-5 py-12">
        <h2 className="font-brand text-2xl font-bold sm:text-[32px]">План операции</h2>
        <p className="mt-2 text-app-soft">Три шага. Ничего не нужно скачивать и регистрироваться тоже не нужно.</p>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {PLAN.map((step, index) => (
            <div key={step.title} className="card card-hover p-6">
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

      <section id="materials" className="mx-auto max-w-6xl scroll-mt-8 px-5 pb-20 pt-4">
        <h2 className="font-brand text-2xl font-bold sm:text-[32px]">Секретные материалы</h2>
        <p className="mt-2 text-app-soft">То, из-за чего приглашение открывают до конца, а не закрывают на первом экране.</p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {MATERIALS.map((feature) => (
            <div key={feature.title} className="card card-hover flex gap-4 p-5">
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

        <div className="mt-12 flex flex-col items-center gap-5 rounded-2xl bg-app-ink px-6 py-12 text-center text-white">
          <h2 className="font-brand text-2xl font-bold text-balance sm:text-[32px]">Осталось назначить встречу</h2>
          <p className="font-hand text-2xl text-white/70">явка обязательна</p>
          <Link
            href="/create"
            className="btn-primary px-7 py-4 text-lg"
          >
            Оформить явку
          </Link>
        </div>
      </section>

      <footer className="mx-auto max-w-6xl px-5 pb-10 text-center text-sm text-app-soft">
        © {new Date().getFullYear()} Явка. Встречи назначены — явка обязательна.
      </footer>
    </div>
  );
}
