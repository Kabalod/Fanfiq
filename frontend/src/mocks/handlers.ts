import { http, HttpResponse } from 'msw'
import { SearchResponse, Work } from '@/lib/api/schemas'

// Генератор тестовых данных
const generateMockWork = (id: number): Work => ({
  id: `work-${id}`,
  site_id: 'ficbook',
  site_work_id: `fb-${id}`,
  title: `Тестовый фанфик №${id}`,
  authors: [
    {
      id: `author-${id}`,
      name: `Автор ${id}`,
      url: `https://ficbook.net/authors/${id}`
    }
  ],
  summary: `Это описание тестового фанфика номер ${id}. Здесь может быть довольно длинный текст с описанием сюжета, персонажей и основных событий истории.`,
  rating: ['G', 'PG-13', 'R', 'NC-17', 'NC-21'][id % 5] as any,
  category: ['gen', 'het', 'slash', 'femslash', 'mixed'][id % 5] as any,
  status: ['completed', 'in_progress', 'frozen'][id % 3] as any,
  language: 'ru',
  word_count: Math.floor(Math.random() * 100000) + 1000,
  chapter_count: Math.floor(Math.random() * 50) + 1,
  kudos_count: Math.floor(Math.random() * 1000),
  comments_count: Math.floor(Math.random() * 500),
  created_at: new Date(2024, 0, id).toISOString(),
  updated_at: new Date(2024, 11, id).toISOString(),
  tags: [
    'Романтика',
    'Драма',
    'Ангст',
    'Флафф',
    'AU'
  ].slice(0, Math.floor(Math.random() * 5) + 1),
  fandoms: [
    'Гарри Поттер',
    'Наруто',
    'Шерлок BBC',
    'Marvel'
  ].slice(0, Math.floor(Math.random() * 2) + 1),
  warnings: id % 3 === 0 ? ['Насилие', 'Смерть персонажа'] : [],
  url: `https://ficbook.net/readfic/${id}`
})

export const handlers = [
  // Поиск работ
  http.post('/api/v1/works/search', async ({ request }) => {
    const body = await request.json() as any
    const page = body.page || 1
    const pageSize = body.page_size || 20
    const query = body.query || ''
    
    // Генерируем моковые данные
    const totalWorks = query ? 42 : 100
    const works: Work[] = []
    
    const start = (page - 1) * pageSize
    const end = Math.min(start + pageSize, totalWorks)
    
    for (let i = start; i < end; i++) {
      works.push(generateMockWork(i + 1))
    }
    
    // Фильтруем по запросу если есть
    const filteredWorks = query 
      ? works.filter(w => 
          w.title.toLowerCase().includes(query.toLowerCase()) ||
          w.summary?.toLowerCase().includes(query.toLowerCase())
        )
      : works
    
    const response: SearchResponse = {
      works: filteredWorks,
      total: totalWorks,
      page,
      page_size: pageSize,
      total_pages: Math.ceil(totalWorks / pageSize)
    }
    
    // Имитируем задержку сети
    await new Promise(resolve => setTimeout(resolve, 500))
    
    return HttpResponse.json(response)
  }),
  
  // Получение работы по ID
  http.get('/api/v1/works/:id', ({ params }) => {
    const { id } = params
    const workId = parseInt(id as string)
    
    if (isNaN(workId)) {
      return new HttpResponse(null, { status: 404 })
    }
    
    return HttpResponse.json(generateMockWork(workId))
  }),
  
  // Получение глав работы
  http.get('/api/v1/works/:id/chapters', ({ params }) => {
    const { id } = params
    const chapters = []
    const chapterCount = Math.floor(Math.random() * 20) + 1
    
    for (let i = 0; i < chapterCount; i++) {
      chapters.push({
        id: `chapter-${id}-${i + 1}`,
        work_id: id as string,
        number: i + 1,
        title: `Глава ${i + 1}`,
        content: `<p>Содержимое главы ${i + 1}...</p>`,
        word_count: Math.floor(Math.random() * 5000) + 500,
        created_at: new Date(2024, 0, i + 1).toISOString(),
        updated_at: new Date(2024, 0, i + 1).toISOString(),
      })
    }
    
    return HttpResponse.json(chapters)
  }),
  
  // Запуск парсинга
  http.post('/api/v1/crawl', async ({ request }) => {
    const body = await request.json() as any
    
    return HttpResponse.json({
      task_id: `task-${Date.now()}`,
      message: `Парсинг ${body.url} запущен`
    })
  })
]
