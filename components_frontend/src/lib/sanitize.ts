/**
 * Sanitize HTML content for safe rendering
 *
 * TODO: Implement proper HTML sanitization using DOMPurify or similar library
 * For now, this is a placeholder that returns the HTML as-is
 *
 * @param html - Raw HTML string to sanitize
 * @returns Sanitized HTML string safe for dangerouslySetInnerHTML
 */
export function sanitizeHtml(html: string): string {
  // PLACEHOLDER: In production, use DOMPurify or similar
  // Example implementation:
  // import DOMPurify from 'dompurify';
  // return DOMPurify.sanitize(html, {
  //   ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'i', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
  //   ALLOWED_ATTR: ['class']
  // });

  return html
}
