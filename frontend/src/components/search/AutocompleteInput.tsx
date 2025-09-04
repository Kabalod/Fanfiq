'use client'
import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

interface Props {
  type: 'tags' | 'fandoms'
  values: string[]
  onAdd: (value: string) => void
  onRemove: (value: string) => void
}

export function AutocompleteInput({ values, onAdd, onRemove }: Props) {
  const [value, setValue] = useState('')

  const handleAdd = () => {
    const v = value.trim()
    if (!v) return
    onAdd(v)
    setValue('')
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input value={value} onChange={(e) => setValue(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAdd()} />
        <button type="button" className="px-3 py-2 rounded bg-primary text-primary-foreground" onClick={handleAdd}>Добавить</button>
      </div>
      <div className="flex flex-wrap gap-2">
        {values.map((v) => (
          <Badge key={v} variant="secondary" className="cursor-pointer" onClick={() => onRemove(v)}>
            {v}
          </Badge>
        ))}
      </div>
    </div>
  )
}

'use client'

import { useState } from 'react'
import { useAutocomplete } from '@/lib/api/client'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface AutocompleteInputProps {
  type: 'tags' | 'fandoms'
  values: string[]
  onAdd: (value: string) => void
  onRemove: (value: string) => void
}

export function AutocompleteInput({ type, values, onAdd, onRemove }: AutocompleteInputProps) {
  const [inputValue, setInputValue] = useState('')
  const { data: suggestions } = useAutocomplete(type, inputValue)

  const handleAdd = () => {
    if (inputValue) {
      onAdd(inputValue)
      setInputValue('')
    }
  }

  return (
    <div>
      <div className="flex gap-2">
        <div className="relative w-full">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            placeholder={type === 'tags' ? 'Добавить тег' : 'Добавить фандом'}
          />
          {suggestions && suggestions.length > 0 && (
            <div className="absolute z-10 w-full bg-card border mt-1 rounded-md shadow-lg">
              {suggestions.map((suggestion) => (
                <div
                  key={suggestion}
                  className="p-2 hover:bg-accent cursor-pointer"
                  onClick={() => {
                    onAdd(suggestion)
                    setInputValue('')
                  }}
                >
                  {suggestion}
                </div>
              ))}
            </div>
          )}
        </div>
        <Button onClick={handleAdd} variant="outline">Добавить</Button>
      </div>
      <div className="flex flex-wrap gap-1 mt-2">
        {values.map((value) => (
          <Badge key={value} variant="secondary" onClick={() => onRemove(value)} className="cursor-pointer">
            {value} &times;
          </Badge>
        ))}
      </div>
    </div>
  )
}
