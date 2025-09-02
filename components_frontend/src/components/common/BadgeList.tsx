"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useState } from "react"

interface BadgeListProps {
  /** Items to display as badges */
  items: string[]
  /** Maximum number of badges to show initially */
  maxVisible?: number
  /** Badge variant */
  variant?: "default" | "secondary" | "destructive" | "outline"
  /** Badge size */
  size?: "default" | "sm" | "lg"
}

/**
 * Compact list of badges with expand/collapse functionality
 */
export function BadgeList({ items, maxVisible = 5, variant = "secondary", size = "default" }: BadgeListProps) {
  const [showAll, setShowAll] = useState(false)

  if (items.length === 0) return null

  const visibleItems = showAll ? items : items.slice(0, maxVisible)
  const hasMore = items.length > maxVisible

  return (
    <div className="flex flex-wrap items-center gap-2">
      {visibleItems.map((item, index) => (
        <Badge key={`${item}-${index}`} variant={variant} className={size === "sm" ? "text-xs" : ""}>
          {item}
        </Badge>
      ))}

      {hasMore && !showAll && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowAll(true)}
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          +{items.length - maxVisible} more
        </Button>
      )}

      {hasMore && showAll && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowAll(false)}
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          Show less
        </Button>
      )}
    </div>
  )
}
