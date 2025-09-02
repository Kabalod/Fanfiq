"use client"

import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface SortControlProps {
  /** Current sort field */
  sortBy?: string
  /** Current sort order */
  sortOrder?: "asc" | "desc"
  /** Callback when sort field changes */
  onSortByChange: (value?: string) => void
  /** Callback when sort order changes */
  onSortOrderChange: (value?: "asc" | "desc") => void
}

/**
 * Controls for sorting search results
 */
export function SortControl({ sortBy, sortOrder, onSortByChange, onSortOrderChange }: SortControlProps) {
  const sortOptions = [
    { value: "relevance", label: "Relevance" },
    { value: "updated", label: "Last Updated" },
    { value: "created", label: "Date Created" },
    { value: "title", label: "Title" },
    { value: "kudos", label: "Kudos" },
    { value: "word_count", label: "Word Count" },
  ]

  return (
    <div className="space-y-3">
      <Label>Sort Results</Label>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label htmlFor="sort-by" className="text-xs text-muted-foreground">
            Sort by
          </Label>
          <Select value={sortBy || "relevance"} onValueChange={onSortByChange}>
            <SelectTrigger id="sort-by">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="sort-order" className="text-xs text-muted-foreground">
            Order
          </Label>
          <Select value={sortOrder || "desc"} onValueChange={onSortOrderChange}>
            <SelectTrigger id="sort-order">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="desc">Descending</SelectItem>
              <SelectItem value="asc">Ascending</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )
}
