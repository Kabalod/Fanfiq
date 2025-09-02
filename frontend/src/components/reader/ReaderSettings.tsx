'use client'

import { Button } from '@/components/ui/button'
import { Sun, Moon, Book } from 'lucide-react'

export type ReaderTheme = 'light' | 'dark' | 'sepia'

interface ReaderSettingsProps {
  theme: ReaderTheme
  onThemeChange: (theme: ReaderTheme) => void
}

export function ReaderSettings({ theme, onThemeChange }: ReaderSettingsProps) {
  return (
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
  )
}
