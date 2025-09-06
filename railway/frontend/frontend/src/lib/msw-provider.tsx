'use client'

import { useEffect, useState } from 'react'

export function MSWProvider({ children }: { children: React.ReactNode }) {
  const [mockingEnabled, setMockingEnabled] = useState(false)

  useEffect(() => {
    const initMocks = async () => {
      if (typeof window !== 'undefined') {
        // Включаем моки в development режиме, если явно указано в localStorage
        // В production режиме включаем моки всегда для работы без базы данных
        const isDevelopment = process.env.NODE_ENV === 'development'
        const isMockingEnabledInDev = localStorage.getItem('msw-enabled') === 'true'
        const shouldEnableMocks = !isDevelopment || isMockingEnabledInDev

        if (shouldEnableMocks) {
          try {
            const { worker } = await import('@/mocks/browser')
            await worker.start({
              onUnhandledRequest: 'bypass',
            })
            setMockingEnabled(true)
            console.log('🔧 MSW моки активированы')
          } catch (error) {
            console.error('❌ Ошибка при инициализации MSW:', error)
          }
        }
      }
    }

    initMocks()
  }, [])

  return <>{children}</>
}

// Утилита для включения/выключения моков
export function useMSWToggle() {
  const [enabled, setEnabled] = useState(false)

  useEffect(() => {
    setEnabled(localStorage.getItem('msw-enabled') === 'true')
  }, [])

  const toggle = () => {
    const newValue = !enabled
    localStorage.setItem('msw-enabled', newValue.toString())
    setEnabled(newValue)
    // Перезагружаем страницу для применения изменений
    window.location.reload()
  }

  return { enabled, toggle }
}
