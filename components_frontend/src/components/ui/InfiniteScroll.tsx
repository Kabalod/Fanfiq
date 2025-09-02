"use client"

import type React from "react"

import { useEffect, useRef, useCallback } from "react"
import { Loader2 } from "lucide-react"

export interface InfiniteScrollProps {
  children: React.ReactNode
  hasMore: boolean
  isLoading: boolean
  onLoadMore: () => void
  threshold?: number
  className?: string
}

export function InfiniteScroll({
  children,
  hasMore,
  isLoading,
  onLoadMore,
  threshold = 100,
  className,
}: InfiniteScrollProps) {
  const observerRef = useRef<HTMLDivElement>(null)
  const loadingRef = useRef(false)

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [target] = entries
      if (target.isIntersecting && hasMore && !isLoading && !loadingRef.current) {
        loadingRef.current = true
        onLoadMore()
      }
    },
    [hasMore, isLoading, onLoadMore],
  )

  useEffect(() => {
    if (isLoading) {
      loadingRef.current = false
    }
  }, [isLoading])

  useEffect(() => {
    const element = observerRef.current
    if (!element) return

    const observer = new IntersectionObserver(handleObserver, {
      threshold: 0,
      rootMargin: `${threshold}px`,
    })

    observer.observe(element)

    return () => {
      if (element) {
        observer.unobserve(element)
      }
    }
  }, [handleObserver, threshold])

  return (
    <div className={className}>
      {children}

      {/* Loading trigger element */}
      <div ref={observerRef} className="h-4" />

      {/* Loading indicator */}
      {isLoading && (
        <div className="flex justify-center items-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="ml-2 text-sm text-muted-foreground">Загрузка...</span>
        </div>
      )}

      {/* End message */}
      {!hasMore && !isLoading && (
        <div className="text-center py-8">
          <p className="text-sm text-muted-foreground">Больше результатов нет</p>
        </div>
      )}
    </div>
  )
}
