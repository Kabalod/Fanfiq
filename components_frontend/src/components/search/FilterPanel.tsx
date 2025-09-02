"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { SearchFilters } from "@/types"
import { RatingFilter } from "./filters/RatingFilter"
import { CategoryFilter } from "./filters/CategoryFilter"
import { StatusFilter } from "./filters/StatusFilter"
import { WarningsFilter } from "./filters/WarningsFilter"
import { TagsFilter } from "./filters/TagsFilter"
import { FandomsFilter } from "./filters/FandomsFilter"
import { WordRangeFilter } from "./filters/WordRangeFilter"
import { SitesFilter } from "./filters/SitesFilter"
import { SortControl } from "./filters/SortControl"

interface FilterPanelProps {
  /** Current filter values */
  filters: SearchFilters
  /** Callback when filters change */
  onFiltersChange: (filters: SearchFilters) => void
  /** Callback when filters are applied */
  onApplyFilters: () => void
}

/**
 * Panel containing all search filters
 */
export function FilterPanel({ filters, onFiltersChange, onApplyFilters }: FilterPanelProps) {
  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    onFiltersChange({ ...filters, [key]: value })
  }

  const handleReset = () => {
    onFiltersChange({})
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Filters</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <RatingFilter value={filters.rating} onChange={(value) => handleFilterChange("rating", value)} />

        <CategoryFilter value={filters.category} onChange={(value) => handleFilterChange("category", value)} />

        <StatusFilter value={filters.status} onChange={(value) => handleFilterChange("status", value)} />

        <WarningsFilter value={filters.warnings || []} onChange={(value) => handleFilterChange("warnings", value)} />

        <TagsFilter value={filters.tags || []} onChange={(value) => handleFilterChange("tags", value)} />

        <FandomsFilter value={filters.fandoms || []} onChange={(value) => handleFilterChange("fandoms", value)} />

        <WordRangeFilter value={filters.wordRange} onChange={(value) => handleFilterChange("wordRange", value)} />

        <SitesFilter value={filters.sites || []} onChange={(value) => handleFilterChange("sites", value)} />

        <SortControl
          sortBy={filters.sortBy}
          sortOrder={filters.sortOrder}
          onSortByChange={(value) => handleFilterChange("sortBy", value)}
          onSortOrderChange={(value) => handleFilterChange("sortOrder", value)}
        />

        <div className="flex gap-2 pt-4">
          <Button onClick={onApplyFilters} className="flex-1">
            Apply Filters
          </Button>
          <Button variant="outline" onClick={handleReset}>
            Reset
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
