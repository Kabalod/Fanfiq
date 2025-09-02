"use client"

import { Button } from "@/components/ui/button"
import { Filter } from "lucide-react"

interface SiteHeaderProps {
  /** Callback when filters button is clicked */
  onOpenFilters?: () => void
}

/**
 * Main site header with logo and filters button
 */
export function SiteHeader({ onOpenFilters }: SiteHeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between">
        <div className="flex items-center space-x-2">
          <h1 className="text-xl font-bold">Fanfiq</h1>
        </div>

        <div className="flex items-center space-x-4">
          {onOpenFilters && (
            <Button variant="outline" size="sm" onClick={onOpenFilters} aria-label="Open search filters">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          )}

          {/* Placeholder for theme switcher */}
          <div className="w-8 h-8 rounded-md bg-muted" aria-label="Theme switcher placeholder" />
        </div>
      </div>
    </header>
  )
}
