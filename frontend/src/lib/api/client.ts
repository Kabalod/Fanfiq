import axios, { AxiosInstance } from 'axios'
import {
  SearchFilters,
  SearchResponse,
  SearchResponseSchema,
  Work,
  WorkSchema,
  Chapter,
  ChapterSchema,
  AuthorDetail
} from './schemas'

class APIClient {
  private client: AxiosInstance

  constructor() {
    this.client = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL || '/api',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    // Response interceptor для обработки ошибок
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response) {
          // Сервер ответил с ошибкой
          console.error('API Error:', error.response.data)
        } else if (error.request) {
          // Запрос был сделан, но ответ не получен
          console.error('Network Error:', error.message)
          // Теперь используем встроенные API routes Next.js
          console.log('🔄 Работаем с API routes Next.js')
        } else {
          // Что-то пошло не так при настройке запроса
          console.error('Request Error:', error.message)
        }
        return Promise.reject(error)
      }
    )
  }

  // Поиск работ
  async searchWorks(filters: SearchFilters): Promise<SearchResponse> {
    const response = await this.client.post('/api/v1/works/search', filters)
    return SearchResponseSchema.parse(response.data)
  }

  // Получить работу по ID
  async getWork(id: string): Promise<Work> {
    const response = await this.client.get(`/api/v1/works/${id}`)
    return WorkSchema.parse(response.data)
  }

  // Получить главы работы
  async getWorkChapters(workId: string): Promise<Chapter[]> {
    const response = await this.client.get(`/api/v1/works/${workId}/chapters`)
    return ChapterSchema.array().parse(response.data)
  }

  // Получить конкретную главу
  async getChapter(workId: string, chapterNumber: number): Promise<Chapter> {
    const response = await this.client.get(`/api/v1/works/${workId}/chapters/${chapterNumber}`)
    return ChapterSchema.parse(response.data)
  }

  // Запустить парсинг работы
  async crawlWork(site: string, url: string): Promise<{ task_id: string; message: string }> {
    const response = await this.client.post('/api/v1/crawl', { site, url })
    return response.data
  }

  // Получить поддерживаемые сайты
  async getSupportedSites(): Promise<{ sites: string[] }> {
    const response = await this.client.get('/api/v1/sites')
    return response.data
  }

  // Получить теги для автодополнения
  async getTags(query: string): Promise<string[]> {
    const response = await this.client.get('/api/v1/autocomplete/tags', {
      params: { q: query }
    })
    return response.data.tags || []
  }

  // Получить фандомы для автодополнения
  async getFandoms(query: string): Promise<string[]> {
    const response = await this.client.get('/api/v1/autocomplete/fandoms', {
      params: { q: query }
    })
    return response.data.fandoms || []
  }

  // Получить детали автора
  async getAuthor(authorId: string): Promise<AuthorDetail> {
    const response = await this.client.get(`/api/v1/authors/${authorId}`)
    return response.data
  }
}

// Экспортируем singleton
export const apiClient = new APIClient()

// Хук для React Query
import { useQuery, useMutation, useInfiniteQuery, UseQueryOptions, UseMutationOptions, UseInfiniteQueryOptions } from '@tanstack/react-query'
import { z } from 'zod'

// Хук для поиска
export function useSearchWorks(
  filters: SearchFilters,
  options?: Omit<UseQueryOptions<SearchResponse, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: ['works', 'search', filters],
    queryFn: () => apiClient.searchWorks(filters),
    ...options,
  })
}

// Хук для получения работы
export function useWork(
  id: string,
  options?: Omit<UseQueryOptions<Work, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: ['works', id],
    queryFn: () => apiClient.getWork(id),
    enabled: !!id,
    ...options,
  })
}

// Хук для получения глав
export function useWorkChapters(
  workId: string,
  options?: Omit<UseQueryOptions<Chapter[], Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: ['works', workId, 'chapters'],
    queryFn: () => apiClient.getWorkChapters(workId),
    enabled: !!workId,
    ...options,
  })
}

// Хук для парсинга
export function useCrawlWork(
  options?: UseMutationOptions<{ task_id: string; message: string }, Error, { site: string; url: string }>
) {
  return useMutation({
    mutationFn: ({ site, url }) => apiClient.crawlWork(site, url),
    ...options,
  })
}

// Хук для получения поддерживаемых сайтов
export function useSupportedSites(
  options?: Omit<UseQueryOptions<{ sites: string[] }, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: ['sites', 'supported'],
    queryFn: () => apiClient.getSupportedSites(),
    ...options,
  })
}

// Infinite query hook for search
export function useSearchWorksInfinite(
  filters: Omit<SearchFilters, 'page'>,
  options?: Omit<UseInfiniteQueryOptions<SearchResponse, Error>, 'queryKey' | 'queryFn'>
) {
  return useInfiniteQuery({
    queryKey: ['works', 'search', 'infinite', filters],
    queryFn: ({ pageParam = 1 }) => apiClient.searchWorks({ ...filters, page: pageParam }),
    getNextPageParam: (lastPage) => {
      if (lastPage.page < lastPage.total_pages) {
        return lastPage.page + 1
      }
      return undefined
    },
    ...options,
  })
}

// Autocomplete hook
export function useAutocomplete(
  type: 'tags' | 'fandoms',
  query: string,
  options?: Omit<UseQueryOptions<string[], Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: ['autocomplete', type, query],
    queryFn: () => {
      if (!query) return []
      if (type === 'tags') return apiClient.getTags(query)
      return apiClient.getFandoms(query)
    },
    ...options,
  })
}

// Author Detail hook
export function useAuthor(
  authorId: string,
  options?: Omit<UseQueryOptions<AuthorDetail, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: ['authors', authorId],
    queryFn: () => apiClient.getAuthor(authorId),
    enabled: !!authorId,
    ...options,
  })
}
