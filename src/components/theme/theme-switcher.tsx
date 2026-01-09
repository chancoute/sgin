'use client'

import { useTheme } from '@/lib/theme/theme-provider'
import { Sun, Moon, Monitor } from 'lucide-react'

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme()

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Monitor className="h-5 w-5 text-muted-foreground" />
        <h3 className="text-lg font-semibold">Pilih Tema</h3>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <button
          onClick={() => setTheme('light')}
          className={`
            flex items-center gap-3 rounded-lg border-2 p-4 transition-all hover:shadow-lg
            ${theme === 'light'
              ? 'border-primary bg-primary/5'
              : 'border-border hover:border-primary/50'
            }
          `}
        >
          <Sun className="h-6 w-6 text-yellow-500" />
          <div className="text-left">
            <div className="font-medium">Terang</div>
            <div className="text-xs text-muted-foreground">Mode terang</div>
          </div>
        </button>

        <button
          onClick={() => setTheme('dark')}
          className={`
            flex items-center gap-3 rounded-lg border-2 p-4 transition-all hover:shadow-lg
            ${theme === 'dark'
              ? 'border-primary bg-primary/5'
              : 'border-border hover:border-primary/50'
            }
          `}
        >
          <Moon className="h-6 w-6 text-blue-500" />
          <div className="text-left">
            <div className="font-medium">Gelap</div>
            <div className="text-xs text-muted-foreground">Mode gelap</div>
          </div>
        </button>

        <button
          onClick={() => setTheme('system')}
          className={`
            flex items-center gap-3 rounded-lg border-2 p-4 transition-all hover:shadow-lg
            ${theme === 'system'
              ? 'border-primary bg-primary/5'
              : 'border-border hover:border-primary/50'
            }
          `}
        >
          <Monitor className="h-6 w-6 text-gray-500" />
          <div className="text-left">
            <div className="font-medium">Sistem</div>
            <div className="text-xs text-muted-foreground">Ikuti sistem</div>
          </div>
        </button>
      </div>
    </div>
  )
}
