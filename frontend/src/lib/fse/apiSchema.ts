import { z } from 'zod'

export const WorkSchema = z.object({
  id: z.string(),
  original_url: z.string().url().optional(),
  title: z.string(),
  author_name: z.string(),
  author_url: z.string().url().optional(),
  summary: z.string().default(''),
  language: z.string().default('ru'),
  fandoms: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
  rating: z.string(),
  category: z.enum(["Gen","Het","Slash","Femslash","Other"]).optional(),
  status: z.enum(["In Progress","Completed","On Hiatus"]),
  warnings: z.array(z.string()).optional(),
  word_count: z.number().int().nonnegative(),
  likes_count: z.number().int().optional(),
  comments_count: z.number().int().optional(),
  published_at: z.string().optional(),
  updated_at: z.string().optional(),
})

export const SearchFiltersSchema = z.object({
  source_sites: z.array(z.string()).optional(),
  query: z.string().optional(),
  language: z.string().optional(),
  fandom: z.array(z.string()).optional(),
  include_tags: z.array(z.string()).optional(),
  exclude_tags: z.array(z.string()).optional(),
  rating: z.string().optional(),
  status: z.string().optional(),
  category: z.string().optional(),
  warnings: z.array(z.string()).optional(),
  word_count_min: z.number().optional(),
  word_count_max: z.number().optional(),
  likes_min: z.number().optional(),
  comments_min: z.number().optional(),
  date_updated_after: z.string().optional(),
  date_updated_before: z.string().optional(),
  page: z.number().int().positive().optional(),
  page_size: z.number().int().positive().max(100).optional(),
  sort: z.enum(['relevance','updated_desc','popularity_desc','words_desc','words_asc']).optional(),
})

export const SearchResponseSchema = z.object({
  total_pages: z.number().int().nonnegative(),
  current_page: z.number().int().nonnegative(),
  results: z.array(WorkSchema),
})

export type Work = z.infer<typeof WorkSchema>
export type SearchFilters = z.infer<typeof SearchFiltersSchema>
export type SearchResponse = z.infer<typeof SearchResponseSchema>
