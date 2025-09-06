'use client'

import { memo } from 'react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'

export type Author = { name: string }
export type Work = {
  id: string
  title: string
  authors?: Author[]
  tags?: string[]
  word_count?: number | null
  kudos_count?: number | null
  updated_at?: string | null
}

export const WorkCard = memo(function WorkCard({ work }: { work: Work }) {
  const authors = work.authors?.map(a => a.name).filter(Boolean).join(', ') || '—'
  return (
    <article className="rounded-lg border bg-card text-card-foreground p-4 hover:shadow-sm transition">
      <header className="mb-2">
        <h3 className="text-lg font-semibold leading-snug">
          <Link href={`/works/${work.id}`} className="hover:underline">
            {work.title}
          </Link>
        </h3>
        <div className="text-sm text-muted-foreground">{authors}</div>
      </header>
      {work.tags && work.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {work.tags.map((t) => (
            <Badge key={t} variant="secondary">{t}</Badge>
          ))}
        </div>
      )}
      <footer className="flex flex-wrap gap-4 text-xs text-muted-foreground">
        <span>Слов: {work.word_count ?? 0}</span>
        <span>Лайков: {work.kudos_count ?? 0}</span>
        {work.updated_at && <span>Обновлено: {new Date(work.updated_at).toLocaleDateString('ru-RU')}</span>}
      </footer>
    </article>
  )
})
