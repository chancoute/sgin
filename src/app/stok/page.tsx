'use client'

import { useState, useEffect } from 'react'
import { Sidebar } from '@/components/layout/sidebar'
import { Header } from '@/components/layout/header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
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
import { Plus, Edit, Trash2, Search, Package, AlertTriangle } from 'lucide-react'

interface Stok {
  id: string
  jenis: string
  nama: string
  jumlah: number
  satuan: string
  hargaSatuan: number | null
  keterangan: string | null
  createdAt: string
  updatedAt: string
}

const JENIS_STOK = [
  'BAHAN_BAKU_PAKAN',
  'PAKAN_JADI',
  'TELUR',
  'OBAT',
  'PETI_TELUR'
]

const JENIS_STOK_LABEL: Record<string, string> = {
  BAHAN_BAKU_PAKAN: 'Bahan Baku Pakan',
  PAKAN_JADI: 'Pakan Jadi',
  TELUR: 'Telur',
  OBAT: 'Obat-obatan',
  PETI_TELUR: 'Peti Telur'
}

const SATUAN_OPTIONS = ['kg', 'butir', 'box', 'pcs', 'liter', 'paket']

export default function StokPage() {
  const [stokList, setStokList] = useState<Stok[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedJenis, setSelectedJenis] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingStok, setEditingStok] = useState<Stok | null>(null)
  const [formData, setFormData] = useState({
    jenis: 'BAHAN_BAKU_PAKAN',
    nama: '',
    jumlah: 0,
    satuan: 'kg',
    hargaSatuan: 0,
    keterangan: ''
  })

  // Fetch stok
  const fetchStok = async () => {
    try {
      const response = await fetch('/api/stok')
      const data = await response.json()
      setStokList(data.stok || [])
    } catch (error) {
      console.error('Error fetching stok:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStok()
  }, [])

  // Filter stok
  const filteredStok = stokList.filter(s => {
    const matchesSearch = s.nama.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesJenis = !selectedJenis || s.jenis === selectedJenis
    return matchesSearch && matchesJenis
  })

  // Calculate summary
  const getStokSummary = (jenis: string) => {
    const items = stokList.filter(s => s.jenis === jenis)
    return {
      count: items.length,
      total: items.reduce((sum, s) => sum + s.jumlah, 0),
      satuan: items[0]?.satuan || ''
    }
  }

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const url = editingStok
        ? `/api/stok/${editingStok.id}`
        : '/api/stok'

      const method = editingStok ? 'PUT' : 'POST'

      const payload = {
        ...formData,
        hargaSatuan: formData.hargaSatuan || null,
        keterangan: formData.keterangan || null
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      if (response.ok) {
        await fetchStok()
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
  const handleEdit = (stok: Stok) => {
    setEditingStok(stok)
    setFormData({
      jenis: stok.jenis,
      nama: stok.nama,
      jumlah: stok.jumlah,
      satuan: stok.satuan,
      hargaSatuan: stok.hargaSatuan || 0,
      keterangan: stok.keterangan || ''
    })
    setDialogOpen(true)
  }

  // Handle delete
  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus stok ini?')) {
      return
    }

    try {
      const response = await fetch(`/api/stok/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        await fetchStok()
      } else {
        alert('Gagal menghapus stok')
      }
    } catch (error) {
      console.error('Error deleting stok:', error)
      alert('Terjadi kesalahan')
    }
  }

  // Reset form
  const resetForm = () => {
    setFormData({
      jenis: 'BAHAN_BAKU_PAKAN',
      nama: '',
      jumlah: 0,
      satuan: 'kg',
      hargaSatuan: 0,
      keterangan: ''
    })
    setEditingStok(null)
  }

  const getJenisBadgeColor = (jenis: string) => {
    switch (jenis) {
      case 'BAHAN_BAKU_PAKAN':
        return 'bg-green-500'
      case 'PAKAN_JADI':
        return 'bg-blue-500'
      case 'TELUR':
        return 'bg-yellow-500'
      case 'OBAT':
        return 'bg-red-500'
      case 'PETI_TELUR':
        return 'bg-purple-500'
      default:
        return 'bg-gray-500'
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
          {/* Stats Cards */}
          <div className="mb-6 grid gap-4 md:grid-cols-5">
            {JENIS_STOK.map((jenis) => {
              const summary = getStokSummary(jenis)
              return (
                <Card key={jenis}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      {JENIS_STOK_LABEL[jenis]}
                    </CardTitle>
                    <Package className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{summary.count}</div>
                    <p className="text-xs text-muted-foreground">
                      {summary.total.toLocaleString()} {summary.satuan}
                    </p>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Header */}
          <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-bold">Manajemen Stok</h2>
              <p className="text-muted-foreground">
                Kelola semua stok bahan baku, pakan, telur, obat, dan peti telur
              </p>
            </div>

            <Dialog open={dialogOpen} onOpenChange={(open) => {
              setDialogOpen(open)
              if (!open) resetForm()
            }}>
              <DialogTrigger asChild>
                <Button onClick={() => setEditingStok(null)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Tambah Stok
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingStok ? 'Edit Stok' : 'Tambah Stok Baru'}
                  </DialogTitle>
                  <DialogDescription>
                    {editingStok ? 'Edit informasi stok' : 'Isi formulir untuk menambahkan stok baru'}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="jenis">Jenis Stok</Label>
                      <Select
                        value={formData.jenis}
                        onValueChange={(value) => setFormData({ ...formData, jenis: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih jenis stok" />
                        </SelectTrigger>
                        <SelectContent>
                          {JENIS_STOK.map((jenis) => (
                            <SelectItem key={jenis} value={jenis}>
                              {JENIS_STOK_LABEL[jenis]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="nama">Nama Barang</Label>
                      <Input
                        id="nama"
                        placeholder="Contoh: Jagung Giling, Telur Bagus, Vitamin A"
                        value={formData.nama}
                        onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                        required
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="jumlah">Jumlah</Label>
                      <Input
                        id="jumlah"
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.jumlah || ''}
                        onChange={(e) => setFormData({ ...formData, jumlah: parseFloat(e.target.value) || 0 })}
                        required
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="satuan">Satuan</Label>
                      <Select
                        value={formData.satuan}
                        onValueChange={(value) => setFormData({ ...formData, satuan: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih satuan" />
                        </SelectTrigger>
                        <SelectContent>
                          {SATUAN_OPTIONS.map((satuan) => (
                            <SelectItem key={satuan} value={satuan}>
                              {satuan}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="hargaSatuan">Harga per Satuan (opsional)</Label>
                      <Input
                        id="hargaSatuan"
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="Rp 0"
                        value={formData.hargaSatuan || ''}
                        onChange={(e) => setFormData({ ...formData, hargaSatuan: parseFloat(e.target.value) || 0 })}
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="keterangan">Keterangan (opsional)</Label>
                      <Input
                        id="keterangan"
                        placeholder="Keterangan tambahan"
                        value={formData.keterangan}
                        onChange={(e) => setFormData({ ...formData, keterangan: e.target.value })}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit">
                      {editingStok ? 'Update' : 'Simpan'}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Filters */}
          <div className="mb-4 grid gap-4 md:grid-cols-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Cari stok berdasarkan nama..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={selectedJenis} onValueChange={setSelectedJenis}>
              <SelectTrigger>
                <SelectValue placeholder="Filter berdasarkan jenis stok" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Semua Jenis</SelectItem>
                {JENIS_STOK.map((jenis) => (
                  <SelectItem key={jenis} value={jenis}>
                    {JENIS_STOK_LABEL[jenis]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Stok Table */}
          <Card>
            <CardHeader>
              <CardTitle>Daftar Stok</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center p-8">
                  <p>Memuat data...</p>
                </div>
              ) : (
                <div className="max-h-96 overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nama Barang</TableHead>
                        <TableHead>Jenis</TableHead>
                        <TableHead>Jumlah</TableHead>
                        <TableHead>Harga Satuan</TableHead>
                        <TableHead>Total Nilai</TableHead>
                        <TableHead>Keterangan</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredStok.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center">
                            Tidak ada stok ditemukan
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredStok.map((stok) => {
                          const isLowStock = stok.jumlah <= 10
                          const totalNilai = stok.hargaSatuan
                            ? stok.jumlah * stok.hargaSatuan
                            : 0

                          return (
                            <TableRow key={stok.id}>
                              <TableCell className="font-medium">
                                {stok.nama}
                                {isLowStock && (
                                  <span className="ml-2 text-red-500">
                                    <AlertTriangle className="inline h-4 w-4" />
                                  </span>
                                )}
                              </TableCell>
                              <TableCell>
                                <Badge className={getJenisBadgeColor(stok.jenis)}>
                                  {JENIS_STOK_LABEL[stok.jenis]}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className={`font-semibold ${isLowStock ? 'text-red-500' : ''}`}>
                                  {stok.jumlah.toLocaleString()} {stok.satuan}
                                </div>
                              </TableCell>
                              <TableCell>
                                {stok.hargaSatuan
                                  ? `Rp ${stok.hargaSatuan.toLocaleString()}`
                                  : '-'}
                              </TableCell>
                              <TableCell>
                                {totalNilai > 0
                                  ? `Rp ${totalNilai.toLocaleString()}`
                                  : '-'}
                              </TableCell>
                              <TableCell className="max-w-xs truncate">
                                {stok.keterangan || '-'}
                              </TableCell>
                              <TableCell>
                                <Badge variant={isLowStock ? 'destructive' : 'default'}>
                                  {isLowStock ? 'Stok Menipis' : 'Tersedia'}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    onClick={() => handleEdit(stok)}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    onClick={() => handleDelete(stok.id)}
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
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
