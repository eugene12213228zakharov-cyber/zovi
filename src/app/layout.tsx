import type { Metadata, Viewport } from "next";
import { Nunito, Playfair_Display, Unbounded } from "next/font/google";
import "./globals.css";

const nunito = Nunito({ subsets: ["latin", "cyrillic"], variable: "--font-nunito", display: "swap" });
const unbounded = Unbounded({ subsets: ["latin", "cyrillic"], variable: "--font-unbounded", display: "swap" });
const playfair = Playfair_Display({ subsets: ["latin", "cyrillic"], variable: "--font-playfair", display: "swap" });

export const metadata: Metadata = {
  title: { default: "Зови — приглашение на свидание", template: "%s · Зови" },
  description: "Собери милое приглашение на свидание и отправь его ссылкой.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#fbf6f3",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru" className={`${nunito.variable} ${unbounded.variable} ${playfair.variable}`}>
      <body className="font-body antialiased">{children}</body>
    </html>
  );
}
