"use client"

import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { X, Plus } from "lucide-react"
import { useState, type KeyboardEvent } from "react"

interface TagsFilterProps {
  /** Current tag values */
  value: string[]
  /** Callback when tags change */
  onChange: (value: string[]) => void
}

/**
 * Filter for adding and removing tags
 */
export function TagsFilter({ value, onChange }: TagsFilterProps) {
  const [inputValue, setInputValue] = useState("")

  const handleAddTag = () => {
    const trimmed = inputValue.trim()
    if (trimmed && !value.includes(trimmed)) {
      onChange([...value, trimmed])
      setInputValue("")
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    onChange(value.filter((tag) => tag !== tagToRemove))
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault()
      handleAddTag()
    }
  }

  return (
    <div className="space-y-3">
      <Label htmlFor="tags-input">Tags</Label>
      <div className="flex gap-2">
        <Input
          id="tags-input"
          type="text"
          placeholder="Add a tag..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1"
        />
        <Button type="button" size="sm" onClick={handleAddTag} disabled={!inputValue.trim()} aria-label="Add tag">
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.map((tag) => (
            <Badge key={tag} variant="secondary" className="flex items-center gap-1">
              {tag}
              <button
                type="button"
                onClick={() => handleRemoveTag(tag)}
                className="ml-1 hover:text-destructive focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring rounded-sm"
                aria-label={`Remove ${tag} tag`}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  )
}
