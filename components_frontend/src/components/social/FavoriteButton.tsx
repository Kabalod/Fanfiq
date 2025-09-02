"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Heart } from "lucide-react"
import { cn } from "@/lib/utils"

export interface FavoriteButtonProps {
  workId: string
  isFavorited: boolean
  favoritesCount: number
  onToggleFavorite?: (workId: string, isFavorited: boolean) => void
  disabled?: boolean
  size?: "sm" | "md" | "lg"
  variant?: "default" | "outline" | "ghost"
  showCount?: boolean
  className?: string
}

export function FavoriteButton({
  workId,
  isFavorited,
  favoritesCount,
  onToggleFavorite,
  disabled = false,
  size = "md",
  variant = "outline",
  showCount = true,
  className,
}: FavoriteButtonProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleToggle = async () => {
    if (disabled || isLoading) return

    setIsLoading(true)
    try {
      await onToggleFavorite?.(workId, !isFavorited)
    } finally {
      setIsLoading(false)
    }
  }

  const sizeClasses = {
    sm: "h-8 px-2 text-xs",
    md: "h-9 px-3 text-sm",
    lg: "h-10 px-4 text-base",
  }

  const iconSizes = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  }

  return (
    <Button
      variant={variant}
      size="sm"
      onClick={handleToggle}
      disabled={disabled || isLoading}
      className={cn(
        sizeClasses[size],
        isFavorited && "text-red-500 border-red-200 bg-red-50 hover:bg-red-100",
        className,
      )}
      aria-label={isFavorited ? "Убрать из избранного" : "Добавить в избранное"}
    >
      <Heart className={cn(iconSizes[size], showCount && "mr-1", isFavorited && "fill-current")} />
      {showCount && <span className="tabular-nums">{favoritesCount}</span>}
    </Button>
  )
}
