'use client'

import { useParams } from 'next/navigation'
import { useWork, useWorkChapters } from '@/lib/api/client'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, AlertCircle, ChevronLeft, ChevronRight, BookOpen, User, Calendar, Heart, MessageCircle } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import DOMPurify from 'dompurify'

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

  const [currentChapter, setCurrentChapter] = useState(0)
  const [theme, setTheme] = useState<'light' | 'dark' | 'sepia'>('light')

  const { data: work, isLoading: workLoading, error: workError } = useWork(workId)
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

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900 text-white' : theme === 'sepia' ? 'bg-yellow-50 text-gray-900' : 'bg-background'}`}>
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" asChild>
              <Link href="/" className="flex items-center gap-2">
                <ChevronLeft className="h-4 w-4" />
                Назад к поиску
              </Link>
            </Button>

            <div className="flex items-center gap-2">
              <Button
                variant={theme === 'light' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTheme('light')}
              >
                День
              </Button>
              <Button
                variant={theme === 'dark' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTheme('dark')}
              >
                Ночь
              </Button>
              <Button
                variant={theme === 'sepia' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTheme('sepia')}
              >
                Сепия
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar with work info */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">{work.title}</CardTitle>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <User className="h-3 w-3" />
                  {work.authors.map((author, idx) => (
                    <span key={author.id}>
                      {idx > 0 && ', '}
                      <Link
                        href={`/authors/${author.id}`}
                        className="hover:text-primary transition-colors"
                      >
                        {author.name}
                      </Link>
                    </span>
                  ))}
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Rating and Status */}
                <div className="flex gap-2">
                  {work.rating && (
                    <Badge className={ratingColors[work.rating] || ''} variant="outline">
                      {work.rating}
                    </Badge>
                  )}
                  {work.status && (
                    <Badge variant={work.status === 'completed' ? 'default' : 'secondary'}>
                      {statusLabels[work.status]}
                    </Badge>
                  )}
                </div>

                {/* Stats */}
                <div className="space-y-2 text-sm">
                  {work.category && (
                    <div><strong>Категория:</strong> {categoryLabels[work.category]}</div>
                  )}
                  {work.chapter_count && (
                    <div><strong>Глав:</strong> {work.chapter_count}</div>
                  )}
                  {work.word_count && (
                    <div><strong>Слов:</strong> {formatWordCount(work.word_count)}</div>
                  )}
                  {work.kudos_count !== undefined && (
                    <div className="flex items-center gap-1">
                      <Heart className="h-3 w-3" />
                      <strong>Лайков:</strong> {work.kudos_count}
                    </div>
                  )}
                  {work.comments_count !== undefined && (
                    <div className="flex items-center gap-1">
                      <MessageCircle className="h-3 w-3" />
                      <strong>Комментариев:</strong> {work.comments_count}
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <strong>Обновлено:</strong> {formatDate(work.updated_at)}
                  </div>
                </div>

                {/* Tags */}
                {work.fandoms.length > 0 && (
                  <div>
                    <strong className="text-sm">Фандомы:</strong>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {work.fandoms.map((fandom) => (
                        <Badge key={fandom} variant="secondary" className="text-xs">
                          {fandom}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {work.tags.length > 0 && (
                  <div>
                    <strong className="text-sm">Теги:</strong>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {work.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Warnings */}
                {work.warnings.length > 0 && (
                  <div>
                    <strong className="text-sm">Предупреждения:</strong>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {work.warnings.map((warning) => (
                        <Badge key={warning} variant="outline" className="text-xs border-yellow-600 text-yellow-600">
                          {warning}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Summary */}
                {work.summary && (
                  <div>
                    <strong className="text-sm">Описание:</strong>
                    <p className="text-sm text-muted-foreground mt-1">{work.summary}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Reader content */}
          <div className="lg:col-span-3">
            {chaptersLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-3">Загрузка глав...</span>
              </div>
            ) : chaptersError ? (
              <div className="text-center py-20">
                <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
                <p className="text-muted-foreground">
                  {chaptersError.message || 'Не удалось загрузить главы'}
                </p>
              </div>
            ) : !chapters || chapters.length === 0 ? (
              <div className="text-center py-20">
                <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Главы не найдены</p>
              </div>
            ) : (
              <>
                {/* Chapter navigation */}
                <div className="flex items-center justify-between mb-6">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentChapter(Math.max(0, currentChapter - 1))}
                    disabled={currentChapter === 0}
                  >
                    <ChevronLeft className="h-4 w-4 mr-2" />
                    Предыдущая
                  </Button>

                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4" />
                    <span className="text-sm font-medium">
                      Глава {currentChapter + 1} из {chapters.length}
                    </span>
                  </div>

                  <Button
                    variant="outline"
                    onClick={() => setCurrentChapter(Math.min(chapters.length - 1, currentChapter + 1))}
                    disabled={currentChapter === chapters.length - 1}
                  >
                    Следующая
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>

                {/* Chapter content */}
                {currentChapterData && (
                  <Card className={`p-8 ${theme === 'dark' ? 'bg-gray-800' : theme === 'sepia' ? 'bg-yellow-100' : ''}`}>
                    <div className="max-w-4xl mx-auto">
                      {currentChapterData.title && (
                        <h2 className="text-2xl font-bold mb-6 text-center">
                          {currentChapterData.title}
                        </h2>
                      )}

                      <div
                        className={`prose prose-lg max-w-none leading-relaxed ${
                          theme === 'dark'
                            ? 'prose-invert prose-p:text-gray-200 prose-headings:text-white'
                            : theme === 'sepia'
                            ? 'prose-p:text-amber-900 prose-headings:text-amber-800'
                            : 'prose-p:text-gray-700 prose-headings:text-gray-900'
                        }`}
                        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(currentChapterData.content) }}
                      />
                    </div>
                  </Card>
                )}

                {/* Chapter list */}
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle>Оглавление</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-2 max-h-96 overflow-y-auto">
                      {chapters.map((chapter, index) => (
                        <Button
                          key={chapter.id}
                          variant={index === currentChapter ? "default" : "ghost"}
                          className="justify-start h-auto py-3"
                          onClick={() => setCurrentChapter(index)}
                        >
                          <div className="text-left">
                            <div className="font-medium">
                              Глава {chapter.number}
                            </div>
                            {chapter.title && (
                              <div className="text-sm text-muted-foreground truncate">
                                {chapter.title}
                              </div>
                            )}
                            {chapter.word_count && (
                              <div className="text-xs text-muted-foreground">
                                {chapter.word_count} слов
                              </div>
                            )}
                          </div>
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
