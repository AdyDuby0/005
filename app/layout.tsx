import type { Metadata } from "next";
import "./globals.css";
import { GameProvider } from "@/lib/store";

export const metadata: Metadata = {
  title: "Realms of Valor — RPG Adventure",
  description:
    "A turn-based fantasy RPG: build your hero, fight monsters, complete quests, and rise to legend.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Cinzel:wght@500;700;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <GameProvider>{children}</GameProvider>
      </body>
    </html>
  );
}
