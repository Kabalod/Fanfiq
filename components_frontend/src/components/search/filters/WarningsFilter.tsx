import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"

interface WarningsFilterProps {
  /** Current warning values */
  value: string[]
  /** Callback when warnings change */
  onChange: (value: string[]) => void
}

/**
 * Filter for content warnings
 */
export function WarningsFilter({ value, onChange }: WarningsFilterProps) {
  const warnings = [
    { value: "violence", label: "Graphic Violence" },
    { value: "death", label: "Major Character Death" },
    { value: "underage", label: "Underage" },
    { value: "non-con", label: "Non-Consensual" },
    { value: "self-harm", label: "Self-Harm" },
  ]

  const handleWarningChange = (warningValue: string, checked: boolean) => {
    if (checked) {
      onChange([...value, warningValue])
    } else {
      onChange(value.filter((w) => w !== warningValue))
    }
  }

  return (
    <div className="space-y-3">
      <Label>Content Warnings</Label>
      <div className="space-y-2">
        {warnings.map((warning) => (
          <div key={warning.value} className="flex items-center space-x-2">
            <Checkbox
              id={`warning-${warning.value}`}
              checked={value.includes(warning.value)}
              onCheckedChange={(checked) => handleWarningChange(warning.value, !!checked)}
            />
            <Label htmlFor={`warning-${warning.value}`} className="text-sm font-normal cursor-pointer">
              {warning.label}
            </Label>
          </div>
        ))}
      </div>
    </div>
  )
}
