'use client'

import { useEffect, useState } from 'react'

export function MSWProvider({ children }: { children: React.ReactNode }) {
  const [mockingEnabled, setMockingEnabled] = useState(false)

  useEffect(() => {
    const initMocks = async () => {
      if (typeof window !== 'undefined') {
        const isDevelopment = process.env.NODE_ENV === 'development'
        const isMockingEnabledInDev = localStorage.getItem('msw-enabled') === 'true'

        // Включаем моки только в development режиме, если явно указано в localStorage
        // В production режиме моки НЕ используем - работаем с реальным API
        const shouldEnableMocks = isDevelopment && isMockingEnabledInDev

        if (shouldEnableMocks) {
          try {
            const { worker } = await import('@/mocks/browser')
            await worker.start({
              onUnhandledRequest: 'bypass',
            })
            setMockingEnabled(true)
            console.log('🔧 MSW моки активированы (development режим)')
          } catch (error) {
            console.error('❌ Ошибка при инициализации MSW:', error)
          }
        } else {
          console.log('📡 Работа с реальным API (production режим)')
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
