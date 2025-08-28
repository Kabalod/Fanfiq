'use client'

import { useEffect, useState } from 'react'

export function MSWProvider({ children }: { children: React.ReactNode }) {
  const [mockingEnabled, setMockingEnabled] = useState(false)

  useEffect(() => {
    const initMocks = async () => {
      if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
        const isMockingEnabled = localStorage.getItem('msw-enabled') === 'true'
        
        if (isMockingEnabled) {
          const { worker } = await import('@/mocks/browser')
          await worker.start({
            onUnhandledRequest: 'bypass',
          })
          setMockingEnabled(true)
          console.log('🔧 MSW моки активированы')
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
