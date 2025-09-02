"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import type { KeyboardEvent } from "react"

interface SearchBarProps {
  /** Current search value */
  value: string
  /** Callback when search value changes */
  onChange: (value: string) => void
  /** Callback when search is triggered */
  onSearch: () => void
}

/**
 * Search input with search button
 */
export function SearchBar({ value, onChange, onSearch }: SearchBarProps) {
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      onSearch()
    }
  }

  return (
    <div className="flex w-full max-w-2xl gap-2">
      <div className="relative flex-1">
        <Input
          type="text"
          placeholder="Search fanfiction..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          className="pr-10"
          aria-label="Search fanfiction"
        />
        <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      </div>
      <Button onClick={onSearch} aria-label="Execute search">
        Search
      </Button>
    </div>
  )
}
