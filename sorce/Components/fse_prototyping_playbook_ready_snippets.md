# FSE — Prototyping Playbook & Ready Snippets

Гайд по улучшениям на этапе прототипирования + готовые вставки кода. Сфокусирован на скорости итераций, UX‑качество и надёжность демо без жёсткой привязки к бэкенду.

---

## 0) Быстрые установки
```bash
# Санитайзер HTML для Reader
pnpm add isomorphic-dompurify
# Faker для генерации мок‑данных
pnpm add -D @faker-js/faker
```

---

## 1) Дизайн‑токены и темы (light/dark/sepia)

### 1.1 `src/styles/tokens.css`
```css
:root {
  /* Бренд */
  --brand: 222.2 84% 56%;
  --brand-foreground: 210 40% 98%;

  /* Типографика */
  --radius: 1rem;
}

/* Сепия для Reader */
.theme-sepia {
  --background: 40 40% 94%;
  --foreground: 24 25% 15%;
}
```

### 1.2 `tailwind.config.ts` (фрагмент)
```ts
export default {
  theme: {
    extend: {
      borderRadius: { xl: 'var(--radius)' },
      colors: {
        brand: {
          DEFAULT: 'hsl(var(--brand))',
          foreground: 'hsl(var(--brand-foreground))',
        },
      },
    },
  },
}
```

### 1.3 Применение темы
```tsx
// Пример: обернуть Reader
<div className={`min-h-screen ${isSepia ? 'theme-sepia' : ''}`}>...</div>
```

---

## 2) Санитайзер контента для Reader

### 2.1 `src/lib/sanitizeHtml.ts`
```ts
import DOMPurify from 'isomorphic-dompurify'
export function sanitizeHtml(html: string) {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: false, // по умолчанию безопасный набор
    ALLOWED_ATTR: false,
    ADD_ATTR: ['target','rel'],
    FORBID_TAGS: ['script','style','iframe'],
  })
}
```

### 2.2 Использование в Reader
```tsx
import { sanitizeHtml } from '@/lib/sanitizeHtml'

<div className="prose dark:prose-invert" dangerouslySetInnerHTML={{ __html: sanitizeHtml(contentHtml) }} />
```

---

## 3) Генератор мок‑данных для списков

### 3.1 `src/lib/fse/fakeWorks.ts`
```ts
import { faker } from '@faker-js/faker'
import type { Work } from '@/lib/fse/apiSchema'

export function makeWork(i: number): Work {
  return {
    id: `w_${i}`,
    title: faker.lorem.words(3),
    author_name: faker.internet.userName(),
    summary: faker.lorem.sentences(2),
    language: faker.helpers.arrayElement(['ru','en']),
    fandoms: [faker.helpers.arrayElement(['Гарри Поттер','Звёздные войны','Марвел'])],
    tags: faker.helpers.arrayElements(['Драма','AU','Экшн','Мистика','Юмор'], 3),
    rating: faker.helpers.arrayElement(['G','PG-13','R','NC-17']),
    status: faker.helpers.arrayElement(['In Progress','Completed','On Hiatus']) as any,
    warnings: faker.helpers.arrayElements(['Major Character Death','Graphic Violence'], 1),
    word_count: faker.number.int({ min: 1000, max: 200000 }),
    likes_count: faker.number.int({ min: 0, max: 5000 }),
    comments_count: faker.number.int({ min: 0, max: 500 }),
    updated_at: faker.date.recent({ days: 300 }).toISOString(),
  }
}

export function makeWorks(n: number) { return Array.from({ length: n }, (_, i) => makeWork(i + 1)) }
```

---

## 4) Переключатель сценариев MSW в Storybook (toolbar)

### 4.1 `.storybook/preview.tsx` добавления
```tsx
export const globalTypes = {
  // ... существующее
  scenario: {
    name: 'Scenario',
    defaultValue: 'success',
    toolbar: {
      icon: 'transfer',
      items: [
        { value: 'success', title: 'Success' },
        { value: 'empty', title: 'Empty' },
        { value: 'error', title: '500' },
        { value: 'slow', title: 'Slow' },
        { value: '429', title: 'Rate limit' },
      ],
    },
  },
}

const ScenarioDecorator = (Story, ctx) => {
  // Пример: можно переключать handlers по ctx.globals.scenario
  // Здесь оставлено как каркас — подключите нужные sets из mocks/*
  return <Story />
}

export default {
  decorators: [ThemeDecorator, mswDecorator, withQuery, ScenarioDecorator],
}
```

> В каждой истории можно задать `parameters.msw.handlers` для конкретного сценария.

---

## 5) Фичефлаги для Translate/TTS

### 5.1 `src/lib/flags/FlagsContext.tsx`
```tsx
'use client'
import * as React from 'react'

export type Flags = { translate: boolean; tts: boolean }
const defaultFlags: Flags = { translate: false, tts: false }
export const FlagsCtx = React.createContext<{ flags: Flags; setFlags: (f: Partial<Flags>) => void }>({ flags: defaultFlags, setFlags: () => {} })

export function FlagsProvider({ children }: { children: React.ReactNode }) {
  const [flags, setState] = React.useState<Flags>(() => {
    if (typeof window !== 'undefined') {
      try { return JSON.parse(localStorage.getItem('fse-flags') || 'null') || defaultFlags } catch {}
    }
    return defaultFlags
  })
  const setFlags = (patch: Partial<Flags>) => {
    const next = { ...flags, ...patch }
    setState(next)
    if (typeof window !== 'undefined') localStorage.setItem('fse-flags', JSON.stringify(next))
  }
  return <FlagsCtx.Provider value={{ flags, setFlags }}>{children}</FlagsCtx.Provider>
}
```

### 5.2 Применение в ReaderShell
```tsx
import { FlagsCtx } from '@/lib/flags/FlagsContext'
const { flags } = React.useContext(FlagsCtx)
{flags.translate && <Button variant="ghost" size="sm">Перевести</Button>}
{flags.tts && <Button variant="ghost" size="sm">Озвучить</Button>}
```

---

## 6) Клавиатурные шорткаты

### 6.1 `src/lib/useHotkeys.ts`
```ts
import * as React from 'react'
export function useHotkeys(map: Record<string, (e: KeyboardEvent) => void>) {
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const key = [e.ctrlKey && 'Ctrl', e.shiftKey && 'Shift', e.altKey && 'Alt', e.key].filter(Boolean).join('+')
      if (map[key]) map[key](e)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [JSON.stringify(Object.keys(map))])
}
```

### 6.2 Пример
```tsx
useHotkeys({
  '/': (e) => { e.preventDefault(); document.querySelector<HTMLInputElement>('input[aria-label="Поиск"]')?.focus() },
  f: () => document.querySelector<HTMLButtonElement>('button:has-text("Фильтры")')?.click(),
  j: () => window.scrollBy({ top: 64, behavior: 'smooth' }),
  k: () => window.scrollBy({ top: -64, behavior: 'smooth' }),
  'ArrowLeft': () => prevChapter(),
  'ArrowRight': () => nextChapter(),
})
```

---

## 7) Аналитика (заглушка для прототипа)

### 7.1 `src/lib/analytics.ts`
```ts
export type Event =
  | { type: 'search_submitted'; query?: string }
  | { type: 'filter_changed'; payload: Record<string, unknown> }
  | { type: 'work_opened'; workId: string }
  | { type: 'chapter_navigate'; workId: string; to: number }

export function track(ev: Event) {
  // Прототип: лог в консоль
  console.debug('[analytics]', ev)
}
```

### 7.2 Использование
```ts
track({ type: 'search_submitted', query })
track({ type: 'filter_changed', payload: filters })
```

---

## 8) ErrorBoundary (универсальный)

### 8.1 `src/components/common/ErrorBoundary.tsx`
```tsx
import * as React from 'react'

export class ErrorBoundary extends React.Component<{ fallback?: React.ReactNode }, { hasError: boolean }> {
  constructor(props: any) { super(props); this.state = { hasError: false } }
  static getDerivedStateFromError() { return { hasError: true } }
  componentDidCatch(err: any) { console.error(err) }
  render() { return this.state.hasError ? this.props.fallback ?? <div className="p-6">Упс! Что-то пошло не так.</div> : this.props.children }
}
```

---

## 9) Skip to content (a11y)

### 9.1 `src/components/common/SkipToContent.tsx`
```tsx
export function SkipToContent() {
  return (
    <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 bg-primary text-primary-foreground px-3 py-2 rounded-md">Skip to content</a>
  )
}
```

### 9.2 Применение на страницах
```tsx
<SkipToContent />
<main id="main"> ... </main>
```

---

## 10) Reader Deep‑Link (Query → читалка)

### 10.1 `src/stories/fse/reader/Reader.deep-link.stories.tsx`
```tsx
import type { Meta, StoryObj } from '@storybook/react'
import { useMemo, useState } from 'react'
import { ReaderShell } from '@/components/fse/Reader/ReaderShell'

const meta: Meta = { title: 'FSE/Reader/DeepLink' }
export default meta

function useQueryParam(name: string, fallback = '') {
  return useMemo(() => new URLSearchParams(location.search).get(name) ?? fallback, [])
}

export const DeepLink: StoryObj = {
  render: () => {
    const workId = useQueryParam('workId', 'work_123')
    const ch = Number(useQueryParam('ch', '1'))
    const [idx, setIdx] = useState(ch - 1)

    return (
      <ReaderShell
        title={`Демо работа ${workId}`}
        author="Автор"
        chapterTitles={["Пролог","Глава 1","Глава 2","Глава 3"]}
        currentIndex={idx}
        onChangeChapter={setIdx}
        contentHtml={`<p>Контент главы #${idx + 1}</p>`}
      />
    )
  }
}
```

> Теперь можно открывать `?workId=w42&ch=3` и сразу попадать в нужную главу.

---

## 11) Улучшения UX для прототипа (чек‑лист)
- Интерактивные **пустые состояния**: кнопка «Сбросить фильтры» и быстрые пресеты.
- **Плавные transition‑ы** на карточках и в Reader (respect `prefers-reduced-motion`).
- **Оптимистический UI** для пагинации: мгновенно меняем номер страницы, затем подменяем контент.
- **Auto‑focus**: после смены главы — фокус на начало контента, кнопка «Back to results» — на строку поиска.
- **Ленивая загрузка изображений**: `loading="lazy"` + `aspect-ratio` контейнеры на карточках книг.
- **Компонент Notice** для предупреждений 18+/NSFW с запоминанием согласия (localStorage).

---

## 12) Как использовать набор эффективно
1) Сразу подключите `sanitizeHtml` в Reader, чтобы исключить ломание вёрстки чужим HTML.
2) Генерируйте большие выдачи `makeWorks(1000)` и проверяйте производительность виртуализированного списка.
3) В Storybook переключайте сценарии через toolbar **Scenario**.
4) Фичефлаги: в Storybook поднимайте `translate/tts` без внесения изменений в код.
5) Включайте `SkipToContent`, проверьте a11y‑аддон — это быстро поднимает базовую доступность.
6) Для ошибок оборачивайте страницы в `ErrorBoundary` и показывайте дружелюбные сообщения.

---

Готово: этот пак — минимальные, но критичные улучшения для прототипа. При желании добавлю интеграцию **Chromatic** для визуальных регрессий и скрипты CI (lint/test/storybook build).

