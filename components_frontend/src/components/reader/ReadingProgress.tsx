import { Progress } from "@/components/ui/progress"

interface ReadingProgressProps {
  /** Current chapter number */
  current: number
  /** Total number of chapters */
  total: number
}

/**
 * Reading progress indicator
 */
export function ReadingProgress({ current, total }: ReadingProgressProps) {
  const progress = (current / total) * 100

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm text-muted-foreground">
        <span>
          Chapter {current} of {total}
        </span>
        <span>{Math.round(progress)}% complete</span>
      </div>
      <Progress value={progress} className="w-full" aria-label="Reading progress" />
    </div>
  )
}
