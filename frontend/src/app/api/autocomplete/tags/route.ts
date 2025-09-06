import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q') || ''

  const mockTags = [
    'Романтика', 'Драма', 'Ангст', 'Флафф', 'AU', 'Hurt/Comfort',
    'Фэнтези', 'Sci-Fi', 'Мистерия', 'Приключения', 'Юмор'
  ]

  const filteredTags = mockTags.filter(tag =>
    tag.toLowerCase().includes(query.toLowerCase())
  )

  return NextResponse.json({
    tags: filteredTags.slice(0, 10)
  })
}
