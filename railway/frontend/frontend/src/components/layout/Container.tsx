'use client'

import React from 'react'
import clsx from 'clsx'

export function Container({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={clsx('mx-auto max-w-6xl px-4 sm:px-6 lg:px-8', className)}>
      {children}
    </div>
  )
}


