'use client'

import { useState } from 'react'
import { SearchBar } from '@/components/search-bar'
import { WorkCard } from '@/components/work-card'
import { useSearchWorks } from '@/lib/api/client'
import { SearchFilters } from '@/lib/api/schemas'
import { Button } from '@/components/ui/button'
import { DevTools } from '@/components/dev-tools'
import { Loader2, AlertCircle } from 'lucide-react'

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState<SearchFilters>({
    page: 1,
    page_size: 20,
  })

  const { data, isLoading, error, refetch } = useSearchWorks(filters, {
    enabled: false, // Не делаем запрос автоматически
  })

  const handleSearch = () => {
    setFilters(prev => ({
      ...prev,
      query: searchQuery,
      page: 1,
    }))
    refetch()
  }

  const handlePageChange = (newPage: number) => {
    setFilters(prev => ({
      ...prev,
      page: newPage,
    }))
    refetch()
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold mb-6">Fanfiq - Поиск фанфиков</h1>
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            onSearch={handleSearch}
          />
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-3 text-muted-foreground">Поиск...</span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="flex flex-col items-center py-20">
            <AlertCircle className="h-12 w-12 text-destructive mb-4" />
            <h2 className="text-xl font-semibold mb-2">Произошла ошибка</h2>
            <p className="text-muted-foreground mb-4">
              {error.message || 'Не удалось выполнить поиск'}
            </p>
            <Button onClick={() => refetch()}>Попробовать снова</Button>
          </div>
        )}

        {/* Results */}
        {data && !isLoading && (
          <>
            {/* Results Header */}
            <div className="mb-6">
              <p className="text-muted-foreground">
                Найдено {data.total} результатов
              </p>
            </div>

            {/* Results Grid */}
            {data.works.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
                {data.works.map((work) => (
                  <WorkCard key={work.id} work={work} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <p className="text-xl text-muted-foreground mb-2">
                  Ничего не найдено
                </p>
                <p className="text-sm text-muted-foreground">
                  Попробуйте изменить параметры поиска
                </p>
              </div>
            )}

            {/* Pagination */}
            {data.total_pages > 1 && (
              <div className="flex justify-center gap-2 mt-8">
                <Button
                  variant="outline"
                  onClick={() => handlePageChange(data.page - 1)}
                  disabled={data.page === 1}
                >
                  Предыдущая
                </Button>
                <div className="flex items-center px-4">
                  Страница {data.page} из {data.total_pages}
                </div>
                <Button
                  variant="outline"
                  onClick={() => handlePageChange(data.page + 1)}
                  disabled={data.page === data.total_pages}
                >
                  Следующая
                </Button>
              </div>
            )}
          </>
        )}

        {/* Initial State */}
        {!data && !isLoading && !error && (
          <div className="text-center py-20">
            <h2 className="text-2xl font-semibold mb-4">
              Начните поиск
            </h2>
            <p className="text-muted-foreground">
              Введите название, автора или теги для поиска фанфиков
            </p>
          </div>
        )}
      </main>
      
      <DevTools />
    </div>
  )
}