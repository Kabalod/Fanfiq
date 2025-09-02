'use client'

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

interface FilterPanelProps {
  filters: SearchFilters
  onFiltersChange: (newFilters: SearchFilters) => void
  onApplyFilters: () => void
}

const ratingOptions = ['G', 'PG-13', 'R', 'NC-17', 'NC-21']
const categoryOptions = ['gen', 'het', 'slash', 'femslash', 'mixed', 'other', 'article']
const statusOptions = ['completed', 'in_progress', 'frozen']

export function FilterPanel({
  filters,
  onFiltersChange,
  onApplyFilters,
}: FilterPanelProps) {
  const handleCheckboxGroupChange = (
    field: keyof SearchFilters,
    value: string,
    checked: boolean
  ) => {
    const currentValues = (filters[field] as string[]) || []
    const newValues = checked
      ? [...currentValues, value]
      : currentValues.filter((v) => v !== value)
    onFiltersChange({ ...filters, [field]: newValues })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Фильтры</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
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
        
        <Button onClick={onApplyFilters} className="w-full">
          Применить
        </Button>
      </CardContent>
    </Card>
  )
}
