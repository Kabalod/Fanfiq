'use client'

import { useMSWToggle } from '@/lib/msw-provider'
import { Button } from '@/components/ui/button'
import { Bug } from 'lucide-react'

export function DevTools() {
  const { enabled, toggle } = useMSWToggle()

  // Показываем только в development
  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Button
        variant={enabled ? "default" : "outline"}
        size="sm"
        onClick={toggle}
        className="shadow-lg"
      >
        <Bug className="h-4 w-4 mr-2" />
        {enabled ? 'MSW включен' : 'MSW выключен'}
      </Button>
    </div>
  )
}
