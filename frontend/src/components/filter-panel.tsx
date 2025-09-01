'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { SearchFilters, WorkRating, WorkCategory, WorkStatus, SortField, SortOrder } from "@/lib/api/schemas"
import { Filter, RotateCcw } from "lucide-react"

interface FilterPanelProps {
  filters: SearchFilters
  onFiltersChange: (filters: SearchFilters) => void
  onApplyFilters: () => void
}

const ratingOptions: { value: WorkRating; label: string; color: string }[] = [
  { value: 'G', label: 'G', color: 'bg-green-100 text-green-800' },
  { value: 'PG-13', label: 'PG-13', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'R', label: 'R', color: 'bg-orange-100 text-orange-800' },
  { value: 'NC-17', label: 'NC-17', color: 'bg-red-100 text-red-800' },
  { value: 'NC-21', label: 'NC-21', color: 'bg-purple-100 text-purple-800' },
]

const categoryOptions: { value: WorkCategory; label: string }[] = [
  { value: 'gen', label: 'Джен' },
  { value: 'het', label: 'Гет' },
  { value: 'slash', label: 'Слэш' },
  { value: 'femslash', label: 'Фемслэш' },
  { value: 'mixed', label: 'Смешанная' },
  { value: 'other', label: 'Другое' },
  { value: 'article', label: 'Статья' },
]

const statusOptions: { value: WorkStatus; label: string }[] = [
  { value: 'completed', label: 'Завершён' },
  { value: 'in_progress', label: 'В процессе' },
  { value: 'frozen', label: 'Заморожен' },
]

const warningOptions = [
  'Насилие',
  'Смерть персонажа',
  'Суицид',
  'Сексуальное насилие',
  'Болезни',
  'СПИД',
  'Рак',
  'Психические расстройства',
]

const sortOptions: { value: SortField; label: string }[] = [
  { value: 'relevance', label: 'Релевантность' },
  { value: 'updated', label: 'Дата обновления' },
  { value: 'created', label: 'Дата создания' },
  { value: 'title', label: 'Название' },
  { value: 'kudos', label: 'Лайки' },
  { value: 'comments', label: 'Комментарии' },
  { value: 'word_count', label: 'Количество слов' },
]

export function FilterPanel({ filters, onFiltersChange, onApplyFilters }: FilterPanelProps) {
  const [tagInput, setTagInput] = useState('')
  const [fandomInput, setFandomInput] = useState('')

  const updateFilters = (updates: Partial<SearchFilters>) => {
    onFiltersChange({ ...filters, ...updates })
  }

  const toggleRating = (rating: WorkRating) => {
    const current = filters.rating || []
    const updated = current.includes(rating)
      ? current.filter(r => r !== rating)
      : [...current, rating]
    updateFilters({ rating: updated.length > 0 ? updated : undefined })
  }

  const toggleCategory = (category: WorkCategory) => {
    const current = filters.category || []
    const updated = current.includes(category)
      ? current.filter(c => c !== category)
      : [...current, category]
    updateFilters({ category: updated.length > 0 ? updated : undefined })
  }

  const toggleStatus = (status: WorkStatus) => {
    const current = filters.status || []
    const updated = current.includes(status)
      ? current.filter(s => s !== status)
      : [...current, status]
    updateFilters({ status: updated.length > 0 ? updated : undefined })
  }

  const toggleWarning = (warning: string) => {
    const current = filters.warnings || []
    const updated = current.includes(warning)
      ? current.filter(w => w !== warning)
      : [...current, warning]
    updateFilters({ warnings: updated.length > 0 ? updated : undefined })
  }

  const addTag = () => {
    if (!tagInput.trim()) return
    const current = filters.tags || []
    if (!current.includes(tagInput.trim())) {
      updateFilters({ tags: [...current, tagInput.trim()] })
    }
    setTagInput('')
  }

  const removeTag = (tag: string) => {
    const current = filters.tags || []
    updateFilters({ tags: current.filter(t => t !== tag) })
  }

  const addFandom = () => {
    if (!fandomInput.trim()) return
    const current = filters.fandoms || []
    if (!current.includes(fandomInput.trim())) {
      updateFilters({ fandoms: [...current, fandomInput.trim()] })
    }
    setFandomInput('')
  }

  const removeFandom = (fandom: string) => {
    const current = filters.fandoms || []
    updateFilters({ fandoms: current.filter(f => f !== fandom) })
  }

  const clearAllFilters = () => {
    onFiltersChange({
      page: 1,
      page_size: 20,
    })
  }

  const hasActiveFilters = !!(
    filters.rating?.length ||
    filters.category?.length ||
    filters.status?.length ||
    filters.warnings?.length ||
    filters.tags?.length ||
    filters.fandoms?.length ||
    filters.word_count_min ||
    filters.word_count_max
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Фильтры
          {hasActiveFilters && (
            <Badge variant="secondary" className="ml-2">
              {[
                filters.rating?.length || 0,
                filters.category?.length || 0,
                filters.status?.length || 0,
                filters.warnings?.length || 0,
                filters.tags?.length || 0,
                filters.fandoms?.length || 0,
                (filters.word_count_min || filters.word_count_max) ? 1 : 0
              ].reduce((a, b) => a + b, 0)}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent>
        <Accordion type="multiple" className="w-full">
          {/* Рейтинг */}
          <AccordionItem value="rating">
            <AccordionTrigger>Рейтинг</AccordionTrigger>
            <AccordionContent>
              <div className="flex flex-wrap gap-2">
                {ratingOptions.map((option) => (
                  <Button
                    key={option.value}
                    variant={filters.rating?.includes(option.value) ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleRating(option.value)}
                    className={filters.rating?.includes(option.value) ? option.color : ''}
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Категория */}
          <AccordionItem value="category">
            <AccordionTrigger>Категория</AccordionTrigger>
            <AccordionContent>
              <div className="grid grid-cols-2 gap-2">
                {categoryOptions.map((option) => (
                  <div key={option.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={`category-${option.value}`}
                      checked={filters.category?.includes(option.value) || false}
                      onCheckedChange={() => toggleCategory(option.value)}
                    />
                    <Label htmlFor={`category-${option.value}`} className="text-sm">
                      {option.label}
                    </Label>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Статус */}
          <AccordionItem value="status">
            <AccordionTrigger>Статус</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2">
                {statusOptions.map((option) => (
                  <div key={option.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={`status-${option.value}`}
                      checked={filters.status?.includes(option.value) || false}
                      onCheckedChange={() => toggleStatus(option.value)}
                    />
                    <Label htmlFor={`status-${option.value}`} className="text-sm">
                      {option.label}
                    </Label>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Предупреждения */}
          <AccordionItem value="warnings">
            <AccordionTrigger>Предупреждения</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2">
                {warningOptions.map((warning) => (
                  <div key={warning} className="flex items-center space-x-2">
                    <Checkbox
                      id={`warning-${warning}`}
                      checked={filters.warnings?.includes(warning) || false}
                      onCheckedChange={() => toggleWarning(warning)}
                    />
                    <Label htmlFor={`warning-${warning}`} className="text-sm">
                      {warning}
                    </Label>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Количество слов */}
          <AccordionItem value="word-count">
            <AccordionTrigger>Количество слов</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4">
                <div>
                  <Label className="text-sm">Минимум: {filters.word_count_min || 0}</Label>
                  <Slider
                    value={[filters.word_count_min || 0]}
                    onValueChange={([value]) => updateFilters({ word_count_min: value || undefined })}
                    max={100000}
                    step={1000}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label className="text-sm">Максимум: {filters.word_count_max || 100000}</Label>
                  <Slider
                    value={[filters.word_count_max || 100000]}
                    onValueChange={([value]) => updateFilters({ word_count_max: value || undefined })}
                    max={500000}
                    min={1000}
                    step={1000}
                    className="mt-2"
                  />
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Теги */}
          <AccordionItem value="tags">
            <AccordionTrigger>Теги</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <Input
                    placeholder="Добавить тег..."
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addTag()}
                  />
                  <Button onClick={addTag} size="sm">Добавить</Button>
                </div>
                {filters.tags && filters.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {filters.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="cursor-pointer" onClick={() => removeTag(tag)}>
                        {tag} ×
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Фандомы */}
          <AccordionItem value="fandoms">
            <AccordionTrigger>Фандомы</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <Input
                    placeholder="Добавить фандом..."
                    value={fandomInput}
                    onChange={(e) => setFandomInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addFandom()}
                  />
                  <Button onClick={addFandom} size="sm">Добавить</Button>
                </div>
                {filters.fandoms && filters.fandoms.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {filters.fandoms.map((fandom) => (
                      <Badge key={fandom} variant="secondary" className="cursor-pointer" onClick={() => removeFandom(fandom)}>
                        {fandom} ×
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Сортировка */}
          <AccordionItem value="sort">
            <AccordionTrigger>Сортировка</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-3">
                <div>
                  <Label className="text-sm">Сортировать по</Label>
                  <Select
                    value={filters.sort_by || 'relevance'}
                    onValueChange={(value: SortField) => updateFilters({ sort_by: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {sortOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-sm">Порядок</Label>
                  <Select
                    value={filters.sort_order || 'desc'}
                    onValueChange={(value: SortOrder) => updateFilters({ sort_order: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="desc">По убыванию</SelectItem>
                      <SelectItem value="asc">По возрастанию</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <div className="flex gap-2 mt-6">
          <Button onClick={onApplyFilters} className="flex-1">
            Применить фильтры
          </Button>
          {hasActiveFilters && (
            <Button variant="outline" onClick={clearAllFilters}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Сбросить
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
