import { NextResponse } from 'next/server'

// Базы данных для генерации реалистичных данных
const AUTHORS = [
  { name: 'Анна_Писатель', fandoms: ['Гарри Поттер', 'Шерлок BBC'] },
  { name: 'Максим_Фанфикер', fandoms: ['Marvel', 'DC Comics'] },
  { name: 'Елена_Романтик', fandoms: ['Гарри Поттер', 'Звездные войны'] },
  { name: 'Дмитрий_Автор', fandoms: ['Наруто', 'Боруто'] },
  { name: 'Мария_Фантазер', fandoms: ['Игра престолов', 'Властелин колец'] },
  { name: 'Алексей_Драма', fandoms: ['Доктор Кто', 'Торчвуд'] },
  { name: 'Ольга_Романтист', fandoms: ['Гарри Поттер', 'Супер натурал'] },
  { name: 'Сергей_Эпик', fandoms: ['Marvel', 'Звездные войны'] },
  { name: 'Ирина_Флафф', fandoms: ['Шерлок BBC', 'Гарри Поттер'] },
  { name: 'Владимир_Автор', fandoms: ['Наруто', 'Блич'] }
]

const FANDOMS = [
  'Гарри Поттер', 'Marvel', 'DC Comics', 'Наруто', 'Шерлок BBC',
  'Звездные войны', 'Игра престолов', 'Доктор Кто', 'Властелин колец', 'Супер натурал'
]

const TAGS = [
  'Романтика', 'Драма', 'Ангст', 'Флафф', 'AU', 'Hurt/Comfort', 'Фэнтези',
  'Sci-Fi', 'Мистерия', 'Приключения', 'Юмор', 'Семья', 'Дружба', 'Любовь',
  'Предательство', 'Героика', 'Трагедия', 'Комедия', 'Экшн', 'Мистика'
]

const TITLES = [
  'Тени прошлого', 'Забытые обещания', 'Сердце героя', 'Тайна древнего артефакта',
  'Любовь сквозь время', 'Битва за корону', 'Секретный агент', 'Путешествие домой',
  'Темная сторона силы', 'Ангел среди демонов', 'Золотой век', 'Кровавые узы',
  'Свет в темноте', 'Королевская интрига', 'Беглец от судьбы', 'Чудо в пустыне',
  'Огненный шторм', 'Ледяное сердце', 'Зеленый рай', 'Красная роза'
]

const SUMMARIES = [
  'История о том, как один выбор может изменить всю жизнь. Герой оказывается в сложной ситуации, где ему предстоит бороться не только с внешними врагами, но и с собственными демонами.',
  'Романтическая история, полная страсти и интриг. Два героя, чьи пути пересекаются в самый неподходящий момент, обнаруживают, что их судьбы связаны гораздо сильнее, чем они думали.',
  'Эпическая сага о борьбе добра и зла. Молодой герой отправляется в опасное путешествие, чтобы спасти свой мир от неминуемой катастрофы.',
  'Детективная история с элементами мистики. Профессиональный сыщик расследует серию загадочных происшествий, которые кажутся связанными с древней легендой.',
  'История о второй возможности. Герой получает шанс начать жизнь заново, но обнаруживает, что прошлое не так легко забыть.'
]

// Генератор тестовых данных
const generateMockWork = (id: number, filters?: any) => {
  const author = AUTHORS[Math.floor(Math.random() * AUTHORS.length)]
  const fandom = author.fandoms[Math.floor(Math.random() * author.fandoms.length)]
  const title = TITLES[Math.floor(Math.random() * TITLES.length)]
  const summary = SUMMARIES[Math.floor(Math.random() * SUMMARIES.length)]

  // Генерируем случайные значения с учетом фильтров
  let rating: 'G' | 'PG-13' | 'R' | 'NC-17' | 'NC-21' = ['G', 'PG-13', 'R', 'NC-17', 'NC-21'][Math.floor(Math.random() * 5)]
  let category: 'gen' | 'het' | 'slash' | 'femslash' | 'mixed' = ['gen', 'het', 'slash', 'femslash', 'mixed'][Math.floor(Math.random() * 5)]
  let status: 'completed' | 'in_progress' | 'frozen' = ['completed', 'in_progress', 'frozen'][Math.floor(Math.random() * 3)]

  // Если есть фильтры, пытаемся соответствовать им
  if (filters?.rating?.length > 0) {
    rating = filters.rating[Math.floor(Math.random() * filters.rating.length)]
  }
  if (filters?.category?.length > 0) {
    category = filters.category[Math.floor(Math.random() * filters.category.length)]
  }
  if (filters?.status?.length > 0) {
    status = filters.status[Math.floor(Math.random() * filters.status.length)]
  }

  const wordCount = Math.floor(Math.random() * 200000) + 1000
  const chapterCount = status === 'completed' ? Math.floor(Math.random() * 30) + 1 : Math.floor(Math.random() * 20) + 1
  const kudosCount = Math.floor(Math.random() * 5000)
  const commentsCount = Math.floor(Math.random() * 1000)

  // Генерируем теги
  const workTags = TAGS.sort(() => 0.5 - Math.random()).slice(0, Math.floor(Math.random() * 5) + 2)

  return {
    id: `work-${id}`,
    site_id: Math.random() > 0.5 ? 'ficbook' : 'authortoday',
    site_work_id: Math.random() > 0.5 ? `fb-${id}` : `at-${id}`,
    title: `${title} (${fandom})`,
    authors: [{
      id: `author-${Math.floor(Math.random() * 1000)}`,
      name: author.name,
      url: `https://ficbook.net/authors/${Math.floor(Math.random() * 1000)}`
    }],
    summary: summary,
    rating,
    category,
    status,
    language: 'ru',
    word_count: wordCount,
    chapter_count: chapterCount,
    kudos_count: kudosCount,
    comments_count: commentsCount,
    created_at: new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString(),
    updated_at: new Date(2024, 11, Math.floor(Math.random() * 28) + 1).toISOString(),
    tags: workTags,
    fandoms: [fandom],
    warnings: Math.random() > 0.7 ? ['Насилие', 'Смерть персонажа'].slice(0, Math.floor(Math.random() * 2) + 1) : [],
    url: `https://ficbook.net/readfic/${id}`
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const page = body.page || 1
    const pageSize = body.page_size || 20
    const query = body.query || ''

    // Извлекаем фильтры из запроса
    const filters = {
      rating: body.rating || [],
      category: body.category || [],
      status: body.status || [],
      tags: body.tags || [],
      fandoms: body.fandoms || [],
      warnings: body.warnings || []
    }

    // Определяем общее количество работ на основе фильтров
    let baseTotal = 200
    if (query) baseTotal = Math.floor(baseTotal * 0.4) // Поиск уменьшает результаты
    if (filters.rating.length > 0) baseTotal = Math.floor(baseTotal * 0.6)
    if (filters.category.length > 0) baseTotal = Math.floor(baseTotal * 0.7)
    if (filters.status.length > 0) baseTotal = Math.floor(baseTotal * 0.8)
    if (filters.tags.length > 0) baseTotal = Math.floor(baseTotal * 0.5)
    if (filters.fandoms.length > 0) baseTotal = Math.floor(baseTotal * 0.6)

    const totalWorks = Math.max(baseTotal, 10) // Минимум 10 результатов
    const works = []

    const start = (page - 1) * pageSize
    const end = Math.min(start + pageSize, totalWorks)

    for (let i = start; i < end; i++) {
      works.push(generateMockWork(i + 1, filters))
    }

    const response = {
      works,
      total: totalWorks,
      page,
      page_size: pageSize,
      total_pages: Math.ceil(totalWorks / pageSize)
    }

    // Имитируем задержку сети
    await new Promise(resolve => setTimeout(resolve, Math.random() * 500 + 200))

    return NextResponse.json(response)
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
