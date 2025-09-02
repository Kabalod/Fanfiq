import { sanitizeHtml } from "@/lib/sanitize"

interface ChapterContentProps {
  /** HTML content of the chapter */
  html: string
}

/**
 * Chapter content renderer with sanitized HTML
 */
export function ChapterContent({ html }: ChapterContentProps) {
  const sanitizedHtml = sanitizeHtml(html)

  return (
    <article
      className="prose prose-lg max-w-none dark:prose-invert prose-headings:text-balance prose-p:text-pretty"
      dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
      role="main"
      aria-label="Chapter content"
    />
  )
}
