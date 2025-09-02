import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"

interface SitesFilterProps {
  /** Current site values */
  value: string[]
  /** Callback when sites change */
  onChange: (value: string[]) => void
}

/**
 * Filter for fanfiction sites
 */
export function SitesFilter({ value, onChange }: SitesFilterProps) {
  const sites = [
    { value: "ao3", label: "Archive of Our Own" },
    { value: "ffnet", label: "FanFiction.Net" },
    { value: "wattpad", label: "Wattpad" },
    { value: "quotev", label: "Quotev" },
    { value: "deviantart", label: "DeviantArt" },
  ]

  const handleSiteChange = (site: string, checked: boolean) => {
    if (checked) {
      onChange([...value, site])
    } else {
      onChange(value.filter((s) => s !== site))
    }
  }

  return (
    <div className="space-y-3">
      <Label>Sites</Label>
      <div className="space-y-2">
        {sites.map((site) => (
          <div key={site.value} className="flex items-center space-x-2">
            <Checkbox
              id={`site-${site.value}`}
              checked={value.includes(site.value)}
              onCheckedChange={(checked) => handleSiteChange(site.value, !!checked)}
            />
            <Label htmlFor={`site-${site.value}`} className="text-sm font-normal cursor-pointer">
              {site.label}
            </Label>
          </div>
        ))}
      </div>
    </div>
  )
}
