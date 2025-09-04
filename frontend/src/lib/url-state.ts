import { SearchFilters } from '@/lib/api/schemas'

export function filtersToQuery(f: Partial<SearchFilters>): URLSearchParams {
  const qs = new URLSearchParams()
  const putArr = (key: string, arr?: (string | number)[]) => {
    if (!arr) return
    for (const v of arr) qs.append(key, String(v))
  }
  if (f.query) qs.set('q', f.query)
  if (f.page) qs.set('page', String(f.page))
  if (f.page_size) qs.set('page_size', String(f.page_size))
  putArr('rating', f.rating?.filter(Boolean))
  putArr('category', f.category?.filter(Boolean))
  putArr('status', f.status?.filter(Boolean))
  putArr('warnings', f.warnings)
  putArr('tags', f.tags)
  putArr('fandoms', f.fandoms)
  putArr('sites', f.sites)
  if (f.sort_by) qs.set('sort_by', String(f.sort_by))
  if (f.sort_order) qs.set('sort_order', String(f.sort_order))
  if (f.word_count_min) qs.set('wmin', String(f.word_count_min))
  if (f.word_count_max) qs.set('wmax', String(f.word_count_max))
  return qs
}

export function queryToFilters(qs: URLSearchParams): Partial<SearchFilters> {
  const arr = (key: string) => qs.getAll(key)
  const num = (key: string) => {
    const v = qs.get(key)
    return v ? Number(v) : undefined
  }
  return {
    query: qs.get('q') || undefined,
    page: num('page'),
    page_size: num('page_size'),
    rating: arr('rating'),
    category: arr('category'),
    status: arr('status'),
    warnings: arr('warnings'),
    tags: arr('tags'),
    fandoms: arr('fandoms'),
    sites: arr('sites'),
    sort_by: qs.get('sort_by') as 'relevance' | 'updated' | 'created' | 'title' | 'kudos' | 'comments' | 'word_count' | undefined,
    sort_order: qs.get('sort_order') as 'asc' | 'desc' | undefined,
    word_count_min: num('wmin'),
    word_count_max: num('wmax'),
  }
}
