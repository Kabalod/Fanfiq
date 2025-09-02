"use client"

import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface RatingFilterProps {
  /** Current rating value */
  value?: string
  /** Callback when rating changes */
  onChange: (value?: string) => void
}

/**
 * Filter for content rating
 */
export function RatingFilter({ value, onChange }: RatingFilterProps) {
  const ratings = [
    { value: "general", label: "General Audiences" },
    { value: "teen", label: "Teen And Up Audiences" },
    { value: "mature", label: "Mature" },
    { value: "explicit", label: "Explicit" },
  ]

  return (
    <div className="space-y-2">
      <Label htmlFor="rating-filter">Rating</Label>
      <Select value={value || "any"} onValueChange={(val) => onChange(val || undefined)}>
        <SelectTrigger id="rating-filter">
          <SelectValue placeholder="Any rating" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="any">Any rating</SelectItem>
          {ratings.map((rating) => (
            <SelectItem key={rating.value} value={rating.value}>
              {rating.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
