// Placeholder sanitize util. In production, plug DOMPurify here.
export function sanitizeHtml(html: string): string {
  // TODO: integrate DOMPurify.sanitize(html, { /* options */ })
  return html ?? ''
}
