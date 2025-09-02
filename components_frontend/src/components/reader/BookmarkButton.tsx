"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Bookmark, BookmarkCheck } from "lucide-react"
import { cn } from "@/lib/utils"

export interface BookmarkButtonProps {
  workId: string
  chapterId: string
  position?: number
  isBookmarked: boolean
  onToggleBookmark?: (workId: string, chapterId: string, position?: number) => void
  disabled?: boolean
  size?: "sm" | "md" | "lg"
  variant?: "default" | "outline" | "ghost"
  className?: string
}

export function BookmarkButton({
  workId,
  chapterId,
  position,
  isBookmarked,
  onToggleBookmark,
  disabled = false,
  size = "md",
  variant = "ghost",
  className,
}: BookmarkButtonProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleToggle = async () => {
    if (disabled || isLoading) return

    setIsLoading(true)
    try {
      await onToggleBookmark?.(workId, chapterId, position)
    } finally {
      setIsLoading(false)
    }
  }

  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-9 w-9",
    lg: "h-10 w-10",
  }

  const iconSizes = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
  }

  return (
    <Button
      variant={variant}
      size="sm"
      onClick={handleToggle}
      disabled={disabled || isLoading}
      className={cn(sizeClasses[size], "p-0", isBookmarked && "text-blue-600", className)}
      aria-label={isBookmarked ? "Убрать закладку" : "Добавить закладку"}
      title={isBookmarked ? "Убрать закладку" : "Добавить закладку"}
    >
      {isBookmarked ? (
        <BookmarkCheck className={cn(iconSizes[size], "fill-current")} />
      ) : (
        <Bookmark className={iconSizes[size]} />
      )}
    </Button>
  )
}
