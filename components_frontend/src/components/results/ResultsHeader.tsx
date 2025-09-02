import type React from "react"
interface ResultsHeaderProps {
  /** Total number of results */
  total: number
  /** Optional children (typically SortControl) */
  children?: React.ReactNode
}

/**
 * Header showing result count and optional sort controls
 */
export function ResultsHeader({ total, children }: ResultsHeaderProps) {
  return (
    <div className="flex items-center justify-between py-4">
      <div>
        <h2 className="text-lg font-semibold">
          {total.toLocaleString()} result{total !== 1 ? "s" : ""}
        </h2>
      </div>

      {children && <div className="flex items-center gap-4">{children}</div>}
    </div>
  )
}
