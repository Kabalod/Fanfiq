# FSE — TanStack Query + Virtualized Results (react-virtuoso) + Dev Guide

This pack wires data‑layer + virtualization into your existing FSE components/stories and finishes with a concise developer workflow guide.

---

## 0) Install
```bash
pnpm add @tanstack/react-query
pnpm add -D @tanstack/eslint-plugin-query
pnpm add react-virtuoso
```

---

## 1) Query Client Provider

### 1.1 `src/lib/query/client.ts`
```ts
import { QueryClient } from '@tanstack/react-query'

export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        refetchOnWindowFocus: false,
        retry: 1,
        gcTime: 5 * 60_000,
      },
    },
  })
}
```

### 1.2 Decorator for Storybook — `src/stories/decorators/withQuery.tsx`
```tsx
import * as React from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { createQueryClient } from '@/lib/query/client'

export const withQuery = (Story: any) => {
  const [client] = React.useState(() => createQueryClient())
  return (
    <QueryClientProvider client={client}>
      <Story />
    </QueryClientProvider>
  )
}
```

> In `.storybook/preview.tsx` add `withQuery` to `decorators` (after MSW/Theme).

```tsx
// .storybook/preview.tsx (snippet)
import { withQuery } from '../src/stories/decorators/withQuery'
export default {
  decorators: [ThemeDecorator, mswDecorator, withQuery],
  // ...existing parameters
}
```

---

## 2) Query hooks for Search API

### 2.1 Keep schema (from your pack) and add hooks — `src/lib/fse/queryHooks.ts`
```ts
import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import type { SearchFilters, SearchResponse, Work } from './apiSchema'
import { SearchResponseSchema } from './apiSchema'

async function postSearch(payload: any, signal?: AbortSignal): Promise<SearchResponse> {
  const res = await fetch('/api/v1/works/search', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload), signal,
  })
  if (!res.ok) throw new Error('Search failed')
  const data = await res.json()
  return SearchResponseSchema.parse(data)
}

export function useSearchWorks(filters: SearchFilters, deps: any[] = []) {
  return useQuery({
    queryKey: ['search', filters, ...deps],
    queryFn: ({ signal }) => postSearch({ ...filters, page: filters.page ?? 1, page_size: filters.page_size ?? 20 }, signal),
    placeholderData: (prev) => prev, // keepPreviousData
  })
}

export function useInfiniteSearchWorks(filters: Omit<SearchFilters, 'page'>) {
  return useInfiniteQuery<{ results: Work[]; current_page: number; total_pages: number }>({
    queryKey: ['search-infinite', filters],
    initialPageParam: 1,
    queryFn: async ({ pageParam, signal }) => postSearch({ ...filters, page: pageParam, page_size: 30 }, signal),
    getNextPageParam: (last) => (last.current_page < last.total_pages ? last.current_page + 1 : undefined),
  })
}
```

---

## 3) Virtualized Results List (infinite scroll)

### 3.1 Component — `src/components/fse/ResultsListVirtualized.tsx`
```tsx
'use client'
import * as React from 'react'
import { Virtuoso } from 'react-virtuoso'
import { WorkCard } from './WorkCard'
import { WorkCardSkeleton } from './Skeletons'
import { EmptyState } from './EmptyState'
import type { Work } from '@/lib/fse/apiSchema'

export function ResultsListVirtualized({
  pages,
  loading,
  endReached,
}: {
  pages: { results: Work[] }[]
  loading?: boolean
  endReached?: () => void
}) {
  const items = React.useMemo(() => pages.flatMap((p) => p.results), [pages])
  if (loading && !items.length) {
    return <div className="space-y-4">{Array.from({ length: 10 }).map((_, i) => <WorkCardSkeleton key={i} />)}</div>
  }
  if (!loading && items.length === 0) return <EmptyState />

  return (
    <Virtuoso
      style={{ height: '70vh' }}
      totalCount={items.length}
      itemContent={(index) => <div className="py-2"><WorkCard work={items[index]} /></div>}
      endReached={endReached}
      overscan={600}
    />
  )
}
```

---

## 4) Virtualized Results Story (MSW paged)

### 4.1 Mocked paged API — `mocks/handlersPaged.ts`
```ts
import { http, HttpResponse } from 'msw'

function makeItem(i: number) {
  return {
    id: 'w' + i,
    title: `Работа #${i}`,
    author_name: 'Автор ' + (i % 20),
    summary: 'Короткое описание…',
    language: 'ru',
    fandoms: ['Гарри Поттер'],
    tags: ['Драма','Приключения','AU'].slice(0, 1 + (i % 3)),
    rating: 'PG-13',
    status: i % 3 === 0 ? 'Completed' : 'In Progress',
    word_count: 10_000 + (i % 5) * 5_000,
    likes_count: 100 + (i % 50),
    comments_count: 20 + (i % 10),
    updated_at: '2024-05-01',
  }
}

export const pagedHandlers = [
  http.post('/api/v1/works/search', async ({ request }) => {
    const body = await request.json() as any
    const page = Number(body.page || 1)
    const pageSize = Number(body.page_size || 30)
    const total = 300
    const totalPages = Math.ceil(total / pageSize)
    const start = (page - 1) * pageSize
    const end = Math.min(start + pageSize, total)
    const results = Array.from({ length: end - start }).map((_, idx) => makeItem(start + idx + 1))
    return HttpResponse.json({ current_page: page, total_pages: totalPages, results })
  }),
]
```

### 4.2 Story — `src/stories/fse/ResultsPage.virtualized.stories.tsx`
```tsx
import type { Meta, StoryObj } from '@storybook/react'
import { useMemo } from 'react'
import { useInfiniteSearchWorks } from '@/lib/fse/queryHooks'
import { ResultsListVirtualized } from '@/components/fse/ResultsListVirtualized'

const meta: Meta = { title: 'FSE/ResultsPage (Virtualized)' }
export default meta

export const Virtualized: StoryObj = {
  render: () => {
    const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } = useInfiniteSearchWorks({})
    const pages = useMemo(() => data?.pages ?? [], [data])
    return (
      <div className="space-y-6">
        <ResultsListVirtualized
          pages={pages}
          loading={status === 'pending' || isFetchingNextPage}
          endReached={() => hasNextPage && fetchNextPage()}
        />
      </div>
    )
  },
  parameters: { msw: { handlers: async () => (await import('../../../mocks/handlersPaged')).pagedHandlers } },
}
```

---

## 5) Optional: Query Devtools (storybook-only)
```bash
pnpm add @tanstack/react-query-devtools
```
```tsx
// src/stories/decorators/withQuery.tsx (append)
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
// ...inside provider
  return (
    <QueryClientProvider client={client}>
      <Story />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
```

---

## 6) Developer Workflow — How to use effectively

1) **Story‑first**: каждую фичу начинаем со stories (успех/пусто/ошибка/загрузка). Подключаем MSW‑хэндлеры, чтобы не зависеть от бэкенда.
2) **Data‑layer contracts**: все запросы типизируем Zod‑схемами на входе/выходе. Ломаются схемы → всплывёт в Storybook.
3) **Query‑кеш**: исползьуйте `useSearchWorks` для пагинированных страниц и `useInfiniteSearchWorks` для длинных лент. Старайтесь держать `queryKey` = `['search', filters]`/`['search-infinite', filters]`.
4) **Abort/rapid input**: передавайте `signal` из Query — поиск не должен «мигать» данными от старых запросов.
5) **Virtualized by default**: lists > 100 элементов рендерим только через `ResultsListVirtualized`. Контролируйте высоту контейнера (vh) и `overscan`.
6) **MSW scenarios**: добавляйте «тяжёлые» истории (большие страницы, 500/429, пустые результаты) — это QA без прод‑трафика.
7) **Perf budget**: измеряйте время поиска в Storybook (Performance tab). Считайте LCP для страницы результатов; избегайте тяжёлых теней/картинок.
8) **A11y baseline**: проверяем через addon‑a11y: контраст, фокус, aria‑атрибуты на иконках (bookmark, prev/next).
9) **URL sync**: синхронизируйте фильтры в `?query=...` — удобно для «shareable» ссылок и e2e‑тестов (добавьте позже `useSearchParams`).
10) **Testing**: Vitest на утилиты и адаптеры, Playwright — e2e флоу (поиск → карточка → читалка). Запускайте e2e на MSW.
11) **Analytics hooks**: в местах `onSubmitSearch`, `onChangeFilter`, `onOpenWork`, `onChapterNext/Prev` — шлите события (добавьте debounce).
12) **Feature flags**: Translate/TTS за флагами, сторисы с выключенными экшенами уже есть.

---

## 7) Done checklist
- [ ] Preview wraps with `withQuery`
- [ ] Paged MSW handlers подключены к Virtualized story
- [ ] Infinite list загружает новые страницы при `endReached`
- [ ] A11y/Perf проверены на «виртуализированной» истории

> Теперь вы можете разворачивать реальные интеграции, оставив Storybook как безопасный полигон: любые изменения бэкенда сначала отражайте в MSW + Zod, затем переносите на прод.

