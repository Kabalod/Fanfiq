"use client"

import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface StatusFilterProps {
  /** Current status value */
  value?: string
  /** Callback when status changes */
  onChange: (value?: string) => void
}

/**
 * Filter for work completion status
 */
export function StatusFilter({ value, onChange }: StatusFilterProps) {
  const statuses = [
    { value: "complete", label: "Complete" },
    { value: "in-progress", label: "In Progress" },
    { value: "hiatus", label: "On Hiatus" },
    { value: "abandoned", label: "Abandoned" },
  ]

  return (
    <div className="space-y-2">
      <Label htmlFor="status-filter">Status</Label>
      <Select value={value || "any"} onValueChange={(val) => onChange(val || undefined)}>
        <SelectTrigger id="status-filter">
          <SelectValue placeholder="Any status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="any">Any status</SelectItem>
          {statuses.map((status) => (
            <SelectItem key={status.value} value={status.value}>
              {status.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
