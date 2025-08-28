import { z } from 'zod'

// Базовые типы
export const WorkRatingSchema = z.enum(['G', 'PG-13', 'R', 'NC-17', 'NC-21'])
export const WorkCategorySchema = z.enum(['gen', 'het', 'slash', 'femslash', 'mixed', 'other', 'article'])
export const WorkStatusSchema = z.enum(['completed', 'in_progress', 'frozen'])
export const SortFieldSchema = z.enum(['relevance', 'updated', 'created', 'title', 'kudos', 'comments', 'word_count'])
export const SortOrderSchema = z.enum(['asc', 'desc'])

// Автор
export const AuthorSchema = z.object({
  id: z.string(),
  name: z.string(),
  url: z.string().optional(),
})

// Работа
export const WorkSchema = z.object({
  id: z.string(),
  site_id: z.string(),
  site_work_id: z.string(),
  title: z.string(),
  authors: z.array(AuthorSchema),
  summary: z.string().optional(),
  rating: WorkRatingSchema.optional(),
  category: WorkCategorySchema.optional(),
  status: WorkStatusSchema.optional(),
  language: z.string().optional(),
  word_count: z.number().optional(),
  chapter_count: z.number().optional(),
  kudos_count: z.number().optional(),
  comments_count: z.number().optional(),
  created_at: z.string(),
  updated_at: z.string(),
  tags: z.array(z.string()),
  fandoms: z.array(z.string()),
  warnings: z.array(z.string()),
  url: z.string(),
})

// Фильтры поиска
export const SearchFiltersSchema = z.object({
  query: z.string().optional(),
  sites: z.array(z.string()).optional(),
  rating: z.array(WorkRatingSchema).optional(),
  category: z.array(WorkCategorySchema).optional(),
  warnings: z.array(z.string()).optional(),
  status: z.array(WorkStatusSchema).optional(),
  word_count_min: z.number().optional(),
  word_count_max: z.number().optional(),
  tags: z.array(z.string()).optional(),
  fandoms: z.array(z.string()).optional(),
  sort_by: SortFieldSchema.optional(),
  sort_order: SortOrderSchema.optional(),
  page: z.number().default(1),
  page_size: z.number().default(20),
})

// Ответ поиска
export const SearchResponseSchema = z.object({
  works: z.array(WorkSchema),
  total: z.number(),
  page: z.number(),
  page_size: z.number(),
  total_pages: z.number(),
})

// Глава
export const ChapterSchema = z.object({
  id: z.string(),
  work_id: z.string(),
  number: z.number(),
  title: z.string().optional(),
  content: z.string(),
  word_count: z.number().optional(),
  created_at: z.string(),
  updated_at: z.string(),
})

// Типы TypeScript
export type WorkRating = z.infer<typeof WorkRatingSchema>
export type WorkCategory = z.infer<typeof WorkCategorySchema>
export type WorkStatus = z.infer<typeof WorkStatusSchema>
export type SortField = z.infer<typeof SortFieldSchema>
export type SortOrder = z.infer<typeof SortOrderSchema>
export type Author = z.infer<typeof AuthorSchema>
export type Work = z.infer<typeof WorkSchema>
export type SearchFilters = z.infer<typeof SearchFiltersSchema>
export type SearchResponse = z.infer<typeof SearchResponseSchema>
export type Chapter = z.infer<typeof ChapterSchema>
