'use client'

import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { AuthForm } from '@/components/auth/AuthForm'
import { useAuthStore } from '@/store/auth'
import { apiClient } from '@/lib/api/client'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const { setAuth } = useAuthStore()

  const { mutate, isPending } = useMutation({
    mutationFn: (values) => apiClient.login(values.email, values.password),
    onSuccess: (data) => {
      const { access_token } = data
      // TODO: Decode token to get user info or fetch from /me
      // For now, using a placeholder
      setAuth(access_token, { email: 'user@example.com', id: 1 })
      router.push('/profile')
    },
    onError: (error) => {
      // TODO: Show toast notification
      console.error(error)
    },
  })

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-full max-w-md p-8 space-y-8 bg-card rounded-lg shadow">
        <h2 className="text-2xl font-bold text-center">Вход</h2>
        <AuthForm onSubmit={mutate} />
        <p className="text-center">
          Нет аккаунта?{' '}
          <Link href="/register" className="font-medium text-primary hover:underline">
            Зарегистрироваться
          </Link>
        </p>
      </div>
    </div>
  )
}
