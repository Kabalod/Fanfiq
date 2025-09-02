"use client"

import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { useState } from "react"

interface FandomsFilterProps {
  /** Current fandom values */
  value: string[]
  /** Callback when fandoms change */
  onChange: (value: string[]) => void
}

/**
 * Multi-select filter for fandoms
 */
export function FandomsFilter({ value, onChange }: FandomsFilterProps) {
  const [searchTerm, setSearchTerm] = useState("")

  // Mock fandoms - in real app, this would come from API
  const allFandoms = [
    "Harry Potter",
    "Marvel Cinematic Universe",
    "Sherlock Holmes",
    "Supernatural",
    "My Hero Academia",
    "Naruto",
    "Attack on Titan",
    "The Witcher",
    "Star Wars",
    "Lord of the Rings",
  ]

  const filteredFandoms = allFandoms.filter((fandom) => fandom.toLowerCase().includes(searchTerm.toLowerCase()))

  const handleFandomChange = (fandom: string, checked: boolean) => {
    if (checked) {
      onChange([...value, fandom])
    } else {
      onChange(value.filter((f) => f !== fandom))
    }
  }

  return (
    <div className="space-y-3">
      <Label htmlFor="fandoms-search">Fandoms</Label>
      <Input
        id="fandoms-search"
        type="text"
        placeholder="Search fandoms..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      <div className="max-h-48 overflow-y-auto space-y-2">
        {filteredFandoms.map((fandom) => (
          <div key={fandom} className="flex items-center space-x-2">
            <Checkbox
              id={`fandom-${fandom}`}
              checked={value.includes(fandom)}
              onCheckedChange={(checked) => handleFandomChange(fandom, !!checked)}
            />
            <Label htmlFor={`fandom-${fandom}`} className="text-sm font-normal cursor-pointer">
              {fandom}
            </Label>
          </div>
        ))}
      </div>

      {value.length > 0 && (
        <div className="text-sm text-muted-foreground">
          {value.length} fandom{value.length !== 1 ? "s" : ""} selected
        </div>
      )}
    </div>
  )
}
