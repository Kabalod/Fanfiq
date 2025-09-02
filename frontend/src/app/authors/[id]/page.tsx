'use client'

import { useParams } from 'next/navigation'
import { useAuthor } from '@/lib/api/client'
import { ResultsList } from '@/components/results/ResultsList'
import { Loader2, AlertCircle } from 'lucide-react'

export default function AuthorPage() {
  const params = useParams()
  const authorId = params.id as string

  const { data: author, isLoading, error } = useAuthor(authorId)

  if (isLoading) {
    return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin" /></div>
  }

  if (error || !author) {
    return (
      <div className="text-center py-20">
        <AlertCircle className="mx-auto h-12 w-12 text-destructive" />
        <p className="mt-4">Не удалось загрузить автора.</p>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold">{author.name}</h1>
      {author.url && <a href={author.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Профиль на сайте</a>}
      
      <h2 className="text-2xl font-bold mt-8 mb-4">Работы автора</h2>
      <ResultsList works={author.works} />
    </div>
  )
}
