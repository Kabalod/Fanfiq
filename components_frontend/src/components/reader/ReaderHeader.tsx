import type { Work } from "@/types"
import { Badge } from "@/components/ui/badge"
import { BadgeList } from "@/components/common/BadgeList"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ReaderHeaderProps {
  /** Work being read */
  work: Work
}

/**
 * Header for the reader showing work information
 */
export function ReaderHeader({ work }: ReaderHeaderProps) {
  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container max-w-4xl mx-auto px-4 py-4">
        <div className="flex items-start gap-4">
          <Button variant="ghost" size="sm" asChild className="mt-1">
            <a href="/search" aria-label="Back to search">
              <ArrowLeft className="h-4 w-4" />
            </a>
          </Button>

          <div className="flex-1 space-y-3">
            <h1 className="text-2xl font-bold leading-tight text-balance">{work.title}</h1>

            <div className="text-muted-foreground">by {work.authors.join(", ")}</div>

            <div className="flex flex-wrap gap-2">
              {work.rating && <Badge variant="outline">{work.rating}</Badge>}
              {work.category && <Badge variant="outline">{work.category}</Badge>}
              {work.status && <Badge variant="secondary">{work.status}</Badge>}
            </div>

            {work.fandoms && work.fandoms.length > 0 && (
              <div className="text-sm">
                <span className="font-medium text-muted-foreground">Fandoms: </span>
                <span>{work.fandoms.join(", ")}</span>
              </div>
            )}

            {work.tags && work.tags.length > 0 && (
              <BadgeList items={work.tags} maxVisible={8} variant="secondary" size="sm" />
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
