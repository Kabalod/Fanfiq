'use client'

import { useEffect, useState } from 'react'

export function MSWProvider({ children }: { children: React.ReactNode }) {
  // MSW полностью отключен - работаем только с API routes
  console.log('🚫 MSW отключен - используем встроенные API routes')

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
