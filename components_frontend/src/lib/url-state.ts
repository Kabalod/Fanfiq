import type { SearchFilters } from "@/types"

/**
 * Convert search filters to URL query parameters
 *
 * @param filters - Search filters object
 * @returns URLSearchParams object
 */
export function filtersToQuery(filters: SearchFilters): URLSearchParams {
  const params = new URLSearchParams()

  // Add simple string filters
  if (filters.rating) params.set("rating", filters.rating)
  if (filters.category) params.set("category", filters.category)
  if (filters.status) params.set("status", filters.status)
  if (filters.sortBy) params.set("sort_by", filters.sortBy)
  if (filters.sortOrder) params.set("sort_order", filters.sortOrder)

  // Add array filters
  if (filters.warnings?.length) {
    params.set("warnings", filters.warnings.join(","))
  }
  if (filters.tags?.length) {
    params.set("tags", filters.tags.join(","))
  }
  if (filters.fandoms?.length) {
    params.set("fandoms", filters.fandoms.join(","))
  }
  if (filters.sites?.length) {
    params.set("sites", filters.sites.join(","))
  }

  // Add word range
  if (filters.wordRange?.min) {
    params.set("word_min", filters.wordRange.min.toString())
  }
  if (filters.wordRange?.max) {
    params.set("word_max", filters.wordRange.max.toString())
  }

  return params
}

/**
 * Convert URL query parameters to search filters
 *
 * @param searchParams - URLSearchParams object
 * @returns SearchFilters object
 */
export function queryToFilters(searchParams: URLSearchParams): SearchFilters {
  const filters: SearchFilters = {}

  // Parse simple string filters
  const rating = searchParams.get("rating")
  if (rating) filters.rating = rating

  const category = searchParams.get("category")
  if (category) filters.category = category

  const status = searchParams.get("status")
  if (status) filters.status = status

  const sortBy = searchParams.get("sort_by")
  if (sortBy) filters.sortBy = sortBy

  const sortOrder = searchParams.get("sort_order")
  if (sortOrder === "asc" || sortOrder === "desc") {
    filters.sortOrder = sortOrder
  }

  // Parse array filters
  const warnings = searchParams.get("warnings")
  if (warnings) {
    filters.warnings = warnings.split(",").filter(Boolean)
  }

  const tags = searchParams.get("tags")
  if (tags) {
    filters.tags = tags.split(",").filter(Boolean)
  }

  const fandoms = searchParams.get("fandoms")
  if (fandoms) {
    filters.fandoms = fandoms.split(",").filter(Boolean)
  }

  const sites = searchParams.get("sites")
  if (sites) {
    filters.sites = sites.split(",").filter(Boolean)
  }

  // Parse word range
  const wordMin = searchParams.get("word_min")
  const wordMax = searchParams.get("word_max")
  if (wordMin || wordMax) {
    filters.wordRange = {}
    if (wordMin) filters.wordRange.min = Number.parseInt(wordMin)
    if (wordMax) filters.wordRange.max = Number.parseInt(wordMax)
  }

  return filters
}

/**
 * Update URL with current filters (helper for client-side usage)
 *
 * @param filters - Current search filters
 * @param replace - Whether to replace current history entry
 */
export function updateUrlWithFilters(filters: SearchFilters, replace = false): void {
  const params = filtersToQuery(filters)
  const url = new URL(window.location.href)
  url.search = params.toString()

  if (replace) {
    window.history.replaceState({}, "", url.toString())
  } else {
    window.history.pushState({}, "", url.toString())
  }
}

/**
 * Get current filters from URL (helper for client-side usage)
 *
 * @returns Current search filters from URL
 */
export function getFiltersFromUrl(): SearchFilters {
  if (typeof window === "undefined") return {}

  const searchParams = new URLSearchParams(window.location.search)
  return queryToFilters(searchParams)
}
