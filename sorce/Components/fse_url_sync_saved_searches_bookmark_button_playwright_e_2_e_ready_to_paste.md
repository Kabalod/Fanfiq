# FSE — URL Sync, Saved Searches, BookmarkButton & Playwright E2E (ready-to-paste)

В этом пакете три блока из твоего запроса:
1) **Синхронизация фильтров с URL** + «Сохранённые поиски» (Command‑palette)
2) **BookmarkButton** с optimistic UI и Toast + MSW‑хэндлеры
3) **Шаблоны Playwright E2E** (поиск → карточка → читалка)

---

## 0) Установка зависимостей
```bash
pnpm add @tanstack/react-query
pnpm add -D @playwright/test
```
> Предполагается, что `msw`, `zod`, `shadcn/ui`, `lucide-react` уже стоят. Toast — `npx shadcn@latest add toast`.

---

## 1) URL Sync

### 1.1 `src/lib/fse/urlSync.ts`
```ts
import type { SearchFilters } from '@/lib/fse/apiSchema'

const KEY_ORDER: (keyof SearchFilters)[] = [
  'query','language','source_sites','fandom','include_tags','exclude_tags','rating','status','category','warnings','word_count_min','word_count_max','likes_min','comments_min','date_updated_after','date_updated_before','sort','page','page_size'
]

export function filtersToQuery(f: SearchFilters): URLSearchParams {
  const q = new URLSearchParams()
  for (const k of KEY_ORDER) {
    const v = f[k]
    if (v == null) continue
    if (Array.isArray(v)) {
      if (v.length) q.set(k, v.join(','))
    } else {
      q.set(k, String(v))
    }
  }
  return q
}

export function queryToFilters(q: URLSearchParams): SearchFilters {
  const getArr = (k: string) => (q.get(k)?.split(',').map(s=>s.trim()).filter(Boolean) ?? [])
  const num = (k: string) => (q.get(k) ? Number(q.get(k)) : undefined)
  const str = (k: string) => q.get(k) ?? undefined
  return {
    query: str('query'),
    language: str('language'),
    source_sites: getArr('source_sites'),
    fandom: getArr('fandom'),
    include_tags: getArr('include_tags'),
    exclude_tags: getArr('exclude_tags'),
    rating: (str('rating') as any) ?? undefined,
    status: (str('status') as any) ?? undefined,
    category: (str('category') as any) ?? undefined,
    warnings: getArr('warnings'),
    word_count_min: num('word_count_min'),
    word_count_max: num('word_count_max'),
    likes_min: num('likes_min'),
    comments_min: num('comments_min'),
    date_updated_after: str('date_updated_after'),
    date_updated_before: str('date_updated_before'),
    sort: (str('sort') as any) ?? undefined,
    page: num('page'),
    page_size: num('page_size'),
  }
}

export function applyFiltersToUrl(f: SearchFilters, replace = false) {
  const q = filtersToQuery(f)
  const next = `${location.pathname}?${q.toString()}`
  if (replace) history.replaceState(null, '', next)
  else history.pushState(null, '', next)
}

export function readFiltersFromUrl(): SearchFilters {
  return queryToFilters(new URLSearchParams(location.search))
}
```

### 1.2 Hook: `src/lib/fse/useFilterUrlSync.ts`
```ts
import * as React from 'react'
import type { SearchFilters } from '@/lib/fse/apiSchema'
import { applyFiltersToUrl, readFiltersFromUrl } from './urlSync'

export function useFilterUrlSync(state: SearchFilters, setState: (f: SearchFilters)=>void) {
  // 1) on mount: hydrate from URL
  React.useEffect(() => {
    const initial = readFiltersFromUrl()
    if (Object.keys(initial).length) setState({ ...state, ...initial })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // 2) on popstate: back/forward
  React.useEffect(() => {
    const onPop = () => setState({ ...state, ...readFiltersFromUrl() })
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // 3) on change: push to URL
  React.useEffect(() => {
    applyFiltersToUrl(state, true)
  }, [JSON.stringify(state)])
}
```

### 1.3 Интеграция (пример)
```tsx
// в ResultsPage.stories.tsx или странице
const [filters, setFilters] = useState<SearchFilters>({})
useFilterUrlSync(filters, setFilters)
```

---

## 2) Saved Searches (Command‑palette)

### 2.1 Storage API — `src/lib/fse/savedSearches.ts`
```ts
import type { SearchFilters } from '@/lib/fse/apiSchema'

const KEY = 'fse_saved_searches_v1'
export type SavedSearch = { id: string; name: string; filters: SearchFilters; createdAt: number }

function read(): SavedSearch[] {
  try { return JSON.parse(localStorage.getItem(KEY) || '[]') } catch { return [] }
}
function write(list: SavedSearch[]) { localStorage.setItem(KEY, JSON.stringify(list)) }

export function listSaved(): SavedSearch[] { return read().sort((a,b)=>b.createdAt-a.createdAt) }
export function saveSearch(name: string, filters: SearchFilters): SavedSearch {
  const s: SavedSearch = { id: crypto.randomUUID(), name, filters, createdAt: Date.now() }
  const next = [s, ...read()].slice(0, 50)
  write(next)
  return s
}
export function removeSaved(id: string) { write(read().filter(s=>s.id!==id)) }
```

### 2.2 Команда — `src/components/fse/SavedSearchCommand.tsx`
```tsx
'use client'
import * as React from 'react'
import { Command, CommandInput, CommandList, CommandItem, CommandEmpty, CommandGroup } from '@/components/ui/command'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { listSaved, saveSearch, removeSaved } from '@/lib/fse/savedSearches'
import type { SearchFilters } from '@/lib/fse/apiSchema'

export function SavedSearchCommand({ current, onLoad }: { current: SearchFilters; onLoad: (f: SearchFilters)=>void }) {
  const [items, setItems] = React.useState(listSaved())
  const [open, setOpen] = React.useState(false)
  const [nameOpen, setNameOpen] = React.useState(false)
  const [name, setName] = React.useState('')

  function doSave() {
    saveSearch(name || 'Поиск', current)
    setItems(listSaved())
    setName('')
    setNameOpen(false)
  }

  return (
    <div className="flex gap-2">
      <Button variant="outline" onClick={() => setOpen(!open)}>Saved</Button>
      <Button onClick={() => setNameOpen(true)}>Save current</Button>

      {open && (
        <div className="absolute z-50 mt-10 w-[360px]">
          <Command className="rounded-md border bg-popover text-popover-foreground">
            <CommandInput placeholder="Поиск по сохранённым" />
            <CommandList>
              <CommandEmpty>Пусто</CommandEmpty>
              <CommandGroup heading="Сохранённые поиски">
                {items.map((s) => (
                  <CommandItem key={s.id} onSelect={() => { onLoad(s.filters); setOpen(false) }}>
                    <div className="flex w-full items-center justify-between gap-2">
                      <span className="truncate">{s.name}</span>
                      <Button size="sm" variant="ghost" onClick={(e)=>{ e.stopPropagation(); removeSaved(s.id); setItems(listSaved()) }}>Удалить</Button>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </div>
      )}

      <Dialog open={nameOpen} onOpenChange={setNameOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Сохранить текущий поиск</DialogTitle></DialogHeader>
          <input className="w-full rounded-md border p-2" placeholder="Название сохранённого поиска" value={name} onChange={(e)=>setName(e.target.value)} />
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={()=>setNameOpen(false)}>Отмена</Button>
            <Button onClick={doSave}>Сохранить</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
```

### 2.3 Пример интеграции
```tsx
// В ResultsHeader или рядом c SearchBar
<SavedSearchCommand current={filters} onLoad={setFilters} />
```

---

## 3) BookmarkButton (optimistic + toast)

### 3.1 API + hook — `src/lib/fse/bookmarksApi.ts`
```ts
import { z } from 'zod'

export const BookmarkReq = z.object({ workId: z.string() })
export const BookmarkRes = z.object({ success: z.boolean(), bookmarked: z.boolean() })
export type BookmarkResT = z.infer<typeof BookmarkRes>

export async function addBookmark(workId: string, signal?: AbortSignal): Promise<BookmarkResT> {
  const r = await fetch('/api/v1/bookmarks', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ workId }), signal })
  if (!r.ok) throw new Error('bookmark add failed')
  return BookmarkRes.parse(await r.json())
}
export async function removeBookmark(workId: string, signal?: AbortSignal): Promise<BookmarkResT> {
  const r = await fetch('/api/v1/bookmarks/' + encodeURIComponent(workId), { method: 'DELETE', signal })
  if (!r.ok) throw new Error('bookmark remove failed')
  return BookmarkRes.parse(await r.json())
}
```

### 3.2 `src/lib/fse/useToggleBookmark.ts`
```ts
import { useMutation } from '@tanstack/react-query'
import { addBookmark, removeBookmark } from './bookmarksApi'

export function useToggleBookmark() {
  const add = useMutation({ mutationFn: ({ id }: { id: string }) => addBookmark(id) })
  const del = useMutation({ mutationFn: ({ id }: { id: string }) => removeBookmark(id) })
  return { add, del }
}
```

### 3.3 Компонент — `src/components/fse/BookmarkButton.tsx`
```tsx
'use client'
import * as React from 'react'
import { Bookmark } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import { useToggleBookmark } from '@/lib/fse/useToggleBookmark'

export function BookmarkButton({ workId, initial }: { workId: string; initial?: boolean }) {
  const [saved, setSaved] = React.useState(!!initial)
  const { toast } = useToast()
  const { add, del } = useToggleBookmark()

  async function toggle() {
    const next = !saved
    setSaved(next) // optimistic
    try {
      if (next) {
        await add.mutateAsync({ id: workId })
        toast({ title: 'Добавлено в закладки' })
      } else {
        await del.mutateAsync({ id: workId })
        toast({ title: 'Удалено из закладок' })
      }
    } catch (e) {
      setSaved(!next) // rollback
      toast({ title: 'Ошибка', description: 'Не удалось изменить закладку', variant: 'destructive' })
    }
  }

  return (
    <Button variant="ghost" size="icon" aria-pressed={saved} aria-label={saved ? 'Убрать из закладок' : 'Добавить в закладки'} onClick={toggle}>
      <Bookmark className={`h-5 w-5 ${saved ? 'fill-current' : ''}`} />
    </Button>
  )
}
```

### 3.4 Встраивание в `WorkCard`
```tsx
// замените текущую кнопку в правом верхнем углу на
<BookmarkButton workId={work.id} initial={false} />
```

### 3.5 MSW — `mocks/handlersBookmarks.ts`
```ts
import { http, HttpResponse } from 'msw'

export const bookmarkHandlers = [
  http.post('/api/v1/bookmarks', async () => HttpResponse.json({ success: true, bookmarked: true })),
  http.delete('/api/v1/bookmarks/:id', async () => HttpResponse.json({ success: true, bookmarked: false })),
]
```

---

## 4) Playwright E2E

### 4.1 `playwright.config.ts`
```ts
import { defineConfig, devices } from '@playwright/test'
export default defineConfig({
  testDir: 'tests',
  use: { baseURL: process.env.E2E_BASE_URL || 'http://localhost:6006' },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
})
```

> Для Storybook укажи `E2E_BASE_URL=http://localhost:6006` (порт твоего SB).

### 4.2 Тест: поиск → карточка → читалка — `tests/fse.e2e.spec.ts`
```ts
import { test, expect } from '@playwright/test'

// Storybook: iframe с интеграционной страницей результатов
const RESULTS_IFRAME = '/iframe.html?id=fse-resultspage--page'
const READER_IFRAME = '/iframe.html?id=fse-reader-readershell--default'

test('search → open card → open reader', async ({ page }) => {
  // 1) Открыть страницу результатов (мок‑API)
  await page.goto(RESULTS_IFRAME)
  await expect(page.locator('text=Найдено')).toBeVisible()

  // 2) Ввести запрос и нажать «Искать»
  const input = page.getByPlaceholder('Название, автор, саммари...')
  await input.fill('гарри')
  await page.getByRole('button', { name: 'Искать' }).click()

  // 3) Дождаться карточек
  const firstCardTitle = page.locator('article, div').filter({ hasText: 'Тени прошлого' }).first()
  await expect(firstCardTitle).toBeVisible()

  // 4) Открыть читалку (в реальном приложении здесь будет переход)
  await page.goto(READER_IFRAME)
  await expect(page.getByText('Глава 1', { exact: false })).toBeVisible()

  // 5) Навигация по главам
  await page.getByRole('button', { name: 'Следующая' }).click()
  await expect(page.getByText('Глава 2', { exact: false })).toBeVisible()
})
```

> Примечание: ID историй (`id=...`) проверь по твоим реальным сторисам; при необходимости скорректируй.

---

## 5) Как пользоваться (шаги)
1) **URL Sync**: подключи `useFilterUrlSync(filters, setFilters)` на странице/истории результатов — фильтры пишутся в query‑строку и восстанавливаются по `back/forward`.
2) **Saved Searches**: размести `<SavedSearchCommand current={filters} onLoad={setFilters} />` рядом с поиском — сохраняй/вызывай преднастройки.
3) **Bookmarks**: импортируй `<BookmarkButton />` в `WorkCard`, подключи `bookmarkHandlers` в Storybook (MSW). Для прод‑бэка — реализуй POST `/api/v1/bookmarks` и DELETE `/api/v1/bookmarks/:id`.
4) **E2E**: запусти Storybook (`pnpm storybook`) и Playwright (`pnpm exec playwright test`). Для app‑интеграции поменяй `baseURL` на адрес dev‑сервера.

---

## 6) QA‑чеклист
- URL меняется при изменении фильтров; при F5 состояние восстанавливается
- Saved Searches сохраняются/удаляются; Command быстро ищет по названию
- BookmarkButton моментально реагирует (optimistic) и откатывает при ошибке
- E2E проходит стабильно локально и в CI (запуск перед merge)

Готово — три пункта закрыты. Если хочешь, добавлю **deep‑link** на Reader (`/read?workId=...&ch=2`) и провяжу это с MSW/Router для локальных прогонов.

