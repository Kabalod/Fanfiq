'use client'
import { ReactNode } from 'react'

export function SiteHeader({ children }: { children: ReactNode }) {
  return (
    <header className="w-full border-b bg-background/60 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto w-full max-w-6xl px-4 py-3 flex items-center justify-between">
        <div className="text-lg font-semibold">Fanfiq</div>
        <div className="flex items-center gap-2">{children}</div>
      </div>
    </header>
  )
}


