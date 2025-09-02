"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import type { SearchFilters } from "@/types"

interface FiltersSummaryProps {
  /** Current active filters */
  filters: SearchFilters
  /** Callback when a specific filter is removed */
  onRemoveFilter: (key: keyof SearchFilters, value?: string) => void
  /** Callback when all filters are cleared */
  onClearAll: () => void
}

/**
 * Summary of active filters with ability to remove individual filters
 */
export function FiltersSummary({ filters, onRemoveFilter, onClearAll }: FiltersSummaryProps) {
  const activeFilters: Array<{ key: keyof SearchFilters; label: string; value?: string }> = []

  // Build list of active filters
  if (filters.rating) {
    activeFilters.push({ key: "rating", label: `Rating: ${filters.rating}` })
  }
  if (filters.category) {
    activeFilters.push({ key: "category", label: `Category: ${filters.category}` })
  }
  if (filters.status) {
    activeFilters.push({ key: "status", label: `Status: ${filters.status}` })
  }
  if (filters.warnings?.length) {
    filters.warnings.forEach((warning) => {
      activeFilters.push({ key: "warnings", label: `Warning: ${warning}`, value: warning })
    })
  }
  if (filters.tags?.length) {
    filters.tags.forEach((tag) => {
      activeFilters.push({ key: "tags", label: `Tag: ${tag}`, value: tag })
    })
  }
  if (filters.fandoms?.length) {
    filters.fandoms.forEach((fandom) => {
      activeFilters.push({ key: "fandoms", label: `Fandom: ${fandom}`, value: fandom })
    })
  }
  if (filters.sites?.length) {
    filters.sites.forEach((site) => {
      activeFilters.push({ key: "sites", label: `Site: ${site}`, value: site })
    })
  }
  if (filters.wordRange?.min || filters.wordRange?.max) {
    const min = filters.wordRange.min || 0
    const max = filters.wordRange.max || "∞"
    activeFilters.push({ key: "wordRange", label: `Words: ${min} - ${max}` })
  }

  if (activeFilters.length === 0) {
    return null
  }

  return (
    <div className="flex flex-wrap items-center gap-2 p-4 bg-muted/50 rounded-lg">
      <span className="text-sm font-medium text-muted-foreground">Active filters:</span>

      {activeFilters.map((filter, index) => (
        <Badge
          key={`${filter.key}-${filter.value || ""}-${index}`}
          variant="secondary"
          className="flex items-center gap-1"
        >
          {filter.label}
          <button
            type="button"
            onClick={() => onRemoveFilter(filter.key, filter.value)}
            className="ml-1 hover:text-destructive focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring rounded-sm"
            aria-label={`Remove ${filter.label} filter`}
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      ))}

      <Button variant="ghost" size="sm" onClick={onClearAll} className="text-muted-foreground hover:text-foreground">
        Clear all
      </Button>
    </div>
  )
}
