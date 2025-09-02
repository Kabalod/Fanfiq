import type { Work } from "@/types"
import { WorkCard } from "./WorkCard"

interface ResultsListProps {
  /** Array of works to display */
  works: Work[]
}

/**
 * List of work results, prepared for virtualization
 */
export function ResultsList({ works }: ResultsListProps) {
  if (works.length === 0) {
    return <div className="text-center py-8 text-muted-foreground">No works found matching your criteria.</div>
  }

  return (
    <div className="space-y-4" role="list" aria-label="Search results">
      {works.map((work) => (
        <WorkCard key={work.id} work={work} />
      ))}
    </div>
  )
}
