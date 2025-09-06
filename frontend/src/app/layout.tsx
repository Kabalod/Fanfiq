import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Providers } from "@/lib/providers"
import { GlobalHeader } from "@/components/layout/GlobalHeader"

const inter = Inter({
  subsets: ["latin", "cyrillic"],
})

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
    <html lang="ru" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          <GlobalHeader />
          {children}
        </Providers>
      </body>
    </html>
  )
}