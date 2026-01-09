'use client'

import { Sidebar } from '@/components/layout/sidebar'
import { Header } from '@/components/layout/header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ThemeSwitcher } from '@/components/theme/theme-switcher'
import { ColorPicker } from '@/components/theme/color-picker'
import { Palette, Monitor, RotateCcw } from 'lucide-react'
import { useTheme } from '@/lib/theme/theme-provider'

export default function AppearancePage() {
  const { primaryColor, setPrimaryColor } = useTheme()

  const resetTheme = () => {
    if (confirm('Apakah Anda yakin ingin mereset tampilan ke pengaturan awal?')) {
      setPrimaryColor('blue')
      localStorage.removeItem('theme')
      window.location.reload()
    }
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 md:ml-64">
        <Header onMenuClick={() => {}} />

        <div className="p-4 md:p-6">
          {/* Header */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Palette className="h-8 w-8 text-primary" />
              Customisasi Tampilan
            </h2>
            <p className="text-muted-foreground">
              Sesuaikan tema, warna, dan tampilan sistem sesuai preferensi Anda
            </p>
          </div>

          {/* Theme Selection */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Monitor className="h-5 w-5" />
                Pilihan Tema
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <ThemeSwitcher />
            </CardContent>
          </Card>

          {/* Color Selection */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Warna Utama</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <ColorPicker />
            </CardContent>
          </Card>

          {/* Reset Button */}
          <Card>
            <CardHeader>
              <CardTitle className="text-red-600">Reset Tampilan</CardTitle>
            </CardHeader>
            <CardContent>
              <button
                onClick={resetTheme}
                className="flex items-center gap-2 rounded-lg border-2 border-red-200 bg-red-50 px-6 py-4 text-red-700 transition-all hover:border-red-400 hover:bg-red-100 hover:shadow-lg"
              >
                <RotateCcw className="h-5 w-5" />
                <span className="font-medium">Kembali ke Pengaturan Awal</span>
              </button>
              <p className="mt-3 text-sm text-muted-foreground">
                Tindakan ini akan mengembalikan tema dan warna ke pengaturan default.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
