'use client'

import { useEffect } from 'react'

export function useHotkeys(
  hotkeys: Record<string, (event: KeyboardEvent) => void>
) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase()
      if (hotkeys[key]) {
        hotkeys[key](event)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [hotkeys])
}
