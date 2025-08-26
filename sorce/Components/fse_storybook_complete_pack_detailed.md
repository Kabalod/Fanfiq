# FSE Storybook — Complete Pack (Detailed)

Полный пакет для Storybook под ТЗ «Поиск, Читалка, Парсеры». Включает детально проработанные компоненты, их стори, мок‑API, провайдеры и декораторы. Структура и код ниже — просто скопируй в репозиторий.

---

## 📁 Рекомендуемая структура
```
src/
  components/
    fse/
      controls/
        TagMultiSelect.tsx
        RangeSlider.tsx
      Reader/
        ReaderContext.tsx
        ReaderShell.tsx
        ReaderSettings.tsx
      WorkCard.tsx
      ResultsHeader.tsx
      ResultsList.tsx
      EmptyState.tsx
      Skeletons.tsx
      SearchBar.tsx
      FilterPanel.tsx
      SortSelect.tsx
    ui/ ... (shadcn)
  lib/
    fse/
      apiSchema.ts
      searchApi.ts
  stories/
    fse/
      Intro.mdx
      WorkCard.stories.tsx
      ResultsHeader.stories.tsx
      ResultsList.stories.tsx
      SearchBar.stories.tsx
      FilterPanel.stories.tsx
      SortSelect.stories.tsx
      ReaderShell.stories.tsx
      ReaderSettings.stories.tsx
      EmptyAndSkeleton.stories.tsx
mocks/
  handlers.ts
  data/works.json
.storybook/
  main.ts
  preview.tsx
```

> Предпосылки: Tailwind + shadcn/ui + lucide-react. Для моков — `msw` и `msw-storybook-addon` (по желанию). TypeScript включён.

---

## 1) Базовые типы и схемы

### `src/lib/fse/apiSchema.ts`
```ts
import { z } from 'zod'

export const WorkSchema = z.object({
  id: z.string(),
  original_url: z.string().url().optional(),
  title: z.string(),
  author_name: z.string(),
  author_url: z.string().url().optional(),
  summary: z.string().default(''),
  language: z.string().default('ru'),
  fandoms: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
  rating: z.enum(["G","PG-13","R","NC-17","T","M","E"]).or(z.string()),
  category: z.enum(["Gen","Het","Slash","Femslash","Other"]).optional(),
  status: z.enum(["In Progress","Completed","On Hiatus"]),
  warnings: z.array(z.string()).optional(),
  word_count: z.number().int().nonnegative(),
  likes_count: z.number().int().optional(),
  comments_count: z.number().int().optional(),
  published_at: z.string().optional(),
  updated_at: z.string().optional(),
})

export const SearchFiltersSchema = z.object({
  source_sites: z.array(z.string()).optional(),
  query: z.string().optional(),
  language: z.string().optional(),
  fandom: z.array(z.string()).optional(),
  include_tags: z.array(z.string()).optional(),
  exclude_tags: z.array(z.string()).optional(),
  rating: z.union([z.literal('all'), z.string()]).optional(),
  status: z.union([z.literal('all'), z.string()]).optional(),
  category: z.union([z.literal('all'), z.string()]).optional(),
  warnings: z.array(z.string()).optional(),
  word_count_min: z.number().optional(),
  word_count_max: z.number().optional(),
  likes_min: z.number().optional(),
  comments_min: z.number().optional(),
  date_updated_after: z.string().optional(),
  date_updated_before: z.string().optional(),
  page: z.number().int().positive().optional(),
  page_size: z.number().int().positive().max(100).optional(),
  sort: z.enum(['relevance','updated_desc','popularity_desc','words_desc','words_asc']).optional(),
})

export const SearchResponseSchema = z.object({
  total_pages: z.number().int().nonnegative(),
  current_page: z.number().int().nonnegative(),
  results: z.array(WorkSchema),
})

export type Work = z.infer<typeof WorkSchema>
export type SearchFilters = z.infer<typeof SearchFiltersSchema>
export type SearchResponse = z.infer<typeof SearchResponseSchema>
```

### `src/lib/fse/searchApi.ts`
```ts
import { SearchFilters, SearchResponse, SearchResponseSchema } from './apiSchema'

export async function searchWorks(payload: SearchFilters): Promise<SearchResponse> {
  const res = await fetch('/api/v1/works/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  const data = await res.json()
  return SearchResponseSchema.parse(data)
}
```

---

## 2) Контролы (inputs)

### `src/components/fse/controls/TagMultiSelect.tsx`
```tsx
'use client'
import * as React from 'react'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { X } from 'lucide-react'

// Универсальный мультиселект по тегам (фандомы/теги/предупреждения/источники)
export function TagMultiSelect({
  label,
  value,
  onChange,
  suggestions = [],
  placeholder = 'Начните ввод...',
}: {
  label: string
  value: string[]
  onChange: (next: string[]) => void
  suggestions?: string[]
  placeholder?: string
}) {
  const [query, setQuery] = React.useState('')
  const [custom, setCustom] = React.useState('')

  function add(tag: string) {
    const next = Array.from(new Set([...value, tag]))
    onChange(next)
    setQuery('')
  }
  function remove(tag: string) {
    onChange(value.filter((t) => t !== tag))
  }

  return (
    <div className="space-y-2">
      <div className="text-sm text-muted-foreground">{label}</div>
      <div className="flex flex-wrap gap-2">
        {value.map((t) => (
          <Badge key={t} variant="secondary" className="gap-1">
            {t}
            <button aria-label={`Удалить ${t}`} onClick={() => remove(t)}>
              <X className="h-3.5 w-3.5" />
            </button>
          </Badge>
        ))}
      </div>

      <Command shouldFilter={true} className="rounded-md border">
        <div className="p-2 border-b">
          <CommandInput placeholder={placeholder} value={query} onValueChange={setQuery} />
        </div>
        <CommandList>
          <CommandEmpty>Ничего не найдено</CommandEmpty>
          <CommandGroup>
            {suggestions
              .filter((s) => s.toLowerCase().includes(query.toLowerCase()))
              .slice(0, 10)
              .map((s) => (
                <CommandItem key={s} onSelect={() => add(s)}>{s}</CommandItem>
              ))}
          </CommandGroup>
        </CommandList>
      </Command>

      <div className="flex items-center gap-2">
        <Input value={custom} onChange={(e) => setCustom(e.target.value)} placeholder="Добавить свой тег" />
        <button className="text-sm underline" onClick={() => custom && add(custom)}>Добавить</button>
      </div>
    </div>
  )
}
```

### `src/components/fse/controls/RangeSlider.tsx`
```tsx
'use client'
import * as React from 'react'
import { Slider } from '@/components/ui/slider'

export function RangeSlider({
  label,
  min,
  max,
  step = 1000,
  value,
  onChange,
  format = (v:number) => v.toLocaleString('ru-RU'),
}: {
  label: string
  min: number
  max: number
  step?: number
  value: [number, number]
  onChange: (next: [number, number]) => void
  format?: (v:number)=>string
}) {
  return (
    <div>
      <div className="mb-2 text-sm text-muted-foreground flex items-center justify-between">
        <span>{label}</span>
        <span>{format(value[0])} — {format(value[1])}</span>
      </div>
      <Slider value={value} min={min} max={max} step={step} onValueChange={(v)=>onChange([v[0], v[1]] as [number,number])} />
    </div>
  )
}
```

---

## 3) Поиск и фильтры (UI)

### `src/components/fse/SearchBar.tsx`
```tsx
'use client'
import * as React from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Separator } from '@/components/ui/separator'
import { FilterPanel } from './FilterPanel'
import { Search } from 'lucide-react'
import type { SearchFilters } from '@/lib/fse/apiSchema'

export function SearchBar({ filters, onChange }: { filters: SearchFilters; onChange: (f: SearchFilters) => void }) {
  const [q, setQ] = React.useState(filters.query ?? '')
  const [open, setOpen] = React.useState(false)
  return (
    <div className="flex w-full items-center gap-2">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          aria-label="Поиск"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && onChange({ ...filters, query: q })}
          placeholder="Название, автор, саммари..."
          className="pl-9"
        />
      </div>
      <Button onClick={() => onChange({ ...filters, query: q })}>Искать</Button>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" aria-expanded={open}>Фильтры</Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[360px] p-0">
          <div className="p-4 border-b font-semibold">Фильтры</div>
          <div className="p-4 space-y-4">
            <FilterPanel value={filters} onChange={onChange} showReset />
          </div>
          <Separator />
          <div className="p-4 flex gap-2">
            <Button onClick={() => setOpen(false)} className="flex-1">Применить</Button>
            <Button variant="outline" onClick={() => { onChange({}); setOpen(false) }}>Сбросить</Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
```

### `src/components/fse/FilterPanel.tsx` (детализировано)
```tsx
'use client'
import * as React from 'react'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { TagMultiSelect } from './controls/TagMultiSelect'
import { RangeSlider } from './controls/RangeSlider'
import type { SearchFilters } from '@/lib/fse/apiSchema'

const LANGS = ['ru','en']
const RATINGS = ['G','PG-13','R','NC-17'] as const
const STATUSES = ['In Progress','Completed','On Hiatus'] as const
const CATEGORIES = ['Gen','Het','Slash','Femslash','Other'] as const
const WARNINGS = ['Major Character Death','Graphic Violence','Underage','No Archive Warnings Apply']
const SOURCES = ['Ficbook','AO3','FFN','Wattpad','Author.Today','Litnet','Fanfics.me','Hogwartsnet']

export function FilterPanel({ value, onChange, showReset = false }: { value: SearchFilters; onChange: (f: SearchFilters) => void; showReset?: boolean }) {
  function set<K extends keyof SearchFilters>(key: K, v: SearchFilters[K]) {
    onChange({ ...value, [key]: v })
  }

  return (
    <div className="space-y-4 text-sm">
      {showReset && (
        <Button variant="ghost" size="sm" onClick={() => onChange({})}>Сбросить все фильтры</Button>
      )}

      <Accordion type="multiple" defaultValue={["basic","meta","tags","stats"]} className="w-full">
        <AccordionItem value="basic">
          <AccordionTrigger>Основные</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-3">
              <div>
                <div className="mb-1 text-muted-foreground">Язык</div>
                <Select value={value.language ?? 'ru'} onValueChange={(v) => set('language', v)}>
                  <SelectTrigger><SelectValue placeholder="Выберите язык" /></SelectTrigger>
                  <SelectContent>{LANGS.map((l) => (<SelectItem key={l} value={l}>{l}</SelectItem>))}</SelectContent>
                </Select>
              </div>
              <TagMultiSelect label="Источники" value={value.source_sites ?? []} onChange={(v)=>set('source_sites', v)} suggestions={SOURCES} />
              <TagMultiSelect label="Фандомы" value={value.fandom ?? []} onChange={(v)=>set('fandom', v)} suggestions={["Гарри Поттер","Звёздные войны","Марвел","Наруто"]} />
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="meta">
          <AccordionTrigger>Метаданные</AccordionTrigger>
          <AccordionContent>
            <div className="grid grid-cols-1 gap-3">
              <div>
                <div className="mb-1 text-muted-foreground">Рейтинг</div>
                <Select value={(value.rating as any) ?? 'all'} onValueChange={(v) => set('rating', v as any)}>
                  <SelectTrigger><SelectValue placeholder="Все рейтинги" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Все</SelectItem>
                    {RATINGS.map((r) => (<SelectItem key={r} value={r}>{r}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <div className="mb-1 text-muted-foreground">Статус</div>
                <Select value={(value.status as any) ?? 'all'} onValueChange={(v) => set('status', v as any)}>
                  <SelectTrigger><SelectValue placeholder="Все статусы" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Все</SelectItem>
                    {STATUSES.map((s) => (<SelectItem key={s} value={s}>{s}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <div className="mb-1 text-muted-foreground">Направленность</div>
                <Select value={(value.category as any) ?? 'all'} onValueChange={(v) => set('category', v as any)}>
                  <SelectTrigger><SelectValue placeholder="Все" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Все</SelectItem>
                    {CATEGORIES.map((c) => (<SelectItem key={c} value={c}>{c}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="tags">
          <AccordionTrigger>Теги и предупреждения</AccordionTrigger>
          <AccordionContent>
            <TagMultiSelect label="Включить теги" value={value.include_tags ?? []} onChange={(v)=>set('include_tags', v)} suggestions={["AU","Slow Burn","Hurt/Comfort","Humor"]} />
            <div className="h-3" />
            <TagMultiSelect label="Исключить теги" value={value.exclude_tags ?? []} onChange={(v)=>set('exclude_tags', v)} suggestions={["Death","Violence","Non-Con"]} />
            <div className="h-3" />
            <TagMultiSelect label="Предупреждения" value={value.warnings ?? []} onChange={(v)=>set('warnings', v)} suggestions={WARNINGS} />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="stats">
          <AccordionTrigger>Статистика</AccordionTrigger>
          <AccordionContent>
            <RangeSlider label="Количество слов" min={0} max={300000} step={1000} value={[value.word_count_min ?? 0, value.word_count_max ?? 300000]} onChange={([a,b])=>{ set('word_count_min', a); set('word_count_max', b) }} />
            <div className="grid grid-cols-2 gap-3 mt-4">
              <Input type="number" placeholder="Мин лайков" value={value.likes_min ?? ''} onChange={(e)=>set('likes_min', e.target.value ? Number(e.target.value) : undefined)} />
              <Input type="number" placeholder="Мин комментариев" value={value.comments_min ?? ''} onChange={(e)=>set('comments_min', e.target.value ? Number(e.target.value) : undefined)} />
            </div>
            <div className="grid grid-cols-2 gap-3 mt-3">
              <Input type="date" value={value.date_updated_after ?? ''} onChange={(e)=>set('date_updated_after', e.target.value)} />
              <Input type="date" value={value.date_updated_before ?? ''} onChange={(e)=>set('date_updated_before', e.target.value)} />
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}
```

### `src/components/fse/ResultsHeader.tsx`
```tsx
'use client'
import * as React from 'react'
import { SortSelect } from './SortSelect'
import type { SortOption } from '@/lib/fse/apiSchema'

export function ResultsHeader({ count, sort, setSort }: { count: number; sort: SortOption; setSort: (v: SortOption) => void }) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
      <div className="text-sm text-muted-foreground">Найдено {count.toLocaleString('ru-RU')} произведений</div>
      <SortSelect value={sort} onChange={setSort} />
    </div>
  )
}
```

---

## 4) Карточки и состояния

### `src/components/fse/WorkCard.tsx` (расширено)
```tsx
'use client'
import * as React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { BookOpen, Calendar, MessageSquare, Star, Bookmark } from 'lucide-react'
import type { Work } from '@/lib/fse/apiSchema'

export function WorkCard({ work, compact = false }: { work: Work; compact?: boolean }) {
  const [saved, setSaved] = React.useState(false)
  const completed = work.status === 'Completed'

  return (
    <Card className={`relative group rounded-2xl ${compact ? 'py-3' : ''}`}>
      <CardContent className={compact ? 'px-4 py-3' : 'p-5'}>
        {/* Bookmark on hover */}
        <button className={`absolute right-4 top-4 transition-opacity ${compact ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`} aria-pressed={saved} aria-label="Добавить в закладки" onClick={()=>setSaved(!saved)}>
          <Bookmark className={`h-5 w-5 ${saved ? 'fill-current' : ''}`} />
        </button>

        <h3 className={`font-semibold leading-snug ${compact ? 'text-base' : 'text-xl'}`}>{work.title}</h3>
        <div className="mt-1 text-sm text-muted-foreground">
          от <a className="hover:underline" href={work.author_url || '#'}>{work.author_name}</a> • {work.fandoms.join(', ')}
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <Badge variant="outline">{work.rating}</Badge>
          {work.warnings?.slice(0,2).map((w)=>(<Badge key={w} variant="destructive">{w}</Badge>))}
          {work.tags.slice(0, 5).map((t) => (
            <Badge key={t} variant="outline" className="rounded-full">{t}</Badge>
          ))}
        </div>

        {!compact && (
          <p className="mt-3 text-sm text-muted-foreground line-clamp-2">{work.summary}</p>
        )}

        <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1"><BookOpen className="h-4 w-4" />{work.word_count.toLocaleString()} слов</span>
          {work.updated_at && (<span className="flex items-center gap-1"><Calendar className="h-4 w-4" />{new Date(work.updated_at).toLocaleDateString('ru-RU')}</span>)}
          {typeof work.likes_count === 'number' && (<span className="flex items-center gap-1"><Star className="h-4 w-4" />{work.likes_count}</span>)}
          {typeof work.comments_count === 'number' && (<span className="flex items-center gap-1"><MessageSquare className="h-4 w-4" />{work.comments_count}</span>)}
        </div>

        <div className="absolute right-5 bottom-5">
          {completed ? (<Badge className="bg-black text-white">Завершён</Badge>) : (<Badge variant="secondary">В процессе</Badge>)}
        </div>
      </CardContent>
    </Card>
  )
}
```

### Пустые и загрузочные состояния

`src/components/fse/EmptyState.tsx`
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

`src/components/fse/Skeletons.tsx`
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

### Список результатов

`src/components/fse/ResultsList.tsx`
```tsx
'use client'
import * as React from 'react'
import { WorkCard } from './WorkCard'
import { WorkCardSkeleton } from './Skeletons'
import { EmptyState } from './EmptyState'
import type { Work } from '@/lib/fse/apiSchema'

export function ResultsList({ items, loading }: { items: Work[]; loading?: boolean }) {
  if (loading) {
    return (
      <div className="space-y-4">{Array.from({length:6}).map((_,i)=>(<WorkCardSkeleton key={i} />))}</div>
    )
  }
  if (!items.length) return <EmptyState />
  return (
    <div className="space-y-4">
      {items.map((w) => (<WorkCard key={w.id} work={w} />))}
    </div>
  )
}
```

---

## 5) Читалка (Reader) — контекст настроек

### `src/components/fse/Reader/ReaderContext.tsx`
```tsx
'use client'
import * as React from 'react'

type ReaderSettings = { fontSize: number; fontFamily: 'serif'|'sans'|'mono'; theme: 'light'|'dark'|'sepia' }
const defaultSettings: ReaderSettings = { fontSize: 18, fontFamily: 'serif', theme: 'light' }

export const ReaderCtx = React.createContext({
  settings: defaultSettings,
  setSettings: (_: Partial<ReaderSettings>) => {},
})

export function ReaderProvider({ children }: { children: React.ReactNode }) {
  const [settings, set] = React.useState<ReaderSettings>(() => {
    if (typeof window !== 'undefined') {
      try { return JSON.parse(localStorage.getItem('reader-settings') || 'null') || defaultSettings } catch {}
    }
    return defaultSettings
  })
  function setSettings(patch: Partial<ReaderSettings>) {
    const next = { ...settings, ...patch }
    set(next)
    if (typeof window !== 'undefined') localStorage.setItem('reader-settings', JSON.stringify(next))
  }
  return (
    <ReaderCtx.Provider value={{ settings, setSettings }}>{children}</ReaderCtx.Provider>
  )
}
```

### `src/components/fse/Reader/ReaderShell.tsx` (применение настроек)
```tsx
'use client'
import * as React from 'react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Settings, ChevronLeft, ChevronRight, Globe, Headphones } from 'lucide-react'
import { ReaderSettings as SettingsDialog } from './ReaderSettings'
import { ReaderCtx } from './ReaderContext'

export type ReaderShellProps = {
  title: string
  author: string
  chapterTitles: string[]
  currentIndex: number
  onChangeChapter: (idx: number) => void
  onBack?: () => void
  onTranslate?: () => void
  onTTS?: () => void
  contentHtml: string
}

export function ReaderShell(props: ReaderShellProps) {
  const { title, author, chapterTitles, currentIndex, onChangeChapter, onBack, onTranslate, onTTS, contentHtml } = props
  const [openSettings, setOpenSettings] = React.useState(false)
  const { settings } = React.useContext(ReaderCtx)

  const contentStyle: React.CSSProperties = {
    fontSize: settings.fontSize,
    fontFamily: settings.fontFamily === 'serif' ? 'Georgia, serif' : settings.fontFamily === 'mono' ? 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace' : 'Inter, ui-sans-serif, system-ui',
    background: settings.theme === 'sepia' ? '#f6f1e1' : undefined,
  }

  return (
    <div className={`min-h-screen ${settings.theme === 'dark' ? 'dark' : ''} bg-background text-foreground`}>
      <div className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur">
        <div className="mx-auto max-w-5xl px-4 py-3 flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onBack}><ChevronLeft className="h-4 w-4" />Назад</Button>
          <div className="flex-1">
            <div className="font-semibold leading-tight">{title}</div>
            <div className="text-xs text-muted-foreground">от <a className="hover:underline" href="#">{author}</a></div>
          </div>
          <Button variant="ghost" size="sm" onClick={onTranslate}><Globe className="h-4 w-4" />Перевести</Button>
          <Button variant="ghost" size="sm" onClick={onTTS}><Headphones className="h-4 w-4" />Озвучить</Button>
          <Button variant="outline" size="sm" onClick={() => setOpenSettings(true)}><Settings className="h-4 w-4" />Настройки</Button>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-6 prose dark:prose-invert" style={contentStyle}>
        <div dangerouslySetInnerHTML={{ __html: contentHtml }} />
      </div>

      <Separator />
      <div className="mx-auto max-w-5xl px-4 py-3 flex flex-wrap items-center gap-3">
        <Button variant="secondary" size="sm" onClick={() => onChangeChapter(Math.max(0, currentIndex - 1))}><ChevronLeft className="h-4 w-4" />Предыдущая</Button>
        <Select value={String(currentIndex)} onValueChange={(v) => onChangeChapter(Number(v))}>
          <SelectTrigger className="w-[220px]"><SelectValue placeholder="Выбрать главу" /></SelectTrigger>
          <SelectContent>
            {chapterTitles.map((t, i) => (<SelectItem key={i} value={String(i)}>{`Глава ${i + 1}: ${t}`}</SelectItem>))}
          </SelectContent>
        </Select>
        <div className="text-sm text-muted-foreground">Глава {currentIndex + 1} из {chapterTitles.length}</div>
        <Button variant="secondary" size="sm" onClick={() => onChangeChapter(Math.min(chapterTitles.length - 1, currentIndex + 1))}>Следующая<ChevronRight className="h-4 w-4" /></Button>
      </div>

      <SettingsDialog open={openSettings} onOpenChange={setOpenSettings} />
    </div>
  )
}
```

### `src/components/fse/Reader/ReaderSettings.tsx` (без изменений из предыдущего пакета, совместимо)

---

## 6) Хедер результатов — объединение поиска/сортировки

`src/components/fse/ResultsHeader.tsx` уже дан выше. В сторисах показываем связку с `SearchBar` и `SortSelect`.

---

## 7) Storybook: декораторы и интро

### `.storybook/preview.tsx` (дополнено)
```tsx
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

### `src/stories/fse/Intro.mdx`
```mdx
import { Meta } from '@storybook/blocks'

<Meta title="FSE/Intro" />

# FSE Компоненты

Этот раздел покрывает поиск, карточки результатов и читалку. Все поля и фильтры соответствуют ТЗ. Для сетевых запросов используется мок‑API через MSW.
```

---

## 8) Stories (дополнено)

### `src/stories/fse/ResultsHeader.stories.tsx`
```tsx
import type { Meta, StoryObj } from '@storybook/react'
import { ResultsHeader } from '@/components/fse/ResultsHeader'
import { useState } from 'react'
import type { SortOption } from '@/lib/fse/apiSchema'

const meta: Meta<typeof ResultsHeader> = { title: 'FSE/ResultsHeader', component: ResultsHeader }
export default meta

export const Default: StoryObj<typeof ResultsHeader> = {
  render: () => {
    const [sort, setSort] = useState<SortOption>('relevance')
    return <ResultsHeader count={1234} sort={sort} setSort={setSort} />
  },
}
```

### `src/stories/fse/EmptyAndSkeleton.stories.tsx`
```tsx
import type { Meta, StoryObj } from '@storybook/react'
import { EmptyState } from '@/components/fse/EmptyState'
import { WorkCardSkeleton } from '@/components/fse/Skeletons'

const meta: Meta = { title: 'FSE/States' }
export default meta

export const Empty: StoryObj = { render: () => <EmptyState /> }
export const Skeletons: StoryObj = { render: () => <div className="space-y-4">{Array.from({length:3}).map((_,i)=>(<WorkCardSkeleton key={i}/>))}</div> }
```

Остальные stories из предыдущего пакета остаются без изменений.

---

## 9) MSW мок‑API (опционально)

### `mocks/data/works.json`
```json
{
  "total_pages": 3,
  "current_page": 1,
  "results": [
    {
      "id": "work_123",
      "title": "Тени прошлого",
      "author_name": "АвторПример",
      "summary": "История о том, как прошлое может настигнуть...",
      "language": "ru",
      "fandoms": ["Гарри Поттер"],
      "tags": ["Драма","Приключения","Дружба"],
      "rating": "PG-13",
      "status": "Completed",
      "word_count": 45000,
      "likes_count": 234,
      "comments_count": 67,
      "updated_at": "2024-01-15"
    }
  ]
}
```

### `mocks/handlers.ts`
```ts
import { http, HttpResponse } from 'msw'
import mock from './data/works.json'

export const handlers = [
  http.post('/api/v1/works/search', async ({ request }) => {
    // Можно разбирать body и менять результаты в зависимости от фильтров
    return HttpResponse.json(mock)
  }),
]
```

> Подключение: в `preview.tsx` (см. выше) используется `msw-storybook-addon` → автоматически подхватит `handlers` (если экспортировать их из `mocks/handlers.ts` и импортировать в сторис через `parameters.msw`).

Пример использования в сторис:
```tsx
export const WithApi = {
  parameters: { msw: { handlers: (await import('../../../mocks/handlers')).handlers } },
  // render: ... вызываем searchWorks и показываем ResultsList с loading
}
```

---

## 10) Быстрый пример страницы результатов для интеграции

```tsx
// src/stories/fse/ResultsPage.stories.tsx
import type { Meta, StoryObj } from '@storybook/react'
import { useEffect, useState } from 'react'
import { SearchBar } from '@/components/fse/SearchBar'
import { ResultsHeader } from '@/components/fse/ResultsHeader'
import { ResultsList } from '@/components/fse/ResultsList'
import type { SearchFilters, SortOption, Work } from '@/lib/fse/apiSchema'
import { searchWorks } from '@/lib/fse/searchApi'

const meta: Meta = { title: 'FSE/ResultsPage' }
export default meta

export const Page: StoryObj = {
  render: () => {
    const [filters, setFilters] = useState<SearchFilters>({})
    const [sort, setSort] = useState<SortOption>('relevance')
    const [items, setItems] = useState<Work[]>([])
    const [loading, setLoading] = useState(false)

    useEffect(() => {
      setLoading(true)
      searchWorks({ ...filters, sort }).then((r) => setItems(r.results)).finally(()=>setLoading(false))
    }, [filters, sort])

    return (
      <div className="space-y-6">
        <SearchBar filters={filters} onChange={setFilters} />
        <ResultsHeader count={items.length} sort={sort} setSort={setSort} />
        <ResultsList items={items} loading={loading} />
      </div>
    )
  },
}
```

---

## 11) QA‑чеклист для компонентов
- A11y: навигация по табу, aria‑labels на интерактивных элементах, видимые focus‑ring
- Скелеты + пустые состояния в каждой stories
- Контролы Storybook: props/argTypes для основных параметров
- Кросс‑браузер: проверка тёмной темы, длинных тегов/названий, больших чисел слов
- Производительность: списки — без тяжёлых изображений, мемоизация where applicable

---

Готово: пакет покрывает все ключевые части ТЗ, а также добавляет расширенные контролы (TagMultiSelect, RangeSlider), состояния (empty/loading) и контекст настроек читалки с сохранением в LocalStorage. Если хочешь — могу собрать **готовую ветку** с этой структурой и PR‑шаблоном для код‑ревью.

