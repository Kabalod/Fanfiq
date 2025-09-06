'use client'

import React from 'react'
import { Badge } from '@/components/ui/badge'

export type Author = { name: string }
export type WorkLike = {
  id: string
  title: string
  authors?: Author[]
  tags?: string[]
  updated_at?: string | null
}

export function ReaderHeader({ work }: { work: WorkLike }) {
  const authors = work.authors?.map(a => a.name).filter(Boolean).join(', ') || '—'
  return (
    <header className="mb-6 space-y-2">
      <h1 className="text-2xl font-bold tracking-tight">{work.title}</h1>
      <div className="text-sm text-muted-foreground">{authors}</div>
      {work.tags && work.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-2">
          {work.tags.map((t) => (
            <Badge key={t} variant="secondary">{t}</Badge>
          ))}
        </div>
      )}
    </header>
  )}
