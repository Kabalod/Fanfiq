import { Search, BookOpen } from "lucide-react"

interface EmptyStateProps {
  /** Optional custom message */
  message?: string
  /** Optional custom description */
  description?: string
}

/**
 * Empty state component with helpful message
 */
export function EmptyState({
  message = "No results found",
  description = "Try adjusting your search terms or filters to find what you're looking for.",
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="rounded-full bg-muted p-4 mb-4">
        <Search className="h-8 w-8 text-muted-foreground" />
      </div>

      <h3 className="text-lg font-semibold mb-2">{message}</h3>
      <p className="text-muted-foreground max-w-md mb-6">{description}</p>

      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <BookOpen className="h-4 w-4" />
        <span>Try browsing popular works or adjusting your filters</span>
      </div>
    </div>
  )
}
