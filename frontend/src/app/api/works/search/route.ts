import { NextResponse } from 'next/server'

// Генератор тестовых данных
const generateMockWork = (id: number) => ({
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
  rating: ['G', 'PG-13', 'R', 'NC-17', 'NC-21'][id % 5] as 'G' | 'PG-13' | 'R' | 'NC-17' | 'NC-21',
  category: ['gen', 'het', 'slash', 'femslash', 'mixed'][id % 5] as 'gen' | 'het' | 'slash' | 'femslash' | 'mixed',
  status: ['completed', 'in_progress', 'frozen'][id % 3] as 'completed' | 'in_progress' | 'frozen',
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

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const page = body.page || 1
    const pageSize = body.page_size || 20
    const query = body.query || ''

    // Генерируем тестовые данные
    const totalWorks = query ? 42 : 100
    const works = []

    const start = (page - 1) * pageSize
    const end = Math.min(start + pageSize, totalWorks)

    for (let i = start; i < end; i++) {
      works.push(generateMockWork(i + 1))
    }

    const response = {
      works,
      total: totalWorks,
      page,
      page_size: pageSize,
      total_pages: Math.ceil(totalWorks / pageSize)
    }

    // Имитируем задержку сети
    await new Promise(resolve => setTimeout(resolve, 300))

    return NextResponse.json(response)
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
