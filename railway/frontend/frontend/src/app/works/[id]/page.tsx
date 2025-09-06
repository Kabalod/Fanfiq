'use client'

import { useParams } from 'next/navigation'
import { useWork, useWorkChapters } from '@/lib/api/client'
import { useSettingsStore } from '@/store/settings'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, AlertCircle, User, Calendar, Heart, MessageCircle } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { sanitizeHtml } from '@/lib/sanitize'
import { ReaderHeader } from '@/components/reader/ReaderHeader'
import { ChapterNav } from '@/components/reader/ChapterNav'
import { ReaderSettings, ReaderTheme } from '@/components/reader/ReaderSettings'
import { track } from '@/lib/analytics'

const ratingColors: Record<string, string> = {
  'G': 'bg-green-100 text-green-800',
  'PG-13': 'bg-yellow-100 text-yellow-800',
  'R': 'bg-orange-100 text-orange-800',
  'NC-17': 'bg-red-100 text-red-800',
  'NC-21': 'bg-purple-100 text-purple-800',
}

const categoryLabels: Record<string, string> = {
  'gen': 'Джен',
  'het': 'Гет',
  'slash': 'Слэш',
  'femslash': 'Фемслэш',
  'mixed': 'Смешанная',
  'other': 'Другое',
  'article': 'Статья',
}

const statusLabels: Record<string, string> = {
  'completed': 'Завершён',
  'in_progress': 'В процессе',
  'frozen': 'Заморожен',
}

export default function WorkPage() {
  const params = useParams()
  const workId = params.id as string

  const { reader: readerSettings, setReaderTheme, setFontSize } = useSettingsStore()
  const [currentChapter, setCurrentChapter] = useState(0)

  const { data: work, isLoading: workLoading, error: workError } = useWork(workId, {
    onSuccess: (data) => {
      track({ type: 'work_opened', workId: data.id })
    }
  })
  const { data: chapters, isLoading: chaptersLoading, error: chaptersError } = useWorkChapters(workId)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const formatWordCount = (count?: number) => {
    if (!count) return '0'
    if (count < 1000) return count.toString()
    return `${(count / 1000).toFixed(1)}k`
  }

  const handleChapterChange = (newChapterIndex: number) => {
    setCurrentChapter(newChapterIndex)
    track({ type: 'chapter_navigate', workId, to: newChapterIndex + 1 })
  }

  const handleThemeChange = (newTheme: ReaderTheme) => {
    setTheme(newTheme)
    track({ type: 'theme_changed', theme: newTheme })
  }

  if (workLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span>Загрузка работы...</span>
        </div>
      </div>
    )
  }

  if (workError || !work) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
        <h1 className="text-2xl font-semibold mb-2">Ошибка загрузки</h1>
        <p className="text-muted-foreground mb-4">
          {workError?.message || 'Не удалось загрузить работу'}
        </p>
        <Button asChild>
          <Link href="/">Вернуться к поиску</Link>
        </Button>
      </div>
    )
  }

  const currentChapterData = chapters?.[currentChapter]
  const themeClasses = {
    light: 'bg-background text-foreground',
    dark: 'bg-gray-900 text-gray-100',
    sepia: 'bg-yellow-50 text-amber-900',
  }
  const proseThemeClasses = {
    dark: 'prose-invert',
    sepia: 'prose-p:text-amber-900 prose-headings:text-amber-800',
    light: '',
  }

  return (
    <div className={`min-h-screen ${themeClasses[readerSettings.theme]}`} style={{ fontSize: `${readerSettings.fontSize}px` }}>
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Button variant="ghost" asChild>
            <Link href="/" className="flex items-center gap-2">
              Назад к поиску
            </Link>
          </Button>
          <ReaderSettings 
            theme={readerSettings.theme} 
            fontSize={readerSettings.fontSize}
            onThemeChange={setReaderTheme} 
            onFontSizeChange={setFontSize}
          />
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {work && <ReaderHeader work={work} />}

          {chaptersLoading ? (
            <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin" /></div>
          ) : chaptersError ? (
            <div className="text-center py-20 text-destructive">Не удалось загрузить главы</div>
          ) : chapters && chapters.length > 0 ? (
            <>
              <div className="mb-6">
                <ChapterNav
                  currentChapter={currentChapter}
                  totalChapters={chapters.length}
                  onChapterChange={handleChapterChange}
                />
              </div>

              {currentChapterData && (
                <article className={`prose prose-lg max-w-none leading-relaxed ${proseThemeClasses[readerSettings.theme]}`}
                  dangerouslySetInnerHTML={{ __html: sanitizeHtml(currentChapterData.content) }}
                />
              )}
            </>
          ) : (
            <div className="text-center py-20">Главы не найдены</div>
          )}
        </div>
      </div>
    </div>
  )
}
