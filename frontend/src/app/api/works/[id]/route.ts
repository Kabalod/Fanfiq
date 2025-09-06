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
const generateMockWork = (id: number) => {
  const author = AUTHORS[Math.floor(Math.random() * AUTHORS.length)]
  const fandom = author.fandoms[Math.floor(Math.random() * author.fandoms.length)]
  const title = TITLES[Math.floor(Math.random() * TITLES.length)]
  const summary = SUMMARIES[Math.floor(Math.random() * SUMMARIES.length)]

  const wordCount = Math.floor(Math.random() * 200000) + 1000
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
    rating: ['G', 'PG-13', 'R', 'NC-17', 'NC-21'][Math.floor(Math.random() * 5)] as 'G' | 'PG-13' | 'R' | 'NC-17' | 'NC-21',
    category: ['gen', 'het', 'slash', 'femslash', 'mixed'][Math.floor(Math.random() * 5)] as 'gen' | 'het' | 'slash' | 'femslash' | 'mixed',
    status: ['completed', 'in_progress', 'frozen'][Math.floor(Math.random() * 3)] as 'completed' | 'in_progress' | 'frozen',
    language: 'ru',
    word_count: wordCount,
    chapter_count: Math.floor(Math.random() * 30) + 1,
    kudos_count: kudosCount,
    comments_count: commentsCount,
    created_at: new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString(),
    updated_at: new Date(2024, 11, Math.floor(Math.random() * 28) + 1).toISOString(),
    tags: workTags,
    fandoms: [fandom],
    warnings: Math.random() > 0.7 ? ['Насилие', 'Смерть персонажа'].slice(0, Math.floor(Math.random() * 2) + 1) : [],
    url: `https://ficbook.net/readfic/${id}`,
    // Дополнительные поля для детального просмотра
    chapters: [],
    bookmarks_count: Math.floor(Math.random() * 200),
    hits_count: Math.floor(Math.random() * 10000) + kudosCount,
    published: true,
    completed: Math.random() > 0.3,
    word_count_formatted: `${Math.floor(wordCount / 1000)}k слов`
  }
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params
  const workId = parseInt(id)

  if (isNaN(workId)) {
    return NextResponse.json(
      { error: 'Invalid work ID' },
      { status: 400 }
    )
  }

  const work = generateMockWork(workId)
  return NextResponse.json(work)
}
