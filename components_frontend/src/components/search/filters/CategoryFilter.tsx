"use client"

import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface CategoryFilterProps {
  /** Current category value */
  value?: string
  /** Callback when category changes */
  onChange: (value?: string) => void
}

/**
 * Filter for relationship category
 */
export function CategoryFilter({ value, onChange }: CategoryFilterProps) {
  const categories = [
    { value: "gen", label: "Gen" },
    { value: "het", label: "Het" },
    { value: "slash", label: "Slash" },
    { value: "femslash", label: "Femslash" },
    { value: "multi", label: "Multi" },
    { value: "other", label: "Other" },
  ]

  return (
    <div className="space-y-2">
      <Label htmlFor="category-filter">Category</Label>
      <Select value={value || "any"} onValueChange={(val) => onChange(val || undefined)}>
        <SelectTrigger id="category-filter">
          <SelectValue placeholder="Any category" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="any">Any category</SelectItem>
          {categories.map((category) => (
            <SelectItem key={category.value} value={category.value}>
              {category.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
