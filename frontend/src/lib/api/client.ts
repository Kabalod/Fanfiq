import axios, { AxiosInstance } from 'axios'
import { 
  SearchFilters, 
  SearchResponse, 
  SearchResponseSchema,
  Work,
  WorkSchema,
  Chapter,
  ChapterSchema
} from './schemas'

class APIClient {
  private client: AxiosInstance

  constructor() {
    this.client = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:58090',
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
    return z.array(ChapterSchema).parse(response.data)
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
}

// Экспортируем singleton
export const apiClient = new APIClient()

// Хук для React Query
import { useQuery, useMutation, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query'
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
