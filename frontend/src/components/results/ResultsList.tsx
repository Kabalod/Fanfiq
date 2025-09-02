'use client'

import { Work } from '@/lib/api/schemas'
import { WorkCard } from './WorkCard'
import { Skeleton } from '@/components/ui/skeleton'

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
  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <WorkCardSkeleton key={i} />
        ))}
      </div>
    )
  }
  
  return (
    <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
      {works.map((work) => (
        <WorkCard key={work.id} work={work} />
      ))}
    </div>
  )
}
