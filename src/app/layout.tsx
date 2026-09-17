import type { Metadata, Viewport } from "next";
import { Caveat, Golos_Text, JetBrains_Mono, Oswald, Playfair_Display, Unbounded } from "next/font/google";
import "./globals.css";

// Шрифты сайта: заголовки — Playfair, текст — Golos, рукописные акценты и логотип — Caveat.
const golos = Golos_Text({ subsets: ["latin", "cyrillic"], variable: "--font-golos", display: "swap" });
const playfair = Playfair_Display({ subsets: ["latin", "cyrillic"], variable: "--font-playfair", display: "swap" });
const caveat = Caveat({ subsets: ["latin", "cyrillic"], variable: "--font-caveat", display: "swap" });
// Шрифты тем приглашения.
const unbounded = Unbounded({ subsets: ["latin", "cyrillic"], variable: "--font-unbounded", display: "swap" });
const oswald = Oswald({ subsets: ["latin", "cyrillic"], variable: "--font-oswald", display: "swap" });
const ticketMono = JetBrains_Mono({ subsets: ["latin", "cyrillic"], variable: "--font-ticket-mono", display: "swap" });

export const metadata: Metadata = {
  title: { default: "Явка — приглашения, на которые приходят", template: "%s · Явка" },
  description: "Собери интерактивное приглашение на свидание, день рождения или вечеринку и отправь его ссылкой.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#FFF5F7",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="ru"
      className={`${golos.variable} ${playfair.variable} ${caveat.variable} ${unbounded.variable} ${oswald.variable} ${ticketMono.variable}`}
    >
      <body className="font-body antialiased">{children}</body>
    </html>
  );
}
