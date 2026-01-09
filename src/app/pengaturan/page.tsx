'use client'

import { useState, useEffect } from 'react'
import { Sidebar } from '@/components/layout/sidebar'
import { Header } from '@/components/layout/header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Settings, Shield, RefreshCw } from 'lucide-react'

const ROLES = ['SUPER_USER', 'ADMIN', 'PETUGAS', 'PIMPINAN']

const ROLE_LABELS: Record<string, string> = {
  SUPER_USER: 'Super User',
  ADMIN: 'Admin',
  PETUGAS: 'Petugas',
  PIMPINAN: 'Pimpinan'
}

const FITUR_LIST = [
  { id: 'dashboard', label: 'Dashboard', icon: '📊' },
  { id: 'users', label: 'Manajemen Pengguna', icon: '👥' },
  { id: 'kandang', label: 'Manajemen Kandang', icon: '🏠' },
  { id: 'stok', label: 'Manajemen Stok', icon: '📦' },
  { id: 'data-harian', label: 'Input Data Harian', icon: '📝' },
  { id: 'nutrisi', label: 'Nutrisi Pakan', icon: '🌾' },
  { id: 'telur', label: 'Manajemen Telur', icon: '🥚' },
  { id: 'kesehatan', label: 'Kesehatan', icon: '🏥' },
  { id: 'penjualan', label: 'Penjualan', icon: '💰' },
  { id: 'keuangan', label: 'Keuangan', icon: '💵' },
  { id: 'laporan', label: 'Laporan', icon: '📋' },
  { id: 'ai-analysis', label: 'AI Analysis', icon: '🤖' },
  { id: 'pengaturan', label: 'Pengaturan', icon: '⚙️' }
]

interface Permission {
  id: string
  role: string
  fitur: string
  bisaAkses: boolean
}

export default function PengaturanPage() {
  const [permissions, setPermissions] = useState<Record<string, Permission[]>>({})
  const [selectedRole, setSelectedRole] = useState('SUPER_USER')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Fetch permissions
  const fetchPermissions = async () => {
    try {
      const response = await fetch('/api/role-permissions')
      const data = await response.json()
      setPermissions(data.groupedPermissions || {})
    } catch (error) {
      console.error('Error fetching permissions:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPermissions()
  }, [])

  // Initialize default permissions
  const initializePermissions = async () => {
    if (!confirm('Apakah Anda yakin ingin mereset semua permission ke default?')) {
      return
    }

    setSaving(true)
    try {
      await fetch('/api/role-permissions', {
        method: 'PUT'
      })
      await fetchPermissions()
      alert('Permission berhasil di-reset ke default')
    } catch (error) {
      console.error('Error initializing permissions:', error)
      alert('Gagal mereset permission')
    } finally {
      setSaving(false)
    }
  }

  // Toggle permission
  const togglePermission = async (role: string, fitur: string, value: boolean) => {
    try {
      await fetch('/api/role-permissions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          role,
          fitur,
          bisaAkses: value
        })
      })

      // Update local state
      setPermissions(prev => ({
        ...prev,
        [role]: prev[role]?.map(p =>
          p.role === role && p.fitur === fitur
            ? { ...p, bisaAkses: value }
            : p
        ) || []
      }))
    } catch (error) {
      console.error('Error toggling permission:', error)
      alert('Gagal mengubah permission')
    }
  }

  const currentPermissions = permissions[selectedRole] || []
  const permissionMap = new Map(
    currentPermissions.map(p => [p.fitur, p.bisaAkses] as [string, boolean])
  )

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 md:ml-64">
        <Header onMenuClick={() => {}} />

        <div className="p-4 md:p-6">
          {/* Header */}
          <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Settings className="h-8 w-8 text-primary" />
                Pengaturan Role
              </h2>
              <p className="text-muted-foreground">
                Konfigurasi akses fitur untuk setiap role pengguna
              </p>
            </div>

            <Button
              variant="outline"
              onClick={initializePermissions}
              disabled={saving}
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${saving ? 'animate-spin' : ''}`} />
              Reset ke Default
            </Button>
          </div>

          {/* Role Selector */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Pilih Role</label>
                  <Select
                    value={selectedRole}
                    onValueChange={setSelectedRole}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ROLES.map(role => (
                        <SelectItem key={role} value={role}>
                          {ROLE_LABELS[role]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <label className="text-sm font-medium">Jumlah Fitur Terakses</label>
                  <div className="flex items-center gap-2 h-10 px-3 rounded-md border">
                    <Shield className="h-4 w-4 text-primary" />
                    <span className="text-lg font-semibold">
                      {currentPermissions.filter(p => p.bisaAkses).length} / {FITUR_LIST.length}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Permissions Grid */}
          {loading ? (
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <p>Memuat data...</p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  Fitur yang Diakses oleh {ROLE_LABELS[selectedRole]}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                  {FITUR_LIST.map((fitur) => {
                    const hasAccess = permissionMap.get(fitur.id) || false

                    return (
                      <div
                        key={fitur.id}
                        className={`rounded-lg border p-4 transition-all ${
                          hasAccess
                            ? 'bg-green-50 border-green-200'
                            : 'bg-gray-50 border-gray-200'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-2xl">{fitur.icon}</span>
                              <h4 className="font-semibold">{fitur.label}</h4>
                            </div>
                            <Badge
                              variant={hasAccess ? 'default' : 'secondary'}
                              className={hasAccess ? 'bg-green-500' : ''}
                            >
                              {hasAccess ? 'Diakses' : 'Diblokir'}
                            </Badge>
                          </div>
                          <Switch
                            checked={hasAccess}
                            onCheckedChange={(checked) =>
                              togglePermission(selectedRole, fitur.id, checked)
                            }
                            disabled={selectedRole === 'SUPER_USER'}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Info */}
                {selectedRole === 'SUPER_USER' && (
                  <div className="mt-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
                    <p className="text-sm text-blue-800">
                      <strong>ℹ️ Info:</strong> Super User memiliki akses penuh ke semua fitur.
                      Tidak dapat diubah.
                    </p>
                  </div>
                )}

                {selectedRole === 'PETUGAS' && (
                  <div className="mt-6 rounded-lg border border-yellow-200 bg-yellow-50 p-4">
                    <p className="text-sm text-yellow-800">
                      <strong>ℹ️ Info:</strong> Petugas hanya memiliki akses terbatas untuk operasional sehari-hari
                      (Input Data Harian, Stok, Kesehatan).
                    </p>
                  </div>
                )}

                {selectedRole === 'PIMPINAN' && (
                  <div className="mt-6 rounded-lg border border-purple-200 bg-purple-50 p-4">
                    <p className="text-sm text-purple-800">
                      <strong>ℹ️ Info:</strong> Pimpinan memiliki akses read-only untuk melihat laporan dan analisis AI
                      (Dashboard, Laporan, AI Analysis).
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}
