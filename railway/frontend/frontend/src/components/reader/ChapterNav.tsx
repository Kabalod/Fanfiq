'use client'

import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface ChapterNavProps {
  currentChapter: number
  totalChapters: number
  onChapterChange: (chapterIndex: number) => void
}

export function ChapterNav({
  currentChapter,
  totalChapters,
  onChapterChange,
}: ChapterNavProps) {
  return (
    <div className="flex items-center justify-between">
      <Button
        variant="outline"
        onClick={() => onChapterChange(currentChapter - 1)}
        disabled={currentChapter === 0}
      >
        <ChevronLeft className="h-4 w-4 mr-2" />
        Предыдущая
      </Button>

      <Select
        value={String(currentChapter)}
        onValueChange={(value) => onChapterChange(Number(value))}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Выберите главу" />
        </SelectTrigger>
        <SelectContent>
          {Array.from({ length: totalChapters }).map((_, i) => (
            <SelectItem key={i} value={String(i)}>
              Глава {i + 1}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button
        variant="outline"
        onClick={() => onChapterChange(currentChapter + 1)}
        disabled={currentChapter === totalChapters - 1}
      >
        Следующая
        <ChevronRight className="h-4 w-4 ml-2" />
      </Button>
    </div>
  )
}
