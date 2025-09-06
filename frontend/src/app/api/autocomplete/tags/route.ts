import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q') || ''

  const mockTags = [
    'Романтика', 'Драма', 'Ангст', 'Флафф', 'AU', 'Hurt/Comfort', 'Фэнтези',
    'Sci-Fi', 'Мистерия', 'Приключения', 'Юмор', 'Семья', 'Дружба', 'Любовь',
    'Предательство', 'Героика', 'Трагедия', 'Комедия', 'Экшн', 'Мистика',
    'Флашбэк', 'Воспоминания', 'Альтернативная вселенная', 'Кроссовер',
    'Тайный роман', 'Запретная любовь', 'Вторая шанса', 'Спасение мира',
    'Магия и чудеса', 'Древние пророчества', 'Битва за власть', 'Королевские интриги'
  ]

  const filteredTags = mockTags.filter(tag =>
    tag.toLowerCase().includes(query.toLowerCase())
  ).sort((a, b) => {
    // Сортируем по релевантности - точные совпадения первыми
    const aExact = a.toLowerCase().startsWith(query.toLowerCase())
    const bExact = b.toLowerCase().startsWith(query.toLowerCase())
    if (aExact && !bExact) return -1
    if (!aExact && bExact) return 1
    return a.localeCompare(b)
  })

  return NextResponse.json({
    tags: filteredTags.slice(0, 15)
  })
}
