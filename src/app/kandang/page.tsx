'use client'

import { useState, useEffect } from 'react'
import { Sidebar } from '@/components/layout/sidebar'
import { Header } from '@/components/layout/header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Plus, Edit, Trash2, Search, Home } from 'lucide-react'

interface Kandang {
  id: string
  nama: string
  jenis: string
  kapasitas: number
  jumlahAyam: number
  isActive: boolean
  createdAt: string
}

const JENIS_KANDANG = ['LITER', 'BATERAI', 'KOLONY']

export default function KandangPage() {
  const [kandangList, setKandangList] = useState<Kandang[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingKandang, setEditingKandang] = useState<Kandang | null>(null)
  const [formData, setFormData] = useState({
    nama: '',
    jenis: 'LITER',
    kapasitas: 0,
    jumlahAyam: 0,
    isActive: true
  })

  // Fetch kandang
  const fetchKandang = async () => {
    try {
      const response = await fetch('/api/kandang')
      const data = await response.json()
      setKandangList(data.kandang || [])
    } catch (error) {
      console.error('Error fetching kandang:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchKandang()
  }, [])

  // Filter kandang
  const filteredKandang = kandangList.filter(k =>
    k.nama.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const url = editingKandang
        ? `/api/kandang/${editingKandang.id}`
        : '/api/kandang'

      const method = editingKandang ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        await fetchKandang()
        setDialogOpen(false)
        resetForm()
      } else {
        const error = await response.json()
        alert(error.error || 'Terjadi kesalahan')
      }
    } catch (error) {
      console.error('Error submitting form:', error)
      alert('Terjadi kesalahan')
    }
  }

  // Handle edit
  const handleEdit = (kandang: Kandang) => {
    setEditingKandang(kandang)
    setFormData({
      nama: kandang.nama,
      jenis: kandang.jenis,
      kapasitas: kandang.kapasitas,
      jumlahAyam: kandang.jumlahAyam,
      isActive: kandang.isActive
    })
    setDialogOpen(true)
  }

  // Handle delete
  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus kandang ini?')) {
      return
    }

    try {
      const response = await fetch(`/api/kandang/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        await fetchKandang()
      } else {
        alert('Gagal menghapus kandang')
      }
    } catch (error) {
      console.error('Error deleting kandang:', error)
      alert('Terjadi kesalahan')
    }
  }

  // Reset form
  const resetForm = () => {
    setFormData({
      nama: '',
      jenis: 'LITER',
      kapasitas: 0,
      jumlahAyam: 0,
      isActive: true
    })
    setEditingKandang(null)
  }

  const getKapasitasStatus = (kandang: Kandang) => {
    const persentase = (kandang.jumlahAyam / kandang.kapasitas) * 100
    if (persentase >= 100) return { label: 'Penuh', color: 'bg-red-500' }
    if (persentase >= 75) return { label: 'Hampir Penuh', color: 'bg-yellow-500' }
    if (persentase >= 50) return { label: 'Sedang', color: 'bg-blue-500' }
    return { label: 'Kosong', color: 'bg-green-500' }
  }

  const totalAyam = kandangList.reduce((sum, k) => sum + k.jumlahAyam, 0)
  const totalKapasitas = kandangList.reduce((sum, k) => sum + k.kapasitas, 0)

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 md:ml-64">
        <Header onMenuClick={() => {}} />

        <div className="p-4 md:p-6">
          {/* Stats Cards */}
          <div className="mb-6 grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Kandang</CardTitle>
                <Home className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{kandangList.length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Kapasitas</CardTitle>
                <Home className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalKapasitas.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">ekor ayam</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Ayam</CardTitle>
                <Home className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalAyam.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">ekor ayam</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Utilisasi</CardTitle>
                <Home className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {totalKapasitas > 0 ? ((totalAyam / totalKapasitas) * 100).toFixed(1) : 0}%
                </div>
                <p className="text-xs text-muted-foreground">tingkat penggunaan</p>
              </CardContent>
            </Card>
          </div>

          {/* Header */}
          <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-bold">Manajemen Kandang</h2>
              <p className="text-muted-foreground">
                Kelola data kandang dan kapasitas ayam
              </p>
            </div>

            <Dialog open={dialogOpen} onOpenChange={(open) => {
              setDialogOpen(open)
              if (!open) resetForm()
            }}>
              <DialogTrigger asChild>
                <Button onClick={() => setEditingKandang(null)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Tambah Kandang
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingKandang ? 'Edit Kandang' : 'Tambah Kandang Baru'}
                  </DialogTitle>
                  <DialogDescription>
                    {editingKandang ? 'Edit informasi kandang' : 'Isi formulir untuk menambahkan kandang baru'}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="nama">Nama Kandang</Label>
                      <Input
                        id="nama"
                        placeholder="Contoh: Kandang A-1"
                        value={formData.nama}
                        onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="jenis">Jenis Kandang</Label>
                      <Select
                        value={formData.jenis}
                        onValueChange={(value) => setFormData({ ...formData, jenis: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih jenis kandang" />
                        </SelectTrigger>
                        <SelectContent>
                          {JENIS_KANDANG.map((jenis) => (
                            <SelectItem key={jenis} value={jenis}>
                              {jenis}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="kapasitas">Kapasitas (ekor)</Label>
                      <Input
                        id="kapasitas"
                        type="number"
                        min="1"
                        value={formData.kapasitas || ''}
                        onChange={(e) => setFormData({ ...formData, kapasitas: parseInt(e.target.value) || 0 })}
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="jumlahAyam">Jumlah Ayam Saat Ini</Label>
                      <Input
                        id="jumlahAyam"
                        type="number"
                        min="0"
                        value={formData.jumlahAyam || ''}
                        onChange={(e) => setFormData({ ...formData, jumlahAyam: parseInt(e.target.value) || 0 })}
                      />
                    </div>
                    {editingKandang && (
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="isActive"
                          checked={formData.isActive}
                          onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                        />
                        <Label htmlFor="isActive">Kandang Aktif</Label>
                      </div>
                    )}
                  </div>
                  <DialogFooter>
                    <Button type="submit">
                      {editingKandang ? 'Update' : 'Simpan'}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Search */}
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Cari kandang berdasarkan nama..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          {/* Kandang Table */}
          <Card>
            <CardHeader>
              <CardTitle>Daftar Kandang</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center p-8">
                  <p>Memuat data...</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nama Kandang</TableHead>
                      <TableHead>Jenis</TableHead>
                      <TableHead>Kapasitas</TableHead>
                      <TableHead>Jumlah Ayam</TableHead>
                      <TableHead>Utilisasi</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredKandang.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center">
                          Tidak ada kandang ditemukan
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredKandang.map((kandang) => {
                        const status = getKapasitasStatus(kandang)
                        const persentase = (kandang.jumlahAyam / kandang.kapasitas) * 100

                        return (
                          <TableRow key={kandang.id}>
                            <TableCell className="font-medium">{kandang.nama}</TableCell>
                            <TableCell>{kandang.jenis}</TableCell>
                            <TableCell>{kandang.kapasitas.toLocaleString()} ekor</TableCell>
                            <TableCell>{kandang.jumlahAyam.toLocaleString()} ekor</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <div className="h-2 w-24 rounded-full bg-gray-200">
                                  <div
                                    className="h-2 rounded-full bg-blue-500"
                                    style={{ width: `${Math.min(persentase, 100)}%` }}
                                  />
                                </div>
                                <span className="text-sm">{persentase.toFixed(1)}%</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant={kandang.isActive ? 'default' : 'secondary'}>
                                {kandang.isActive ? 'Aktif' : 'Tidak Aktif'}
                              </Badge>
                              <Badge className={`ml-2 ${status.color}`}>
                                {status.label}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => handleEdit(kandang)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => handleDelete(kandang.id)}
                                >
                                  <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        )
                      })
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
