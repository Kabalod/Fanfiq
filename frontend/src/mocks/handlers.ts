import { http, HttpResponse } from 'msw'
import { SearchResponse, Work, Chapter } from '@/lib/api/schemas'

// Генератор тестовых данных
const generateMockWork = (id: number): Work => ({
  id: `work-${id}`,
  site_id: id % 2 === 0 ? 'ficbook' : 'authortoday',
  site_work_id: id % 2 === 0 ? `fb-${id}` : `at-${id}`,
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

    // Фильтры
    const ratingFilter = body.rating || []
    const categoryFilter = body.category || []
    const statusFilter = body.status || []
    const warningsFilter = body.warnings || []
    const tagsFilter = body.tags || []
    const fandomsFilter = body.fandoms || []
    const wordCountMin = body.word_count_min || 0
    const wordCountMax = body.word_count_max || 1000000

    // Генерируем моковые данные
    let totalWorks = query ? 42 : 100
    const works: Work[] = []

    const start = (page - 1) * pageSize
    const end = Math.min(start + pageSize, totalWorks)

    for (let i = start; i < end; i++) {
      works.push(generateMockWork(i + 1))
    }

    // Применяем фильтры
    let filteredWorks = works

    // Фильтр по запросу
    if (query) {
      filteredWorks = filteredWorks.filter(w =>
        w.title.toLowerCase().includes(query.toLowerCase()) ||
        w.summary?.toLowerCase().includes(query.toLowerCase())
      )
    }

    // Фильтр по рейтингу
    if (ratingFilter.length > 0) {
      filteredWorks = filteredWorks.filter(w => w.rating && ratingFilter.includes(w.rating))
    }

    // Фильтр по категории
    if (categoryFilter.length > 0) {
      filteredWorks = filteredWorks.filter(w => w.category && categoryFilter.includes(w.category))
    }

    // Фильтр по статусу
    if (statusFilter.length > 0) {
      filteredWorks = filteredWorks.filter(w => w.status && statusFilter.includes(w.status))
    }

    // Фильтр по предупреждениям
    if (warningsFilter.length > 0) {
      filteredWorks = filteredWorks.filter(w =>
        w.warnings && warningsFilter.some(warning => w.warnings.includes(warning))
      )
    }

    // Фильтр по тегам
    if (tagsFilter.length > 0) {
      filteredWorks = filteredWorks.filter(w =>
        w.tags && tagsFilter.some(tag => w.tags.includes(tag))
      )
    }

    // Фильтр по фандомам
    if (fandomsFilter.length > 0) {
      filteredWorks = filteredWorks.filter(w =>
        w.fandoms && fandomsFilter.some(fandom => w.fandoms.includes(fandom))
      )
    }

    // Фильтр по количеству слов
    filteredWorks = filteredWorks.filter(w =>
      w.word_count && w.word_count >= wordCountMin && w.word_count <= wordCountMax
    )

    // Корректируем общее количество с учетом фильтров
    const filteredRatio = filteredWorks.length / works.length
    totalWorks = Math.round(totalWorks * filteredRatio)

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
        title: `Глава ${i + 1}: ${['Начало', 'Развитие', 'Кульминация', 'Развязка', 'Эпилог'][i % 5]}`,
        content: `<h2>Глава ${i + 1}</h2>
<p>Это начало ${i + 1}-й главы нашего замечательного фанфика. Здесь происходит много интересных событий и развивается сюжет.</p>

<p>Главный герой стоял у окна, задумчиво глядя на городские огни. В его голове крутились мысли о прошлом, настоящем и будущем. Что ждет его дальше?</p>

<p>Вдруг раздался стук в дверь. "Кто там?" - спросил он, подходя ближе. За дверью стоял старый друг, которого он не видел уже много лет.</p>

<p>Они сели за стол и начали разговор. Воспоминания нахлынули волной, и время пролетело незаметно. Когда друг ушел, герой понял, что некоторые вещи никогда не меняются.</p>

<p>На следующий день он проснулся с новой решимостью. Нужно было действовать, пока не поздно. Он взял сумку и вышел из дома, не оглядываясь назад.</p>`,
        word_count: Math.floor(Math.random() * 5000) + 500,
        created_at: new Date(2024, 0, i + 1).toISOString(),
        updated_at: new Date(2024, 0, i + 1).toISOString(),
      })
    }

    return HttpResponse.json(chapters)
  }),

  // Получение конкретной главы
  http.get('/api/v1/works/:workId/chapters/:chapterNumber', ({ params }) => {
    const { workId, chapterNumber } = params
    const chapterNum = parseInt(chapterNumber as string)

    const chapter: Chapter = {
      id: `chapter-${workId}-${chapterNum}`,
      work_id: workId as string,
      number: chapterNum,
      title: `Глава ${chapterNum}: ${['Начало', 'Развитие', 'Кульминация', 'Развязка', 'Эпилог'][chapterNum % 5]}`,
      content: `<h2>Глава ${chapterNum}</h2>
<p>Это ${chapterNum}-я глава нашего замечательного фанфика. Здесь происходит много интересных событий и развивается сюжет.</p>

<p>Главный герой стоял у окна, задумчиво глядя на городские огни. В его голове крутились мысли о прошлом, настоящем и будущем. Что ждет его дальше?</p>

<p>Вдруг раздался стук в дверь. "Кто там?" - спросил он, подходя ближе. За дверью стоял старый друг, которого он не видел уже много лет.</p>

<p>Они сели за стол и начали разговор. Воспоминания нахлынули волной, и время пролетело незаметно. Когда друг ушел, герой понял, что некоторые вещи никогда не меняются.</p>

<p>На следующий день он проснулся с новой решимостью. Нужно было действовать, пока не поздно. Он взял сумку и вышел из дома, не оглядываясь назад.</p>`,
      word_count: Math.floor(Math.random() * 5000) + 500,
      created_at: new Date(2024, 0, chapterNum).toISOString(),
      updated_at: new Date(2024, 0, chapterNum).toISOString(),
    }

    return HttpResponse.json(chapter)
  }),
  
  // Запуск парсинга
  http.post('/api/v1/crawl', async ({ request }) => {
    const body = await request.json() as any

    return HttpResponse.json({
      task_id: `task-${Date.now()}`,
      message: `Парсинг ${body.url} запущен`
    })
  }),

  // Получение поддерживаемых сайтов
  http.get('/api/v1/sites', () => {
    return HttpResponse.json({
      sites: ['ficbook', 'authortoday']
    })
  })
]
