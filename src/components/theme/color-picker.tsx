'use client'

import { useTheme } from '@/lib/theme/theme-provider'
import { Palette } from 'lucide-react'

interface ColorOption {
  name: string
  value: string
  preview: string
}

const COLORS: ColorOption[] = [
  { name: 'Biru', value: 'blue', preview: 'bg-blue-500' },
  { name: 'Hijau', value: 'green', preview: 'bg-green-500' },
  { name: 'Ungu', value: 'purple', preview: 'bg-purple-500' },
  { name: 'Orange', value: 'orange', preview: 'bg-orange-500' },
  { name: 'Merah', value: 'red', preview: 'bg-red-500' },
  { name: 'Teal', value: 'teal', preview: 'bg-teal-500' },
  { name: 'Cyan', value: 'cyan', preview: 'bg-cyan-500' },
  { name: 'Pink', value: 'pink', preview: 'bg-pink-500' },
]

const COLOR_MAP: Record<string, string> = {
  blue: 'blue',
  green: 'green',
  purple: 'purple',
  orange: 'orange',
  red: 'red',
  teal: 'teal',
  cyan: 'cyan',
  pink: 'pink',
}

export function ColorPicker() {
  const { primaryColor, setPrimaryColor } = useTheme()

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Palette className="h-5 w-5 text-muted-foreground" />
        <h3 className="text-lg font-semibold">Pilih Warna Tema</h3>
      </div>

      <div className="grid gap-3 md:grid-cols-4">
        {COLORS.map((color) => (
          <button
            key={color.value}
            onClick={() => setPrimaryColor(COLOR_MAP[color.value])}
            className={`
              relative flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-all
              hover:shadow-lg
              ${primaryColor === COLOR_MAP[color.value]
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/50'
              }
            `}
          >
            <div
              className={`h-12 w-full rounded-md ${color.preview} transition-transform hover:scale-105`}
            />
            <span className="text-sm font-medium">{color.name}</span>
            {primaryColor === COLOR_MAP[color.value] && (
              <div className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
