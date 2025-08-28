'use client'

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Work } from "@/lib/api/schemas"
import { Calendar, User, MessageCircle, Heart, BookOpen, AlertTriangle } from "lucide-react"
import Link from "next/link"

interface WorkCardProps {
  work: Work
}

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

export function WorkCard({ work }: WorkCardProps) {
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

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1">
            <CardTitle className="text-lg">
              <Link 
                href={`/works/${work.id}`}
                className="hover:text-primary transition-colors"
              >
                {work.title}
              </Link>
            </CardTitle>
            <CardDescription className="mt-2">
              <div className="flex items-center gap-2 text-sm">
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
            </CardDescription>
          </div>
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
        </div>
      </CardHeader>
      
      <CardContent>
        {work.summary && (
          <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
            {work.summary}
          </p>
        )}
        
        <div className="flex flex-wrap gap-1 mb-4">
          {work.fandoms.slice(0, 3).map((fandom) => (
            <Badge key={fandom} variant="secondary" className="text-xs">
              {fandom}
            </Badge>
          ))}
          {work.fandoms.length > 3 && (
            <Badge variant="secondary" className="text-xs">
              +{work.fandoms.length - 3}
            </Badge>
          )}
        </div>
        
        {work.warnings.length > 0 && (
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            <div className="flex flex-wrap gap-1">
              {work.warnings.map((warning) => (
                <Badge key={warning} variant="outline" className="text-xs border-yellow-600 text-yellow-600">
                  {warning}
                </Badge>
              ))}
            </div>
          </div>
        )}
        
        <div className="flex flex-wrap gap-1">
          {work.tags.slice(0, 5).map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
          {work.tags.length > 5 && (
            <Badge variant="outline" className="text-xs">
              +{work.tags.length - 5}
            </Badge>
          )}
        </div>
      </CardContent>
      
      <CardFooter>
        <div className="flex justify-between items-center w-full text-sm text-muted-foreground">
          <div className="flex items-center gap-4">
            {work.category && (
              <span>{categoryLabels[work.category]}</span>
            )}
            {work.chapter_count && (
              <div className="flex items-center gap-1">
                <BookOpen className="h-3 w-3" />
                <span>{work.chapter_count} глав</span>
              </div>
            )}
            {work.word_count && (
              <span>{formatWordCount(work.word_count)} слов</span>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            {work.kudos_count !== undefined && (
              <div className="flex items-center gap-1">
                <Heart className="h-3 w-3" />
                <span>{work.kudos_count}</span>
              </div>
            )}
            {work.comments_count !== undefined && (
              <div className="flex items-center gap-1">
                <MessageCircle className="h-3 w-3" />
                <span>{work.comments_count}</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>{formatDate(work.updated_at)}</span>
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  )
}
