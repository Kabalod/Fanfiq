import { NextResponse } from 'next/server'

const AUTHORS_DB = [
  {
    name: 'Анна_Писатель',
    bio: 'Пишу фанфики уже 5 лет. Люблю создавать сложные персонажей и запутанные сюжеты.',
    interests: ['Гарри Поттер', 'Шерлок BBC', 'Романтика', 'Мистерия'],
    joinDate: '2019-03-15'
  },
  {
    name: 'Максим_Фанфикер',
    bio: 'Специализируюсь на супергеройских историях. Люблю экшн и приключения!',
    interests: ['Marvel', 'DC Comics', 'Экшн', 'Героика'],
    joinDate: '2018-11-22'
  },
  {
    name: 'Елена_Романтик',
    bio: 'Романтические истории - моя страсть. Пишу о любви в разных вселенных.',
    interests: ['Гарри Поттер', 'Звездные войны', 'Романтика', 'Флафф'],
    joinDate: '2020-01-08'
  },
  {
    name: 'Дмитрий_Автор',
    bio: 'Фанат аниме и манги. Пишу о ниндзя, магии и приключениях.',
    interests: ['Наруто', 'Боруто', 'Фэнтези', 'Приключения'],
    joinDate: '2019-07-30'
  },
  {
    name: 'Мария_Фантазер',
    bio: 'Люблю создавать альтернативные миры и эпические саги.',
    interests: ['Игра престолов', 'Властелин колец', 'Фэнтези', 'Эпик'],
    joinDate: '2020-05-12'
  }
]

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params
  const authorIndex = parseInt(id) % AUTHORS_DB.length
  const authorData = AUTHORS_DB[authorIndex]

  const mockAuthor = {
    id: id,
    name: authorData.name,
    url: `https://ficbook.net/authors/${id}`,
    works_count: Math.floor(Math.random() * 100) + 5,
    followers_count: Math.floor(Math.random() * 5000) + 50,
    description: authorData.bio,
    interests: authorData.interests,
    created_at: new Date(authorData.joinDate).toISOString(),
    updated_at: new Date().toISOString(),
    avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${authorData.name}`,
    is_verified: Math.random() > 0.8
  }

  // Имитируем задержку сети
  await new Promise(resolve => setTimeout(resolve, Math.random() * 300 + 100))

  return NextResponse.json(mockAuthor)
}
