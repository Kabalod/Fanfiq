import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Fanfiq - Поиск фанфиков",
  description: "Универсальная поисковая система для фанфиков с множества платформ",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ru">
      <body>
        {children}
      </body>
    </html>
  )
}