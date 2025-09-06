'use client'

import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { AuthForm } from '@/components/auth/AuthForm'
import { apiClient } from '@/lib/api/client'
import Link from 'next/link'

export default function RegisterPage() {
  const router = useRouter()

  const { mutate, isPending } = useMutation({
    mutationFn: (values) => apiClient.register(values.email, values.password),
    onSuccess: () => {
      // TODO: Optionally log in user automatically
      router.push('/login')
    },
    onError: (error) => {
      // TODO: Show toast notification
      console.error(error)
    },
  })

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-full max-w-md p-8 space-y-8 bg-card rounded-lg shadow">
        <h2 className="text-2xl font-bold text-center">Регистрация</h2>
        <AuthForm onSubmit={mutate} isRegister />
        <p className="text-center">
          Уже есть аккаунт?{' '}
          <Link href="/login" className="font-medium text-primary hover:underline">
            Войти
          </Link>
        </p>
      </div>
    </div>
  )
}
