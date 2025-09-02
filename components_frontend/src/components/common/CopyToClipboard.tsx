"use client"

import { Button } from "@/components/ui/button"
import { Copy, Check } from "lucide-react"
import { useState } from "react"

interface CopyToClipboardProps {
  /** Text to copy */
  text: string
  /** Optional custom label */
  label?: string
  /** Whether to show as icon only */
  iconOnly?: boolean
}

/**
 * Button/icon for copying text to clipboard
 */
export function CopyToClipboard({ text, label = "Copy", iconOnly = false }: CopyToClipboardProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy text:", err)
    }
  }

  if (iconOnly) {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={handleCopy}
        aria-label={copied ? "Copied!" : label}
        className="h-8 w-8 p-0"
      >
        {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
      </Button>
    )
  }

  return (
    <Button variant="outline" size="sm" onClick={handleCopy} disabled={copied}>
      {copied ? (
        <>
          <Check className="h-4 w-4 mr-2" />
          Copied!
        </>
      ) : (
        <>
          <Copy className="h-4 w-4 mr-2" />
          {label}
        </>
      )}
    </Button>
  )
}
