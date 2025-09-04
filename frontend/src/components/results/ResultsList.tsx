'use client'

import { Work } from '@/lib/api/schemas'
import { WorkCard } from './WorkCard'
import { Skeleton } from '@/components/results/Skeleton'
import { useVirtualizer } from '@tanstack/react-virtual'
import { useRef } from 'react'

export function WorkCardSkeleton() {
  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="space-y-3">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <div className="flex flex-wrap gap-2">
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-6 w-12" />
        </div>
        <div className="flex gap-4 pt-2">
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-4 w-1/3" />
        </div>
      </div>
    </div>
  )
}

export function ResultsList({ works, isLoading }: { works: Work[], isLoading?: boolean }) {
  const parentRef = useRef<HTMLDivElement>(null)

  const rowVirtualizer = useVirtualizer({
    count: isLoading ? 6 : works.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 160, // Estimate height of a card + gap
    overscan: 5,
  })

  return (
    <div ref={parentRef} className="h-[calc(100vh-200px)] overflow-y-auto">
      <div
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
        className="grid md:grid-cols-1 lg:grid-cols-2"
      >
        {rowVirtualizer.getVirtualItems().map((virtualItem) => (
          <div
            key={virtualItem.key}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '50%',
              transform: `translateY(${virtualItem.start}px)`,
              padding: '0.75rem',
            }}
          >
            {isLoading ? <WorkCardSkeleton /> : <WorkCard work={works[virtualItem.index]} />}
          </div>
        ))}
      </div>
    </div>
  )
}
