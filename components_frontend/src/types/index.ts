// Core types for the Fanfiq application

export interface Work {
  id: string
  title: string
  authors: string[]
  tags: string[]
  updated_at?: string
  word_count?: number
  kudos_count?: number
  rating?: string
  category?: string
  status?: string
  warnings?: string[]
  fandoms?: string[]
  sites?: string[]
}

export interface Chapter {
  id: string
  title: string
  content: string
  word_count?: number
  order: number
}

export interface SearchFilters {
  rating?: string
  category?: string
  status?: string
  warnings?: string[]
  tags?: string[]
  fandoms?: string[]
  wordRange?: { min?: number; max?: number }
  sites?: string[]
  sortBy?: string
  sortOrder?: "asc" | "desc"
}

export type ReaderTheme = "light" | "dark" | "sepia"
