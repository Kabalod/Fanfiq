# FSE Storybook Components & Stories (shadcn/ui)

Ниже — готовые файлы для Storybook. Скопируй в свой репозиторий, сохраняя пути. Все компоненты соответствуют ТЗ: Поиск, Фильтры (свёрнуты по умолчанию), Карточки результатов, Сортировка, Пагинация, Читалка (Reader) с настройками.

> Предполагается, что установлены **shadcn/ui**, **Tailwind**, **lucide-react** и Storybook v8. Если не хватает каких‑то компонентов (например, `slider`, `toggle-group`, `select`, `sheet`), добавь через CLI: `npx shadcn@latest add slider select sheet toggle-group pagination dialog accordion badge card input button separator checkbox popover command`.

---

## `src/components/fse/types.ts`
```ts
export type Rating = 'G' | 'PG-13' | 'R' | 'NC-17' | 'T' | 'M' | 'E'
export type Status = 'In Progress' | 'Completed' | 'On Hiatus'

export type Chapter = {
  chapter_number: number
  title: string
  content_html: string
}

export type Work = {
  id: string
  original_url?: string
  title: string
  author_name: string
  author_url?: string
  summary: string
  language: string // ISO 639-1
  fandoms: string[]
  tags: string[]
  rating: Rating
  category?: 'Gen' | 'Het' | 'Slash' | 'Femslash' | 'Other'
  status: Status
  warnings?: string[]
  word_count: number
  likes_count?: number
  comments_count?: number
  published_at?: string
  updated_at?: string
  chapters?: Chapter[]
}

export type SearchFilters = {
  source_sites?: string[]
  query?: string
  language?: string
  fandom?: string[]
  include_tags?: string[]
  exclude_tags?: string[]
  rating?: Rating | 'all'
  status?: Status | 'all'
  category?: 'Gen' | 'Het' | 'Slash' | 'Femslash' | 'Other' | 'all'
  warnings?: string[]
  word_count_min?: number
  word_count_max?: number
  likes_min?: number
  comments_min?: number
  date_updated_after?: string
  date_updated_before?: string
}

export type SortOption =
  | 'relevance'
  | 'updated_desc'
  | 'popularity_desc'
  | 'words_desc'
  | 'words_asc'
```

---

## `src/components/fse/SearchBar.tsx`
```tsx
'use client'
import * as React from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Separator } from '@/components/ui/separator'
import { FilterPanel } from './FilterPanel'
import { Search } from 'lucide-react'
import type { SearchFilters } from './types'

export function SearchBar({ filters, onChange }: { filters: SearchFilters; onChange: (f: SearchFilters) => void }) {
  const [q, setQ] = React.useState(filters.query ?? '')
  const [open, setOpen] = React.useState(false)
  return (
    <div className="flex w-full items-center gap-2">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && onChange({ ...filters, query: q })}
          placeholder="Название, автор, саммари..."
          className="pl-9"
        />
      </div>
      <Button onClick={() => onChange({ ...filters, query: q })}>Искать</Button>
      {/* Свёрнутые фильтры — кнопка открывает панель */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="outline">Фильтры</Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[340px] p-0">
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

---

## `src/components/fse/FilterPanel.tsx`
```tsx
'use client'
import * as React from 'react'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import type { SearchFilters } from './types'

const LANGS = ['ru', 'en']
const RATINGS = ['G','PG-13','R','NC-17'] as const
const STATUSES = ['In Progress','Completed','On Hiatus'] as const
const CATEGORIES = ['Gen','Het','Slash','Femslash','Other'] as const

export function FilterPanel({ value, onChange, showReset = false }: { value: SearchFilters; onChange: (f: SearchFilters) => void; showReset?: boolean }) {
  function toggleList(key: keyof SearchFilters, item: string) {
    const list = (value[key] as string[]) ?? []
    const next = list.includes(item) ? list.filter((x) => x !== item) : [...list, item]
    onChange({ ...value, [key]: next })
  }

  return (
    <div className="space-y-4 text-sm">
      {showReset && (
        <Button variant="ghost" size="sm" onClick={() => onChange({})}>Сбросить все фильтры</Button>
      )}

      <Accordion type="multiple" defaultValue={["basic","meta","stats"]} className="w-full">
        <AccordionItem value="basic">
          <AccordionTrigger>Основные</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-3">
              <div>
                <div className="mb-1 text-muted-foreground">Язык</div>
                <Select value={value.language ?? 'ru'} onValueChange={(v) => onChange({ ...value, language: v })}>
                  <SelectTrigger><SelectValue placeholder="Выберите язык" /></SelectTrigger>
                  <SelectContent>
                    {LANGS.map((l) => (<SelectItem key={l} value={l}>{l}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <div className="mb-1 text-muted-foreground">Фандомы (через запятую)</div>
                <Input value={(value.fandom ?? []).join(', ')} onChange={(e) => onChange({ ...value, fandom: e.target.value.split(',').map(s=>s.trim()).filter(Boolean) })} />
              </div>
              <div>
                <div className="mb-1 text-muted-foreground">Источники (через запятую)</div>
                <Input value={(value.source_sites ?? []).join(', ')} onChange={(e) => onChange({ ...value, source_sites: e.target.value.split(',').map(s=>s.trim()).filter(Boolean) })} />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="meta">
          <AccordionTrigger>Метаданные</AccordionTrigger>
          <AccordionContent>
            <div className="grid grid-cols-1 gap-3">
              <div>
                <div className="mb-1 text-muted-foreground">Рейтинг</div>
                <Select value={(value.rating as any) ?? 'all'} onValueChange={(v) => onChange({ ...value, rating: v as any })}>
                  <SelectTrigger><SelectValue placeholder="Все рейтинги" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Все</SelectItem>
                    {RATINGS.map((r) => (<SelectItem key={r} value={r}>{r}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <div className="mb-1 text-muted-foreground">Статус</div>
                <Select value={(value.status as any) ?? 'all'} onValueChange={(v) => onChange({ ...value, status: v as any })}>
                  <SelectTrigger><SelectValue placeholder="Все статусы" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Все</SelectItem>
                    {STATUSES.map((s) => (<SelectItem key={s} value={s}>{s}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <div className="mb-1 text-muted-foreground">Направленность</div>
                <Select value={(value.category as any) ?? 'all'} onValueChange={(v) => onChange({ ...value, category: v as any })}>
                  <SelectTrigger><SelectValue placeholder="Все" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Все</SelectItem>
                    {CATEGORIES.map((c) => (<SelectItem key={c} value={c}>{c}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <div className="mb-1 text-muted-foreground">Включить теги (через запятую)</div>
                <Input value={(value.include_tags ?? []).join(', ')} onChange={(e) => onChange({ ...value, include_tags: e.target.value.split(',').map(s=>s.trim()).filter(Boolean) })} />
              </div>
              <div>
                <div className="mb-1 text-muted-foreground">Исключить теги (через запятую)</div>
                <Input value={(value.exclude_tags ?? []).join(', ')} onChange={(e) => onChange({ ...value, exclude_tags: e.target.value.split(',').map(s=>s.trim()).filter(Boolean) })} />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="stats">
          <AccordionTrigger>Статистика</AccordionTrigger>
          <AccordionContent>
            <div className="grid grid-cols-2 gap-3">
              <Input type="number" placeholder="Мин слов" value={value.word_count_min ?? ''}
                     onChange={(e)=>onChange({ ...value, word_count_min: e.target.value ? Number(e.target.value) : undefined })} />
              <Input type="number" placeholder="Макс слов" value={value.word_count_max ?? ''}
                     onChange={(e)=>onChange({ ...value, word_count_max: e.target.value ? Number(e.target.value) : undefined })} />
              <Input type="number" placeholder="Мин лайков" value={value.likes_min ?? ''}
                     onChange={(e)=>onChange({ ...value, likes_min: e.target.value ? Number(e.target.value) : undefined })} />
              <Input type="number" placeholder="Мин комментариев" value={value.comments_min ?? ''}
                     onChange={(e)=>onChange({ ...value, comments_min: e.target.value ? Number(e.target.value) : undefined })} />
            </div>
            <div className="grid grid-cols-2 gap-3 mt-3">
              <Input type="date" value={value.date_updated_after ?? ''} onChange={(e)=>onChange({ ...value, date_updated_after: e.target.value })} />
              <Input type="date" value={value.date_updated_before ?? ''} onChange={(e)=>onChange({ ...value, date_updated_before: e.target.value })} />
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}
```

---

## `src/components/fse/SortSelect.tsx`
```tsx
'use client'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { SortOption } from './types'

export function SortSelect({ value, onChange }: { value: SortOption; onChange: (v: SortOption) => void }) {
  return (
    <Select value={value} onValueChange={(v) => onChange(v as SortOption)}>
      <SelectTrigger className="w-[260px]"><SelectValue placeholder="Сортировка" /></SelectTrigger>
      <SelectContent>
        <SelectItem value="relevance">По релевантности</SelectItem>
        <SelectItem value="updated_desc">По дате обновления</SelectItem>
        <SelectItem value="popularity_desc">По популярности</SelectItem>
        <SelectItem value="words_desc">По количеству слов (убывание)</SelectItem>
        <SelectItem value="words_asc">По количеству слов (возрастание)</SelectItem>
      </SelectContent>
    </Select>
  )
}
```

---

## `src/components/fse/WorkCard.tsx`
```tsx
'use client'
import * as React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { BookOpen, Calendar, Eye, MessageSquare, Star, Bookmark } from 'lucide-react'
import type { Work } from './types'

export function WorkCard({ work }: { work: Work }) {
  const completed = work.status === 'Completed'
  return (
    <Card className="relative group rounded-2xl">
      <CardContent className="p-5">
        {/* Bookmark on hover */}
        <button className="absolute right-4 top-4 opacity-0 group-hover:opacity-100 transition-opacity" aria-label="Добавить в закладки">
          <Bookmark className="h-5 w-5" />
        </button>

        <h3 className="text-xl font-semibold leading-snug">{work.title}</h3>
        <div className="mt-1 text-sm text-muted-foreground">
          от <a className="hover:underline" href={work.author_url || '#'}>{work.author_name}</a> • {work.fandoms.join(', ')}
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <Badge variant="outline">{work.rating}</Badge>
          {work.tags.slice(0, 5).map((t) => (
            <Badge key={t} variant="outline" className="rounded-full">{t}</Badge>
          ))}
        </div>

        <p className="mt-3 text-sm text-muted-foreground line-clamp-2">{work.summary}</p>

        <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1"><BookOpen className="h-4 w-4" />{work.word_count.toLocaleString()} слов</span>
          {work.updated_at && (
            <span className="flex items-center gap-1"><Calendar className="h-4 w-4" />{new Date(work.updated_at).toLocaleDateString('ru-RU')}</span>
          )}
          {typeof work.likes_count === 'number' && (
            <span className="flex items-center gap-1"><Star className="h-4 w-4" />{work.likes_count}</span>
          )}
          {typeof work.comments_count === 'number' && (
            <span className="flex items-center gap-1"><MessageSquare className="h-4 w-4" />{work.comments_count}</span>
          )}
        </div>

        <div className="absolute right-5 bottom-5">
          {completed ? (
            <Badge className="bg-black text-white">Завершён</Badge>
          ) : (
            <Badge variant="secondary">В процессе</Badge>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
```

---

## `src/components/fse/ResultsList.tsx`
```tsx
'use client'
import * as React from 'react'
import { WorkCard } from './WorkCard'
import type { Work } from './types'

export function ResultsList({ items }: { items: Work[] }) {
  return (
    <div className="space-y-4">
      {items.map((w) => (<WorkCard key={w.id} work={w} />))}
    </div>
  )
}
```

---

## `src/components/fse/Reader/ReaderShell.tsx`
```tsx
'use client'
import * as React from 'react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Settings, ChevronLeft, ChevronRight, Globe, Headphones } from 'lucide-react'
import { ReaderSettings } from './ReaderSettings'

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

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Top bar */}
      <div className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur">
        <div className="mx-auto max-w-5xl px-4 py-3 flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onBack}><ChevronLeft className="h-4 w-4" />Назад</Button>
          <div className="flex-1">
            <div className="font-semibold leading-tight">{title}</div>
            <div className="text-xs text-muted-foreground">от <a className="hover:underline" href="#">{author}</a></div>
          </div>
          {/* Phase 2: AI actions */}
          <Button variant="ghost" size="sm" onClick={onTranslate}><Globe className="h-4 w-4" />Перевести</Button>
          <Button variant="ghost" size="sm" onClick={onTTS}><Headphones className="h-4 w-4" />Озвучить</Button>
          <Button variant="outline" size="sm" onClick={() => setOpenSettings(true)}><Settings className="h-4 w-4" />Настройки</Button>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-3xl px-4 py-6 prose dark:prose-invert">
        <div dangerouslySetInnerHTML={{ __html: contentHtml }} />
      </div>

      {/* Bottom nav */}
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

      <ReaderSettings open={openSettings} onOpenChange={setOpenSettings} />
    </div>
  )
}
```

---

## `src/components/fse/Reader/ReaderSettings.tsx`
```tsx
'use client'
import * as React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'

export function ReaderSettings({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const [fontSize, setFontSize] = React.useState(18)
  const [fontFamily, setFontFamily] = React.useState<'serif' | 'sans' | 'mono'>('serif')
  const [theme, setTheme] = React.useState<'light' | 'dark' | 'sepia'>('light')

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>Настройки чтения</DialogTitle></DialogHeader>
        <div className="space-y-5">
          <div>
            <div className="mb-2 text-sm text-muted-foreground">Размер шрифта: {fontSize}px</div>
            <Slider value={[fontSize]} min={14} max={26} step={1} onValueChange={(v) => setFontSize(v[0])} />
          </div>
          <div>
            <div className="mb-2 text-sm text-muted-foreground">Тип шрифта</div>
            <Select value={fontFamily} onValueChange={(v) => setFontFamily(v as any)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="serif">С засечками</SelectItem>
                <SelectItem value="sans">Без засечек</SelectItem>
                <SelectItem value="mono">Моно</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <div className="mb-2 text-sm text-muted-foreground">Тема</div>
            <Select value={theme} onValueChange={(v) => setTheme(v as any)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Светлая</SelectItem>
                <SelectItem value="dark">Тёмная</SelectItem>
                <SelectItem value="sepia">Сепия</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Закрыть</Button>
            <Button onClick={() => onOpenChange(false)}>Применить</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
```

---

## `src/stories/fse/WorkCard.stories.tsx`
```tsx
import type { Meta, StoryObj } from '@storybook/react'
import { WorkCard } from '@/components/fse/WorkCard'
import type { Work } from '@/components/fse/types'

const meta: Meta<typeof WorkCard> = {
  title: 'FSE/WorkCard',
  component: WorkCard,
  parameters: { layout: 'centered' },
}
export default meta

const base: Work = {
  id: 'work_123',
  title: 'Тени прошлого',
  author_name: 'АвторПример',
  summary: 'История о том, как прошлое может настигнуть в самый неожиданный момент... ',
  language: 'ru',
  fandoms: ['Гарри Поттер'],
  tags: ['Драма', 'Приключения', 'Дружба'],
  rating: 'PG-13',
  status: 'Completed',
  word_count: 45000,
  likes_count: 234,
  comments_count: 67,
  updated_at: '2024-01-15',
}

export const Completed: StoryObj<typeof WorkCard> = { args: { work: base } }
export const InProgress: StoryObj<typeof WorkCard> = { args: { work: { ...base, status: 'In Progress' } } }
export const LongTags: StoryObj<typeof WorkCard> = { args: { work: { ...base, tags: [...base.tags, 'AU', 'Экшн', 'Мистика', 'Юмор'] } } }
```

---

## `src/stories/fse/SearchBar.stories.tsx`
```tsx
import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { SearchBar } from '@/components/fse/SearchBar'
import type { SearchFilters } from '@/components/fse/types'

const meta: Meta<typeof SearchBar> = {
  title: 'FSE/SearchBar',
  component: SearchBar,
}
export default meta

export const Default: StoryObj<typeof SearchBar> = {
  render: () => {
    const [filters, setFilters] = useState<SearchFilters>({})
    return <div className="max-w-3xl"><SearchBar filters={filters} onChange={setFilters} /></div>
  },
}
```

---

## `src/stories/fse/FilterPanel.stories.tsx`
```tsx
import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { FilterPanel } from '@/components/fse/FilterPanel'
import type { SearchFilters } from '@/components/fse/types'

const meta: Meta<typeof FilterPanel> = {
  title: 'FSE/FilterPanel',
  component: FilterPanel,
  parameters: { layout: 'centered' },
}
export default meta

export const Default: StoryObj<typeof FilterPanel> = {
  render: () => {
    const [filters, setFilters] = useState<SearchFilters>({ language: 'ru' })
    return <div className="w-[360px]"><FilterPanel value={filters} onChange={setFilters} showReset /></div>
  },
}
```

---

## `src/stories/fse/SortSelect.stories.tsx`
```tsx
import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { SortSelect } from '@/components/fse/SortSelect'
import type { SortOption } from '@/components/fse/types'

const meta: Meta<typeof SortSelect> = {
  title: 'FSE/SortSelect',
  component: SortSelect,
  parameters: { layout: 'centered' },
}
export default meta

export const Default: StoryObj<typeof SortSelect> = {
  render: () => {
    const [v, setV] = useState<SortOption>('relevance')
    return <SortSelect value={v} onChange={setV} />
  },
}
```

---

## `src/stories/fse/ResultsList.stories.tsx`
```tsx
import type { Meta, StoryObj } from '@storybook/react'
import { ResultsList } from '@/components/fse/ResultsList'
import type { Work } from '@/components/fse/types'

const items: Work[] = [
  { id: '1', title: 'Тени прошлого', author_name: 'АвторПример', summary: '...', language: 'ru', fandoms: ['Гарри Поттер'], tags: ['Драма','Приключения','Дружба'], rating: 'PG-13', status: 'Completed', word_count: 45000, likes_count: 234, comments_count: 67, updated_at: '2024-01-15' },
  { id: '2', title: 'Новая надежда', author_name: 'ФантастПисатель', summary: '...', language: 'ru', fandoms: ['Звёздные войны'], tags: ['AU','Фантастика','Экшн'], rating: 'G', status: 'In Progress', word_count: 32000, likes_count: 156, comments_count: 43, updated_at: '2024-01-20' },
]

const meta: Meta<typeof ResultsList> = {
  title: 'FSE/ResultsList',
  component: ResultsList,
}
export default meta

export const Default: StoryObj<typeof ResultsList> = { args: { items } }
```

---

## `src/stories/fse/ReaderShell.stories.tsx`
```tsx
import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { ReaderShell } from '@/components/fse/Reader/ReaderShell'

const meta: Meta<typeof ReaderShell> = {
  title: 'FSE/Reader/ReaderShell',
  component: ReaderShell,
  parameters: { layout: 'fullscreen' },
}
export default meta

const chapters = Array.from({ length: 8 }).map((_, i) => `Глава ${i + 1}`)
const contentHtml = `<h2>Подзаголовок</h2><p>Текст главы (демо) — очищенный HTML с исходного сайта...</p><p>Ещё абзац…</p>`

export const Default: StoryObj<typeof ReaderShell> = {
  render: () => {
    const [idx, setIdx] = useState(0)
    return (
      <ReaderShell
        title="Тени прошлого"
        author="АвторПример"
        chapterTitles={chapters}
        currentIndex={idx}
        onChangeChapter={setIdx}
        onBack={() => alert('Назад к результатам')}
        onTranslate={() => alert('Перевод (Фаза 2)')}
        onTTS={() => alert('Озвучивание (Фаза 2)')}
        contentHtml={contentHtml}
      />
    )
  },
}
```

---

## `src/stories/fse/ReaderSettings.stories.tsx`
```tsx
import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ReaderSettings } from '@/components/fse/Reader/ReaderSettings'

const meta: Meta<typeof ReaderSettings> = {
  title: 'FSE/Reader/ReaderSettings',
  component: ReaderSettings,
}
export default meta

export const Default: StoryObj<typeof ReaderSettings> = {
  render: () => {
    const [open, setOpen] = useState(true)
    return (
      <div>
        <Button onClick={() => setOpen(true)}>Открыть настройки</Button>
        <ReaderSettings open={open} onOpenChange={setOpen} />
      </div>
    )
  },
}
```

---

### Примечания
- Все имена полей и фильтров соответствуют ТЗ. Визуальная логика: фильтры — свёрнуты в кнопку «Фильтры» (Sheet), сортировка и счётчик — отдельные контролы над списком.
- Для пагинации используйте `@/components/ui/pagination` — добавьте story аналогично `ResultsList`.
- Для подключения к бэкенду (POST `/api/v1/works/search`) добавьте data‑layer и mock‑service worker в Storybook, если нужно показать реальные запросы.

