"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import type { ReaderTheme } from "@/types"
import { useState } from "react"

interface ReaderSettingsProps {
  /** Current theme */
  theme: ReaderTheme
  /** Callback when theme changes */
  onThemeChange: (theme: ReaderTheme) => void
}

/**
 * Reader settings panel for theme and font size
 */
export function ReaderSettings({ theme, onThemeChange }: ReaderSettingsProps) {
  const [fontSize, setFontSize] = useState(16)

  const themes: Array<{ value: ReaderTheme; label: string }> = [
    { value: "light", label: "Light" },
    { value: "dark", label: "Dark" },
    { value: "sepia", label: "Sepia" },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Reading Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="theme-select">Theme</Label>
          <Select value={theme} onValueChange={onThemeChange}>
            <SelectTrigger id="theme-select">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {themes.map((themeOption) => (
                <SelectItem key={themeOption.value} value={themeOption.value}>
                  {themeOption.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-3">
          <Label htmlFor="font-size">Font Size: {fontSize}px</Label>
          <Slider
            id="font-size"
            value={[fontSize]}
            onValueChange={(value) => setFontSize(value[0])}
            min={12}
            max={24}
            step={1}
            className="w-full"
            aria-label="Font size"
          />
        </div>

        {/* Placeholder for future settings */}
        <div className="space-y-2 opacity-50">
          <Label>Line Height</Label>
          <div className="h-8 bg-muted rounded" />
        </div>

        <div className="space-y-2 opacity-50">
          <Label>Reading Width</Label>
          <div className="h-8 bg-muted rounded" />
        </div>
      </CardContent>
    </Card>
  )
}
