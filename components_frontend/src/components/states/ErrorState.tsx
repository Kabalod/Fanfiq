"use client"

import { Button } from "@/components/ui/button"
import { AlertCircle, RefreshCw } from "lucide-react"

interface ErrorStateProps {
  /** Error message to display */
  message?: string
  /** Optional retry callback */
  onRetry?: () => void
}

/**
 * Error state component with retry option
 */
export function ErrorState({ message = "Something went wrong", onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="rounded-full bg-destructive/10 p-4 mb-4">
        <AlertCircle className="h-8 w-8 text-destructive" />
      </div>

      <h3 className="text-lg font-semibold mb-2">Oops!</h3>
      <p className="text-muted-foreground max-w-md mb-6">{message}</p>

      {onRetry && (
        <Button onClick={onRetry} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Try Again
        </Button>
      )}
    </div>
  )
}
