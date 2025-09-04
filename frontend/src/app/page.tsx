'use client'

export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'

import { useEffect, useState, useRef } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useInView } from 'react-intersection-observer'
import { SearchBar } from '@/components/search-bar'
import dynamic from 'next/dynamic'
import { ResultsList } from '@/components/results/ResultsList'
import { useSearchWorksInfinite } from '@/lib/api/client'
import { SearchFilters } from '@/lib/api/schemas'
import { Button } from '@/components/ui/button'
import { DevTools } from '@/components/dev-tools'
import { AlertCircle, Filter } from 'lucide-react'
import { filtersToQuery, queryToFilters } from '@/lib/url-state'
import { track } from '@/lib/analytics'
import { useHotkeys } from '@/hooks/use-hotkeys'

const FilterPanel = dynamic(() => import('@/components/filter-panel').then(mod => mod.FilterPanel), {
  ssr: false,
  loading: () => <p>Загрузка фильтров...</p>
})

export default function HomePage() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [filters, setFilters] = useState<SearchFilters>(() =>
    queryToFilters(searchParams)
  )
  const [searchQuery, setSearchQuery] = useState(filters.query || '')
  const [showFilters, setShowFilters] = useState(Object.keys(filters).length > 2) // show if more than page/page_size

  const { ref, inView } = useInView()

  const {
    data,
    error,
    isFetching,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
  } = useSearchWorksInfinite(filters, {
    keepPreviousData: true,
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

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage()
    }
  }, [inView, hasNextPage, fetchNextPage])

  const handleSearch = () => {
    const newFilters = {
      ...filters,
      query: searchQuery,
      page: 1,
    }
    setFilters(newFilters)
  }

  const renderContent = () => {
    if (isFetching && !data) {
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
        const allWorks = data.pages.flatMap(page => page.works)
        return (
            <>
                <div className="mb-6">
                    <p className="text-muted-foreground">
                        Показано {allWorks.length} из {data.pages[0].total} результатов
                    </p>
                </div>
                <ResultsList works={allWorks} />
                <div ref={ref} className="h-10" />
                {isFetchingNextPage && <div className="text-center">Загрузка...</div>}
                {!hasNextPage && allWorks.length > 0 && <div className="text-center">Конец списка</div>}
            </>
        )
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