'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { SearchBar } from '@/components/search-bar'
import { FilterPanel } from '@/components/filter-panel'
import { ResultsList } from '@/components/results/ResultsList'
import { useSearchWorks } from '@/lib/api/client'
import { SearchFilters } from '@/lib/api/schemas'
import { Button } from '@/components/ui/button'
import { DevTools } from '@/components/dev-tools'
import { AlertCircle, Filter } from 'lucide-react'
import { filtersToQuery, queryToFilters } from '@/lib/url-state'
import { track } from '@/lib/analytics'
import { useHotkeys } from '@/hooks/use-hotkeys'

export default function HomePage() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [filters, setFilters] = useState<SearchFilters>(() =>
    queryToFilters(searchParams)
  )
  const [searchQuery, setSearchQuery] = useState(filters.query || '')
  const [showFilters, setShowFilters] = useState(Object.keys(filters).length > 2) // show if more than page/page_size

  const { data, isLoading, error, isFetching } = useSearchWorks(filters, {
    keepPreviousData: true,
    onSuccess: () => {
      track({ type: 'search_submitted', query: filters.query, filters })
    }
  })

  useHotkeys({
    '/': (e) => {
      e.preventDefault()
      document.querySelector<HTMLInputElement>('input[type="search"]')?.focus()
    },
    'f': (e) => {
      e.preventDefault()
      setShowFilters(prev => !prev)
    }
  })

  useEffect(() => {
    const newQueryString = filtersToQuery(filters).toString()
    // We replace instead of push to avoid polluting history on every filter change
    router.replace(`${pathname}?${newQueryString}`)
  }, [filters, pathname, router])

  const handleSearch = () => {
    const newFilters = {
      ...filters,
      query: searchQuery,
      page: 1,
    }
    setFilters(newFilters)
  }

  const handlePageChange = (newPage: number) => {
    setFilters(prev => ({
      ...prev,
      page: newPage,
    }))
  }

  const renderContent = () => {
    if (isLoading) {
      return <ResultsList works={[]} isLoading />
    }

    if (error) {
      return (
        <div className="flex flex-col items-center py-20">
          <AlertCircle className="h-12 w-12 text-destructive mb-4" />
          <h2 className="text-xl font-semibold mb-2">Произошла ошибка</h2>
          <p className="text-muted-foreground mb-4">
            {error.message || 'Не удалось выполнить поиск'}
          </p>
          <Button onClick={handleSearch}>Попробовать снова</Button>
        </div>
      )
    }

    if (data) {
      if (data.works.length > 0) {
        return (
          <>
            <div className="mb-6">
              <p className="text-muted-foreground">
                Найдено {data.total} результатов
              </p>
            </div>
            <ResultsList works={data.works} />
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
        )
      } else {
        return (
          <div className="text-center py-20">
            <p className="text-xl text-muted-foreground mb-2">
              Ничего не найдено
            </p>
            <p className="text-sm text-muted-foreground">
              Попробуйте изменить параметры поиска
            </p>
          </div>
        )
      }
    }

    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-semibold mb-4">
          Начните поиск
        </h2>
        <p className="text-muted-foreground">
          Введите название, автора или теги для поиска фанфиков
        </p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold mb-6">Fanfiq - Поиск фанфиков</h1>

          {/* Search and Filters Toggle */}
          <div className="space-y-4">
            <div className="flex gap-2">
              <div className="flex-1">
                <SearchBar
                  value={searchQuery}
                  onChange={setSearchQuery}
                  onSearch={handleSearch}
                />
              </div>
              <Button
                variant={showFilters ? "default" : "outline"}
                onClick={() => setShowFilters(!showFilters)}
                className="shrink-0"
              >
                <Filter className="h-4 w-4 mr-2" />
                Фильтры
              </Button>
            </div>

            {/* Filter Panel */}
            {showFilters && (
              <div className="max-w-4xl">
                <FilterPanel
                  filters={filters}
                  onFiltersChange={setFilters}
                  onApplyFilters={handleSearch} // Re-using handleSearch as it resets page
                />
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {renderContent()}
      </main>
      
      <DevTools />
    </div>
  )
}