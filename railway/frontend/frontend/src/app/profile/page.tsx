'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth'

export default function ProfilePage() {
  const router = useRouter()
  const { user, token } = useAuthStore()

  useEffect(() => {
    if (!token) {
      router.push('/login')
    }
  }, [token, router])

  if (!user) {
    return <div>Загрузка...</div>
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold">Профиль</h1>
      <p>Email: {user.email}</p>
      {/* TODO: Fetch and display bookmarks */}
    </div>
  )
}
