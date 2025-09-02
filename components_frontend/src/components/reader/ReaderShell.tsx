"use client"

import type { Work, Chapter } from "@/types"
import { ReaderHeader } from "./ReaderHeader"
import { ReaderSettings } from "./ReaderSettings"
import { ChapterNav } from "./ChapterNav"
import { ChapterContent } from "./ChapterContent"
import { ReadingProgress } from "./ReadingProgress"

interface ReaderShellProps {
  /** Work being read */
  work: Work
  /** Available chapters */
  chapters: Chapter[]
  /** Current chapter index */
  current: number
  /** Callback when chapter changes */
  onChangeChapter: (index: number) => void
}

/**
 * Main reader shell composing all reader components
 */
export function ReaderShell({ work, chapters, current, onChangeChapter }: ReaderShellProps) {
  const currentChapter = chapters[current]

  const handlePrevious = () => {
    if (current > 0) {
      onChangeChapter(current - 1)
    }
  }

  const handleNext = () => {
    if (current < chapters.length - 1) {
      onChangeChapter(current + 1)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <ReaderHeader work={work} />

      <div className="container max-w-4xl mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main content */}
          <main className="flex-1 space-y-6">
            <ReadingProgress current={current + 1} total={chapters.length} />

            <ChapterNav
              chapters={chapters}
              current={current}
              onPrev={handlePrevious}
              onNext={handleNext}
              onSelect={onChangeChapter}
            />

            {currentChapter && <ChapterContent html={currentChapter.content} />}

            <ChapterNav
              chapters={chapters}
              current={current}
              onPrev={handlePrevious}
              onNext={handleNext}
              onSelect={onChangeChapter}
            />
          </main>

          {/* Sidebar */}
          <aside className="lg:w-64 space-y-4">
            <ReaderSettings theme="light" onThemeChange={() => {}} />
          </aside>
        </div>
      </div>
    </div>
  )
}
