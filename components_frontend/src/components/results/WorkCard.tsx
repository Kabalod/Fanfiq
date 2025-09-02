import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Work } from "@/types"
import { BadgeList } from "@/components/common/BadgeList"
import { Heart, Calendar, FileText } from "lucide-react"

interface WorkCardProps {
  /** Work data to display */
  work: Work
}

/**
 * Card displaying work information in search results
 */
export function WorkCard({ work }: WorkCardProps) {
  const formatDate = (dateString?: string) => {
    if (!dateString) return null
    return new Date(dateString).toLocaleDateString()
  }

  const formatNumber = (num?: number) => {
    if (!num) return "0"
    return num.toLocaleString()
  }

  return (
    <Card className="hover:shadow-md transition-shadow" role="listitem">
      <CardHeader className="pb-3">
        <div className="space-y-2">
          <h3 className="text-lg font-semibold leading-tight">
            <a
              href={`/works/${work.id}`}
              className="text-foreground hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm"
            >
              {work.title}
            </a>
          </h3>

          <div className="text-sm text-muted-foreground">by {work.authors.join(", ")}</div>

          <div className="flex flex-wrap gap-2">
            {work.rating && (
              <Badge variant="outline" className="text-xs">
                {work.rating}
              </Badge>
            )}
            {work.category && (
              <Badge variant="outline" className="text-xs">
                {work.category}
              </Badge>
            )}
            {work.status && (
              <Badge variant="secondary" className="text-xs">
                {work.status}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-3">
          {work.fandoms && work.fandoms.length > 0 && (
            <div>
              <span className="text-sm font-medium text-muted-foreground">Fandoms: </span>
              <span className="text-sm">{work.fandoms.join(", ")}</span>
            </div>
          )}

          {work.tags && work.tags.length > 0 && (
            <BadgeList items={work.tags} maxVisible={5} variant="secondary" size="sm" />
          )}

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            {work.word_count && (
              <div className="flex items-center gap-1">
                <FileText className="h-4 w-4" />
                <span>{formatNumber(work.word_count)} words</span>
              </div>
            )}

            {work.kudos_count !== undefined && (
              <div className="flex items-center gap-1">
                <Heart className="h-4 w-4" />
                <span>{formatNumber(work.kudos_count)} kudos</span>
              </div>
            )}

            {work.updated_at && (
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>Updated {formatDate(work.updated_at)}</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
