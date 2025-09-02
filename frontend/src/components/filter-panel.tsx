'use client'

import { useSupportedSites } from '@/lib/api/client'
import { SearchFilters } from '@/lib/api/schemas'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Slider } from '@/components/ui/slider'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useState } from 'react'

interface FilterPanelProps {
  filters: SearchFilters
  onFiltersChange: (newFilters: SearchFilters) => void
  onApplyFilters: () => void
}

const ratingOptions = ['G', 'PG-13', 'R', 'NC-17', 'NC-21']
const categoryOptions = ['gen', 'het', 'slash', 'femslash', 'mixed', 'other', 'article']
const statusOptions = ['completed', 'in_progress', 'frozen']
const sortOptions = [
  { value: 'relevance', label: 'Релевантность' },
  { value: 'updated', label: 'Дата обновления' },
  { value: 'created', label: 'Дата создания' },
  { value: 'title', label: 'Название' },
  { value: 'kudos', label: 'Лайки' },
  { value: 'comments', label: 'Комментарии' },
  { value: 'word_count', label: 'Количество слов' },
]

export function FilterPanel({
  filters,
  onFiltersChange,
  onApplyFilters,
}: FilterPanelProps) {
  const { data: supportedSitesData } = useSupportedSites()
  const [tagInput, setTagInput] = useState('')
  const [fandomInput, setFandomInput] = useState('')

  const handleCheckboxGroupChange = (
    field: 'rating' | 'status' | 'sites' | 'warnings',
    value: string,
    checked: boolean
  ) => {
    const currentValues = filters[field] || []
    const newValues = checked
      ? [...currentValues, value]
      : currentValues.filter((v) => v !== value)
    onFiltersChange({ ...filters, [field]: newValues })
  }

  const handleTagChange = (field: 'tags' | 'fandoms', input: string, setInput: (s:string)=>void) => {
    if (!input.trim()) return
    const currentValues = filters[field] || []
    if (!currentValues.includes(input.trim())) {
      onFiltersChange({ ...filters, [field]: [...currentValues, input.trim()] })
    }
    setInput('')
  }
  
  const handleTagRemove = (field: 'tags' | 'fandoms', value: string) => {
    const currentValues = filters[field] || []
    onFiltersChange({ ...filters, [field]: currentValues.filter(v => v !== value) })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Фильтры</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Sites */}
        {supportedSitesData && (
          <div>
            <Label>Сайты</Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
              {supportedSitesData.sites.map((site) => (
                <div key={site} className="flex items-center gap-2">
                  <Checkbox
                    id={`site-${site}`}
                    checked={filters.sites?.includes(site)}
                    onCheckedChange={(checked) =>
                      handleCheckboxGroupChange('sites', site, !!checked)
                    }
                  />
                  <Label htmlFor={`site-${site}`} className="font-normal capitalize">
                    {site}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Rating */}
        <div>
          <Label>Рейтинг</Label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
            {ratingOptions.map((rating) => (
              <div key={rating} className="flex items-center gap-2">
                <Checkbox
                  id={`rating-${rating}`}
                  checked={filters.rating?.includes(rating)}
                  onCheckedChange={(checked) =>
                    handleCheckboxGroupChange('rating', rating, !!checked)
                  }
                />
                <Label htmlFor={`rating-${rating}`} className="font-normal">
                  {rating}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Status */}
        <div>
          <Label>Статус</Label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
            {statusOptions.map((status) => (
              <div key={status} className="flex items-center gap-2">
                <Checkbox
                  id={`status-${status}`}
                  checked={filters.status?.includes(status)}
                  onCheckedChange={(checked) =>
                    handleCheckboxGroupChange('status', status, !!checked)
                  }
                />
                <Label htmlFor={`status-${status}`} className="font-normal">
                  {status}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Category */}
        <div>
          <Label>Категория</Label>
          <Select
            value={filters.category?.[0] || ''}
            onValueChange={(value) =>
              onFiltersChange({ ...filters, category: value ? [value] : [] })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Любая" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Любая</SelectItem>
              {categoryOptions.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Word Count */}
        <div>
          <Label>Количество слов</Label>
          <Slider
            min={0}
            max={500000}
            step={1000}
            value={[filters.word_count_min || 0, filters.word_count_max || 500000]}
            onValueChange={([min, max]) =>
              onFiltersChange({ ...filters, word_count_min: min, word_count_max: max })
            }
          />
           <div className="flex justify-between text-sm text-muted-foreground mt-2">
            <span>{filters.word_count_min || 0}</span>
            <span>{filters.word_count_max || '500k+'}</span>
          </div>
        </div>

        {/* Tags */}
        <div>
          <Label>Теги</Label>
          <div className="flex gap-2">
            <Input 
              value={tagInput}
              onChange={e => setTagInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleTagChange('tags', tagInput, setTagInput)}
              placeholder="Добавить тег"
            />
            <Button onClick={() => handleTagChange('tags', tagInput, setTagInput)} variant="outline">Добавить</Button>
          </div>
          <div className="flex flex-wrap gap-1 mt-2">
            {filters.tags?.map(tag => (
              <Badge key={tag} variant="secondary" onClick={() => handleTagRemove('tags', tag)} className="cursor-pointer">
                {tag} &times;
              </Badge>
            ))}
          </div>
        </div>
        
        {/* Fandoms */}
        <div>
          <Label>Фандомы</Label>
          <div className="flex gap-2">
            <Input 
              value={fandomInput}
              onChange={e => setFandomInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleTagChange('fandoms', fandomInput, setFandomInput)}
              placeholder="Добавить фандом"
            />
            <Button onClick={() => handleTagChange('fandoms', fandomInput, setFandomInput)} variant="outline">Добавить</Button>
          </div>
          <div className="flex flex-wrap gap-1 mt-2">
            {filters.fandoms?.map(fandom => (
              <Badge key={fandom} variant="secondary" onClick={() => handleTagRemove('fandoms', fandom)} className="cursor-pointer">
                {fandom} &times;
              </Badge>
            ))}
          </div>
        </div>
        
        {/* Sort */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Сортировать по</Label>
            <Select
              value={filters.sort_by || 'relevance'}
              onValueChange={(value) => onFiltersChange({ ...filters, sort_by: value as any })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Порядок</Label>
            <Select
              value={filters.sort_order || 'desc'}
              onValueChange={(value) => onFiltersChange({ ...filters, sort_order: value as any })}
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

        <Button onClick={onApplyFilters} className="w-full">
          Применить
        </Button>
      </CardContent>
    </Card>
  )
}
