"use client"

import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChevronLeft, ChevronRight } from "lucide-react"
import type { Chapter } from "@/types"

interface ChapterNavProps {
  /** Available chapters */
  chapters: Chapter[]
  /** Current chapter index */
  current: number
  /** Callback for previous chapter */
  onPrev: () => void
  /** Callback for next chapter */
  onNext: () => void
  /** Callback for selecting specific chapter */
  onSelect: (index: number) => void
}

/**
 * Navigation controls for chapters
 */
export function ChapterNav({ chapters, current, onPrev, onNext, onSelect }: ChapterNavProps) {
  const currentChapter = chapters[current]
  const hasPrev = current > 0
  const hasNext = current < chapters.length - 1

  return (
    <nav className="flex items-center justify-between gap-4 py-4" aria-label="Chapter navigation">
      <Button variant="outline" onClick={onPrev} disabled={!hasPrev} aria-label="Previous chapter">
        <ChevronLeft className="h-4 w-4 mr-2" />
        Previous
      </Button>

      <div className="flex-1 max-w-xs">
        <Select value={current.toString()} onValueChange={(value) => onSelect(Number.parseInt(value))}>
          <SelectTrigger aria-label="Select chapter">
            <SelectValue>
              Chapter {current + 1}: {currentChapter?.title}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {chapters.map((chapter, index) => (
              <SelectItem key={chapter.id} value={index.toString()}>
                Chapter {index + 1}: {chapter.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button variant="outline" onClick={onNext} disabled={!hasNext} aria-label="Next chapter">
        Next
        <ChevronRight className="h-4 w-4 ml-2" />
      </Button>
    </nav>
  )
}
