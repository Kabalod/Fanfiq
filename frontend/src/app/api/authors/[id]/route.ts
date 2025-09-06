import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params

  const mockAuthor = {
    id: id,
    name: `Автор ${id}`,
    url: `https://ficbook.net/authors/${id}`,
    works_count: Math.floor(Math.random() * 50) + 1,
    followers_count: Math.floor(Math.random() * 1000),
    description: `Это описание автора ${id}. Здесь может быть биография, интересы и другая информация.`,
    created_at: new Date(2020, 0, 1).toISOString(),
    updated_at: new Date().toISOString()
  }

  return NextResponse.json(mockAuthor)
}
