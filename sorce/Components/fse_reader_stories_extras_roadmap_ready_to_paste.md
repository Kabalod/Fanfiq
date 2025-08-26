# FSE — Reader Stories + Extras Roadmap (ready-to-paste)

Готовые stories для читалки (loading / error / empty / отключённые экшены) + заготовки MSW‑эндпоинтов. Ниже — чек‑лист «что ещё понадобится» для MVP/Prod.

---

## 1) Компоненты состояний для Reader

### 1.1 `src/components/fse/Reader/ReaderSkeleton.tsx`
```tsx
import { Skeleton } from '@/components/ui/skeleton'

export function ReaderSkeleton() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-6 space-y-3">
      <Skeleton className="h-6 w-2/3" />
      <Skeleton className="h-4 w-1/3" />
      {Array.from({length:6}).map((_,i)=>(<Skeleton key={i} className="h-4 w-full" />))}
    </div>
  )
}
```

### 1.2 `src/components/fse/Reader/ReaderError.tsx`
```tsx
'use client'
import { Button } from '@/components/ui/button'
export function ReaderError({ message = 'Не удалось загрузить главу', onRetry }: { message?: string; onRetry?: () => void }) {
  return (
    <div className="text-center py-16">
      <div className="text-lg font-semibold">{message}</div>
      <div className="text-sm text-muted-foreground mt-1">Проверьте подключение или попробуйте ещё раз.</div>
      {onRetry && <Button className="mt-4" onClick={onRetry}>Повторить</Button>}
    </div>
  )
}
```

### 1.3 `src/components/fse/Reader/ReaderEmpty.tsx`
```tsx
export function ReaderEmpty() {
  return (
    <div className="text-center py-16 text-muted-foreground">
      <div className="text-lg font-medium mb-1">Главы отсутствуют</div>
      <div className="text-sm">Откройте работу на сайте‑источнике или выберите другую главу.</div>
    </div>
  )
}
```

---

## 2) Stories для Reader

> Используют уже добавленные `ReaderShell`, `ReaderSettings`, `ReaderContext`.

### 2.1 `src/stories/fse/reader/Reader.loading.stories.tsx`
```tsx
import type { Meta, StoryObj } from '@storybook/react'
import { useEffect, useState } from 'react'
import { ReaderShell } from '@/components/fse/Reader/ReaderShell'
import { ReaderProvider } from '@/components/fse/Reader/ReaderContext'
import { ReaderSkeleton } from '@/components/fse/Reader/ReaderSkeleton'

const meta: Meta = { title: 'FSE/Reader/Loading' }
export default meta

export const Loading: StoryObj = {
  render: () => {
    const [ready, setReady] = useState(false)
    useEffect(() => { const t = setTimeout(()=>setReady(true), 1200); return () => clearTimeout(t) }, [])
    if (!ready) return <ReaderSkeleton />
    return (
      <ReaderProvider>
        <ReaderShell
          title="Тени прошлого"
          author="АвторПример"
          chapterTitles={["Пролог","Глава 1","Глава 2"]}
          currentIndex={0}
          onChangeChapter={()=>{}}
          contentHtml={'<p>Контент загружен.</p>'}
        />
      </ReaderProvider>
    )
  }
}
```

### 2.2 `src/stories/fse/reader/Reader.error.stories.tsx`
```tsx
import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { ReaderError } from '@/components/fse/Reader/ReaderError'

const meta: Meta = { title: 'FSE/Reader/Error' }
export default meta

export const Error: StoryObj = {
  render: () => {
    const [n, setN] = useState(0)
    return <ReaderError onRetry={()=>setN(n+1)} />
  }
}
```

### 2.3 `src/stories/fse/reader/Reader.empty.stories.tsx`
```tsx
import type { Meta, StoryObj } from '@storybook/react'
import { ReaderShell } from '@/components/fse/Reader/ReaderShell'

const meta: Meta = { title: 'FSE/Reader/Empty' }
export default meta

export const Empty: StoryObj = {
  render: () => (
    <ReaderShell
      title="Пустая работа"
      author="Аноним"
      chapterTitles={[]}
      currentIndex={0}
      onChangeChapter={()=>{}}
      contentHtml={''}
    />
  )
}
```

### 2.4 `src/stories/fse/reader/Reader.actions-disabled.stories.tsx`
```tsx
import type { Meta, StoryObj } from '@storybook/react'
import { ReaderShell } from '@/components/fse/Reader/ReaderShell'

const meta: Meta = { title: 'FSE/Reader/ActionsDisabled' }
export default meta

export const ActionsDisabled: StoryObj = {
  render: () => (
    <ReaderShell
      title="Ограниченный режим"
      author="Автор"
      chapterTitles={["Единственная глава"]}
      currentIndex={0}
      onChangeChapter={()=>{}}
      onTranslate={()=>alert('Перевод временно недоступен')}
      onTTS={()=>alert('Озвучивание временно недоступно')}
      contentHtml={'<p>Контент без AI‑экшенов.</p>'}
    />
  )
}
```

---

## 3) MSW для глав

### 3.1 `mocks/chapters.json`
```json
{
  "workId": "work_123",
  "chapters": [
    { "chapter_number": 1, "title": "Пролог", "content_html": "<p>Текст пролога…</p>" },
    { "chapter_number": 2, "title": "Глава 1", "content_html": "<p>Текст главы 1…</p>" }
  ]
}
```

### 3.2 `mocks/handlersChapters.ts`
```ts
import { http, HttpResponse } from 'msw'
import data from './chapters.json'

export const chapterHandlers = [
  http.get('/api/v1/works/:id/chapters', async ({ params }) => {
    // Можно проверить params.id; сейчас возвращаем демо‑набор
    return HttpResponse.json(data)
  }),
  http.get('/api/v1/works/:id/chapters/error', async () => {
    return HttpResponse.json({ message: 'Chapter fetch error' }, { status: 500 })
  })
]
```

> В историях можно подключать: `parameters.msw.handlers = (await import('../../../../mocks/handlersChapters')).chapterHandlers`.

---

## 4) Что ещё понадобится (чек‑лист продакшн‑готовности)

### 4.1 UI/UX и компоненты
- [ ] **BookmarkButton** (локальный и серверный режим, optimistic UI + toast).
- [ ] **Saved Searches** (Command‑palette: сохранить текущие фильтры, быстрый вызов).
- [ ] **Keyboard Shortcuts**: `/` фокус на поиск; `f` открыть фильтры; `j/k` навигация по списку; `←/→` главы в Reader.
- [ ] **QueryStateSync**: синхронизация фильтров/сортировки с `?query=...&rating=...` (deep‑links, share links).
- [ ] **Virtualized Results** (10k+ карточек) — `@tanstack/react-virtual` или `react-virtuoso`.
- [ ] **ErrorBoundary** и универсальная `ErrorState` для страниц.
- [ ] **CopyLink / ShareSheet** для выдачи и Reader (ссылка на оригинал в явном виде).

### 4.2 Данные и сеть
- [ ] **TanStack Query** для кеширования, повторов (retry/backoff), отмены запросов.
- [ ] **Схемы/валидация** (zod) на границе API + адаптер нормализации под единый формат ТЗ.
- [ ] **Аборт контроллеры** для отмены поиска при быстрых изменениях фильтров.
- [ ] **Пагинация**: page/per_page; альтернатива — бесконечный скролл с «Load more».

### 4.3 Доступность (a11y)
- [ ] **Skip to content** ссылка.
- [ ] Проверка контраста (≥ 4.5:1), видимые focus‑ring.
- [ ] Правильные `aria-*` для интерактивных иконок (bookmark, next/prev).

### 4.4 Локализация/форматы
- [ ] **i18n** (ru/en) для UI‑строк и форматов дат/чисел.
- [ ] **Словоформы** (plural rules) для «комментариев/лайков».

### 4.5 Производительность
- [ ] Lazy‑load изображений, `next/image` (если Next.js).
- [ ] Предзагрузка соседних страниц/глав (prefetch).
- [ ] Lighthouse бюджет (LCP/TBT/CLS), проверка в CI.

### 4.6 Безопасность/контент
- [ ] **HTML Sanitizer** (DOMPurify) для `content_html`.
- [ ] **Фильтр взрослых меток** (safe‑mode), age‑gate при необходимости.
- [ ] `rel="nofollow noopener"` для внешних ссылок на источники.

### 4.7 Парсеры и индексирование (сигналы для бэкенда)
- [ ] Дедупликация работ (канонический ключ по источнику+ID).
- [ ] Нормализация тегов/фандомов/рейтингов к единому словарю.
- [ ] Ротация User‑Agent, rate‑limit, очереди (BullMQ/Redis) и ретраи.
- [ ] Health‑пинг парсеров и телеметрия ошибок.

### 4.8 Тесты и качество
- [ ] **Unit** (Vitest) для утилит и адаптеров.
- [ ] **Contract**‑тесты схем API (zod parse).
- [ ] **E2E** (Playwright): поиск → открыть работу → читалка, переключение глав.
- [ ] **Visual** (Storybook test runner/Chromatic) — регресс картинок/темных тем.
- [ ] **Lint/Format**: ESLint, Prettier, commitlint + Husky.

### 4.9 Аналитика и события
- [ ] Схема событий: search_submitted, filter_changed, work_opened, chapter_next/prev, bookmark_added.
- [ ] Отправка событий с дебаунсом и защитой от спама.

---

## 5) Следующие шаги
1) Вставить компоненты и stories из разделов 1–3.
2) Подключить MSW‑handlers для глав в нужных историях.
3) Выбрать библиотеку виртуализации и TanStack Query — создать базовый провайдер в Storybook.
4) Создать задачи по чек‑листу 4.1–4.9 в трекере (MVP vs Post‑MVP).

