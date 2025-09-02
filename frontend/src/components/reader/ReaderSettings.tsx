'use client'

import { Button } from '@/components/ui/button'
import { Sun, Moon, Book, Minus, Plus } from 'lucide-react'

export type ReaderTheme = 'light' | 'dark' | 'sepia'

interface ReaderSettingsProps {
  theme: ReaderTheme
  fontSize: number
  onThemeChange: (theme: ReaderTheme) => void
  onFontSizeChange: (size: number) => void
}

export function ReaderSettings({ theme, fontSize, onThemeChange, onFontSizeChange }: ReaderSettingsProps) {
  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onFontSizeChange(fontSize - 1)}
          disabled={fontSize <= 12}
        >
          <Minus className="h-4 w-4" />
        </Button>
        <span className="text-sm">{fontSize}px</span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onFontSizeChange(fontSize + 1)}
          disabled={fontSize >= 24}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant={theme === 'light' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onThemeChange('light')}
          aria-label="Светлая тема"
        >
          <Sun className="h-4 w-4" />
        </Button>
        <Button
          variant={theme === 'dark' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onThemeChange('dark')}
          aria-label="Темная тема"
        >
          <Moon className="h-4 w-4" />
        </Button>
        <Button
          variant={theme === 'sepia' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onThemeChange('sepia')}
          aria-label="Тема сепия"
        >
          <Book className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
