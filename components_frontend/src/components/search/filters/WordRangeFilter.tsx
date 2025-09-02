"use client"

import type React from "react"

import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"

interface WordRangeFilterProps {
  /** Current word range value */
  value?: { min?: number; max?: number }
  /** Callback when word range changes */
  onChange: (value?: { min?: number; max?: number }) => void
}

/**
 * Filter for word count range with slider and input fields
 */
export function WordRangeFilter({ value, onChange }: WordRangeFilterProps) {
  const min = value?.min ?? 0
  const max = value?.max ?? 100000

  const handleSliderChange = (values: number[]) => {
    onChange({
      min: values[0] === 0 ? undefined : values[0],
      max: values[1] === 100000 ? undefined : values[1],
    })
  }

  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMin = e.target.value ? Number.parseInt(e.target.value) : undefined
    onChange({ ...value, min: newMin })
  }

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMax = e.target.value ? Number.parseInt(e.target.value) : undefined
    onChange({ ...value, max: newMax })
  }

  return (
    <div className="space-y-4">
      <Label>Word Count Range</Label>

      <div className="px-2">
        <Slider
          value={[min, max]}
          onValueChange={handleSliderChange}
          max={100000}
          min={0}
          step={1000}
          className="w-full"
          aria-label="Word count range"
        />
      </div>

      <div className="flex gap-2 items-center">
        <div className="flex-1">
          <Label htmlFor="word-min" className="text-xs text-muted-foreground">
            Min words
          </Label>
          <Input
            id="word-min"
            type="number"
            placeholder="0"
            value={value?.min ?? ""}
            onChange={handleMinChange}
            min={0}
          />
        </div>

        <span className="text-muted-foreground">to</span>

        <div className="flex-1">
          <Label htmlFor="word-max" className="text-xs text-muted-foreground">
            Max words
          </Label>
          <Input
            id="word-max"
            type="number"
            placeholder="∞"
            value={value?.max ?? ""}
            onChange={handleMaxChange}
            min={0}
          />
        </div>
      </div>
    </div>
  )
}
