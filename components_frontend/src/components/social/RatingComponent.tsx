"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Star } from "lucide-react"
import { cn } from "@/lib/utils"

export interface RatingComponentProps {
  workId: string
  currentRating: number // 1-5 stars
  ratingsCount: number
  averageRating: number
  userRating?: number
  onRate?: (workId: string, rating: number) => void
  disabled?: boolean
  showDistribution?: boolean
  className?: string
}

export function RatingComponent({
  workId,
  currentRating,
  ratingsCount,
  averageRating,
  userRating,
  onRate,
  disabled = false,
  showDistribution = false,
  className,
}: RatingComponentProps) {
  const [hoveredRating, setHoveredRating] = useState(0)
  const [isLoading, setIsLoading] = useState(false)

  const handleRate = async (rating: number) => {
    if (disabled || isLoading) return

    setIsLoading(true)
    try {
      await onRate?.(workId, rating)
    } finally {
      setIsLoading(false)
    }
  }

  const StarButton = ({ index }: { index: number }) => {
    const isFilled = index <= (hoveredRating || userRating || 0)
    const isHovered = hoveredRating >= index

    return (
      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0 hover:bg-transparent"
        onMouseEnter={() => setHoveredRating(index)}
        onMouseLeave={() => setHoveredRating(0)}
        onClick={() => handleRate(index)}
        disabled={disabled || isLoading}
      >
        <Star
          className={cn(
            "h-5 w-5 transition-colors",
            isFilled ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground",
            isHovered && "text-yellow-400",
          )}
        />
      </Button>
    )
  }

  return (
    <Card className={className}>
      <CardContent className="p-4 space-y-4">
        {/* Rating Display */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={cn(
                  "h-4 w-4",
                  star <= Math.round(averageRating) ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground",
                )}
              />
            ))}
          </div>
          <div className="text-sm text-muted-foreground">
            {averageRating.toFixed(1)} из 5 ({ratingsCount} оценок)
          </div>
        </div>

        {/* User Rating */}
        {!disabled && (
          <div className="space-y-2">
            <p className="text-sm font-medium">{userRating ? "Ваша оценка:" : "Оценить работу:"}</p>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <StarButton key={star} index={star} />
              ))}
            </div>
            {userRating && <p className="text-xs text-muted-foreground">Вы поставили {userRating} из 5 звезд</p>}
          </div>
        )}

        {/* Rating Distribution */}
        {showDistribution && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Распределение оценок:</p>
            {[5, 4, 3, 2, 1].map((stars) => {
              const count = Math.floor(Math.random() * ratingsCount * 0.3) // Mock data
              const percentage = ratingsCount > 0 ? (count / ratingsCount) * 100 : 0

              return (
                <div key={stars} className="flex items-center gap-2 text-xs">
                  <span className="w-8">{stars}★</span>
                  <div className="flex-1 bg-muted rounded-full h-2">
                    <div
                      className="bg-yellow-400 h-2 rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="w-8 text-muted-foreground">{count}</span>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
