# FSE Storybook — MSW & Error/Empty Stories (ready-to-paste)

Ниже — дополнения к твоему Storybook: готовая интеграция **MSW**, компоненты для **ошибок**, а также сторисы для **loading/empty/error** и интеграционная страница с мок‑API. Скопируй файлы в проект, сохраняя пути.

---

## 0) Установка зависимостей
```bash
pnpm add -D msw msw-storybook-addon
```

---

## 1) .storybook/preview.tsx (MSW + декораторы)
> Если у тебя уже есть msw‑инициализация — пропусти. Иначе замени на это:
```tsx
// .storybook/preview.tsx
import type { Preview } from "@storybook/react"
import React, { useEffect } from 'react'
import "../src/styles/globals.css"
import { initialize, mswDecorator } from 'msw-storybook-addon'

initialize()

export const globalTypes = {
  theme: {
    name: 'Theme',
    defaultValue: 'light',
    toolbar: { icon: 'circlehollow', items: [{value:'light',title:'Light'},{value:'dark',title:'Dark'}] },
  },
}

const ThemeDecorator = (Story, ctx) => {
  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle('dark', ctx.globals.theme === 'dark')
  }, [ctx.globals.theme])
  return <div className="min-h-screen bg-background text-foreground p-6"><Story /></div>
}

const preview: Preview = {
  decorators: [ThemeDecorator, mswDecorator],
  parameters: {
    layout: 'padded',
    controls: { expanded: true },
    a11y: { disable: false },
  },
}
export default preview
```

---

## 2) Компоненты состояний (Empty / Error / Skeleton)
### 2.1 `src/components/fse/EmptyState.tsx`
```tsx
export function EmptyState({ title = 'Ничего не найдено', hint = 'Попробуйте изменить фильтры или запрос.' }) {
  return (
    <div className="text-center py-16 text-muted-foreground">
      <div className="text-lg font-medium mb-1">{title}</div>
      <div className="text-sm">{hint}</div>
    </div>
  )
}
```

### 2.2 `src/components/fse/ErrorState.tsx`
```tsx
'use client'
import { Button } from '@/components/ui/button'

export function ErrorState({ message = 'Ошибка загрузки результатов', onRetry }: { message?: string; onRetry?: () => void }) {
  return (
    <div className="text-center py-16">
      <div className="text-lg font-semibold">{message}</div>
      <div className="text-sm text-muted-foreground mt-1">Попробуйте ещё раз. Если ошибка повторится — измените фильтры.</div>
      {onRetry && <Button className="mt-4" onClick={onRetry}>Повторить</Button>}
    </div>
  )}
```

### 2.3 `src/components/fse/Skeletons.tsx` (если ещё нет)
```tsx
import { Skeleton } from '@/components/ui/skeleton'

export function WorkCardSkeleton() {
  return (
    <div className="rounded-2xl border p-5 space-y-3">
      <Skeleton className="h-5 w-2/3" />
      <Skeleton className="h-4 w-1/3" />
      <div className="flex gap-2">
        <Skeleton className="h-6 w-16" />
        <Skeleton className="h-6 w-20" />
      </div>
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
    </div>
  )
}
```

---

## 3) Результаты (c состояниями)
### 3.1 `src/components/fse/ResultsList.tsx` (добавили error/loading)
```tsx
'use client'
import * as React from 'react'
import { WorkCard } from './WorkCard'
import { WorkCardSkeleton } from './Skeletons'
import { EmptyState } from './EmptyState'
import { ErrorState } from './ErrorState'
import type { Work } from '@/lib/fse/apiSchema'

export function ResultsList({ items, loading, error, onRetry }: { items: Work[]; loading?: boolean; error?: boolean; onRetry?: () => void }) {
  if (loading) {
    return <div className="space-y-4">{Array.from({length:6}).map((_,i)=>(<WorkCardSkeleton key={i} />))}</div>
  }
  if (error) return <ErrorState onRetry={onRetry} />
  if (!items.length) return <EmptyState />
  return (
    <div className="space-y-4">
      {items.map((w) => (<WorkCard key={w.id} work={w} />))}
    </div>
  )
}
```

---

## 4) MSW мок‑данные и обработчики
### 4.1 `mocks/data/works.json`
```json
{
  "total_pages": 5,
  "current_page": 1,
  "results": [
    {"id":"w1","title":"Тени прошлого","author_name":"АвторПример","summary":"История...","language":"ru","fandoms":["Гарри Поттер"],"tags":["Драма","Приключения","Дружба"],"rating":"PG-13","status":"Completed","word_count":45000,"likes_count":234,"comments_count":67,"updated_at":"2024-01-15"},
    {"id":"w2","title":"Новая надежда","author_name":"ФантастПисатель","summary":"Альт...","language":"ru","fandoms":["Звёздные войны"],"tags":["AU","Фантастика","Экшн"],"rating":"G","status":"In Progress","word_count":32000,"likes_count":156,"comments_count":43,"updated_at":"2024-01-20"}
  ]
}
```

### 4.2 `mocks/handlers.ts`
```ts
import { http, HttpResponse } from 'msw'
import success from './data/works.json'

export const handlers = [
  http.post('/api/v1/works/search', async ({ request }) => {
    // Пример: можно разобрать body и применить сортировку/фильтры
    // const body = await request.json()
    return HttpResponse.json(success)
  }),
]

// В сторисах можно переопределить хэндлер на 500:
export const errorHandlers = [
  http.post('/api/v1/works/search', async () => HttpResponse.json({ message: 'Server error' }, { status: 500 })),
]
```

---

## 5) Интеграционная страница результатов (с загрузкой/ошибкой)
### 5.1 `src/stories/fse/ResultsPage.stories.tsx`
```tsx
import type { Meta, StoryObj } from '@storybook/react'
import { useEffect, useState } from 'react'
import { SearchBar } from '@/components/fse/SearchBar'
import { ResultsHeader } from '@/components/fse/ResultsHeader'
import { ResultsList } from '@/components/fse/ResultsList'
import type { SearchFilters, SortOption, Work } from '@/lib/fse/apiSchema'
import { searchWorks } from '@/lib/fse/searchApi'

const meta: Meta = { title: 'FSE/ResultsPage' }
export default meta

function useResults() {
  const [filters, setFilters] = useState<SearchFilters>({})
  const [sort, setSort] = useState<SortOption>('relevance')
  const [items, setItems] = useState<Work[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)

  async function load() {
    setLoading(true); setError(false)
    try {
      const r = await searchWorks({ ...filters, sort })
      setItems(r.results)
    } catch (e) {
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [JSON.stringify(filters), sort])

  return { filters, setFilters, sort, setSort, items, loading, error, reload: load }
}

export const Success: StoryObj = {
  render: () => {
    const s = useResults()
    return (
      <div className="space-y-6">
        <SearchBar filters={s.filters} onChange={s.setFilters} />
        <ResultsHeader count={s.items.length} sort={s.sort} setSort={s.setSort} />
        <ResultsList items={s.items} loading={s.loading} error={s.error} onRetry={s.reload} />
      </div>
    )
  },
  parameters: { msw: { handlers: async () => (await import('../../../mocks/handlers')).handlers } },
}

export const Error: StoryObj = {
  render: () => {
    const s = useResults()
    return (
      <div className="space-y-6">
        <SearchBar filters={s.filters} onChange={s.setFilters} />
        <ResultsHeader count={s.items.length} sort={s.sort} setSort={s.setSort} />
        <ResultsList items={[]} loading={s.loading} error={true} onRetry={s.reload} />
      </div>
    )
  },
  parameters: { msw: { handlers: async () => (await import('../../../mocks/handlers')).errorHandlers } },
}
```

---

## 6) Доп. сторисы для Pagination и состояний
### 6.1 `src/stories/fse/Pagination.stories.tsx`
```tsx
import type { Meta, StoryObj } from '@storybook/react'
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination'

const meta: Meta = { title: 'FSE/Pagination' }
export default meta

export const Default: StoryObj = {
  render: () => (
    <Pagination>
      <PaginationContent>
        <PaginationItem><PaginationPrevious href="#" /></PaginationItem>
        <PaginationItem><PaginationLink href="#" isActive>1</PaginationLink></PaginationItem>
        <PaginationItem><PaginationLink href="#">2</PaginationLink></PaginationItem>
        <PaginationItem><PaginationLink href="#">3</PaginationLink></PaginationItem>
        <PaginationItem><PaginationNext href="#" /></PaginationItem>
      </PaginationContent>
    </Pagination>
  )
}
```

### 6.2 `src/stories/fse/States.stories.tsx`
```tsx
import type { Meta, StoryObj } from '@storybook/react'
import { EmptyState } from '@/components/fse/EmptyState'
import { ErrorState } from '@/components/fse/ErrorState'
import { WorkCardSkeleton } from '@/components/fse/Skeletons'

const meta: Meta = { title: 'FSE/States' }
export default meta

export const Empty: StoryObj = { render: () => <EmptyState /> }
export const Error: StoryObj = { render: () => <ErrorState /> }
export const Skeletons: StoryObj = { render: () => <div className="space-y-4">{Array.from({length:3}).map((_,i)=>(<WorkCardSkeleton key={i}/>))}</div> }
```

---

## 7) Быстрый чек‑лист после вставки
- [ ] Убедись, что в `preview.tsx` подключены `initialize()` и `mswDecorator`.
- [ ] Проверь импорты путей `@/…` (vite‑tsconfig‑paths или алиасы в tsconfig).
- [ ] Запусти: `pnpm storybook` и открой истории: **FSE/States**, **FSE/Pagination**, **FSE/ResultsPage (Success/Error)**.
- [ ] При желании расширь `mocks/handlers.ts`, чтобы учитывать фильтры `query`, `rating`, `fandom` и сортировку `sort`.

Готово — у тебя теперь «из коробки» покрыты **loading/empty/error**, а также страница результатов с **MSW‑моками** и кнопкой *Повторить*. Если хочешь, добавлю такие же истории для **Reader** (ошибка загрузки главы, пустой список глав, ТТС/Перевод недоступны).

