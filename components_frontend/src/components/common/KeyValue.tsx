interface KeyValueProps {
  /** Data to display as key-value pairs */
  data: Record<string, string | number | undefined>
  /** Optional custom className */
  className?: string
}

/**
 * Mini table for displaying key-value properties
 */
export function KeyValue({ data, className }: KeyValueProps) {
  const entries = Object.entries(data).filter(([_, value]) => value !== undefined)

  if (entries.length === 0) return null

  return (
    <dl className={`grid grid-cols-2 gap-x-4 gap-y-2 text-sm ${className || ""}`}>
      {entries.map(([key, value]) => (
        <div key={key} className="contents">
          <dt className="font-medium text-muted-foreground capitalize">{key.replace(/([A-Z])/g, " $1").trim()}:</dt>
          <dd className="text-foreground">{value}</dd>
        </div>
      ))}
    </dl>
  )
}
