import { Badge } from "@/components/ui/badge"

interface HotkeysHintProps {
  /** Hotkey combinations to display */
  hotkeys: Array<{ key: string; description: string }>
  /** Optional title */
  title?: string
}

/**
 * Display keyboard shortcuts hints
 */
export function HotkeysHint({ hotkeys, title = "Keyboard Shortcuts" }: HotkeysHintProps) {
  if (hotkeys.length === 0) return null

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium text-muted-foreground">{title}</h4>
      <div className="space-y-2">
        {hotkeys.map((hotkey, index) => (
          <div key={index} className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{hotkey.description}</span>
            <Badge variant="outline" className="font-mono text-xs">
              {hotkey.key}
            </Badge>
          </div>
        ))}
      </div>
    </div>
  )
}
