'use client'

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

type ReaderSettings = {
  theme: 'light' | 'dark' | 'sepia'
  fontSize: number
}

interface SettingsState {
  reader: ReaderSettings
  setReaderTheme: (theme: ReaderSettings['theme']) => void
  setFontSize: (size: number) => void
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      reader: {
        theme: 'light',
        fontSize: 16,
      },
      setReaderTheme: (theme) =>
        set((state) => ({ reader: { ...state.reader, theme } })),
      setFontSize: (size) =>
        set((state) => ({ reader: { ...state.reader, fontSize: size } })),
    }),
    {
      name: 'settings-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
)
