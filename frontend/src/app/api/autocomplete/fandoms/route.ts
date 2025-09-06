import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q') || ''

  const mockFandoms = [
    'Гарри Поттер', 'Наруто', 'Шерлок BBC', 'Marvel', 'DC Comics',
    'Звездные войны', 'Игра престолов', 'Доктор Кто', 'Супер натурал'
  ]

  const filteredFandoms = mockFandoms.filter(fandom =>
    fandom.toLowerCase().includes(query.toLowerCase())
  )

  return NextResponse.json({
    fandoms: filteredFandoms.slice(0, 10)
  })
}
