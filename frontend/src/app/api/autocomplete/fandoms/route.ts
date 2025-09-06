import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q') || ''

  const mockFandoms = [
    'Гарри Поттер', 'Наруто', 'Шерлок BBC', 'Marvel', 'DC Comics',
    'Звездные войны', 'Игра престолов', 'Доктор Кто', 'Властелин колец',
    'Супер натурал', 'Боруто', 'Блич', 'Торчвуд', 'Фейри Тейл',
    'Атака титанов', 'Моя геройская академия', 'Демон Slayer', 'Токийский гуль',
    'Стальной алхимик', 'Ходячий замок Хаула', 'Унесённые призраками',
    'Принцесса Мононоке', 'Наусика из Долины ветров', 'Корпорация монстров',
    'История игрушек', 'В поисках Немо', 'Король лев', 'Мулан',
    'Русалочка', 'Красавица и чудовище', 'Аладдин', 'Геркулес',
    'Тарзан', 'Пиноккио', 'Бэмби', 'Дамбо', 'Фантазия', 'Дисней'
  ]

  const filteredFandoms = mockFandoms.filter(fandom =>
    fandom.toLowerCase().includes(query.toLowerCase())
  ).sort((a, b) => {
    // Сортируем по релевантности - точные совпадения первыми
    const aExact = a.toLowerCase().startsWith(query.toLowerCase())
    const bExact = b.toLowerCase().startsWith(query.toLowerCase())
    if (aExact && !bExact) return -1
    if (!aExact && bExact) return 1
    return a.localeCompare(b)
  })

  return NextResponse.json({
    fandoms: filteredFandoms.slice(0, 12)
  })
}
