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
import { Plus, Edit, Trash2, Search, Egg, TrendingUp, Package } from 'lucide-react'

interface HargaTelur {
  id: string
  jenis: string
  hargaPerKg: number
  hargaPerPeti: number | null
  tanggal: string
  createdAt: string
}

interface LatestPrices {
  [key: string]: {
    hargaPerKg: number
    hargaPerPeti: number | null
    tanggal: string
  }
}

const JENIS_TELUR = ['BAGUS', 'BENTES', 'CREAM']

const JENIS_TELUR_LABEL: Record<string, string> = {
  BAGUS: 'Telur Bagus',
  BENTES: 'Telur Bentes',
  CREAM: 'Telur Cream'
}

const JENIS_TELUR_COLOR: Record<string, string> = {
  BAGUS: 'bg-green-500',
  BENTES: 'bg-yellow-500',
  CREAM: 'bg-orange-500'
}

export default function TelurPage() {
  const [hargaTelurList, setHargaTelurList] = useState<HargaTelur[]>([])
  const [latestPrices, setLatestPrices] = useState<LatestPrices>({})
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedJenis, setSelectedJenis] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingHarga, setEditingHarga] = useState<HargaTelur | null>(null)
  const [formData, setFormData] = useState({
    jenis: 'BAGUS',
    hargaPerKg: 0,
    hargaPerPeti: 0,
    tanggal: new Date().toISOString().split('T')[0]
  })

  // Fetch harga telur
  const fetchHargaTelur = async () => {
    try {
      const response = await fetch('/api/harga-telur')
      const data = await response.json()
      setHargaTelurList(data.hargaTelur || [])

      // Group latest prices by jenis
      const latest: LatestPrices = {}
      data.latestPrices?.forEach((h: HargaTelur) => {
        latest[h.jenis] = {
          hargaPerKg: h.hargaPerKg,
          hargaPerPeti: h.hargaPerPeti,
          tanggal: h.tanggal
        }
      })
      setLatestPrices(latest)
    } catch (error) {
      console.error('Error fetching harga telur:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchHargaTelur()
  }, [])

  // Filter harga telur
  const filteredHargaTelur = hargaTelurList.filter(h => {
    const matchesSearch = true
    const matchesJenis = !selectedJenis || h.jenis === selectedJenis
    return matchesSearch && matchesJenis
  })

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const url = editingHarga
        ? `/api/harga-telur/${editingHarga.id}`
        : '/api/harga-telur'

      const method = editingHarga ? 'PUT' : 'POST'

      const payload = {
        ...formData,
        hargaPerPeti: formData.hargaPerPeti || undefined
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      if (response.ok) {
        await fetchHargaTelur()
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
  const handleEdit = (harga: HargaTelur) => {
    setEditingHarga(harga)
    setFormData({
      jenis: harga.jenis,
      hargaPerKg: harga.hargaPerKg,
      hargaPerPeti: harga.hargaPerPeti || 0,
      tanggal: harga.tanggal.split('T')[0]
    })
    setDialogOpen(true)
  }

  // Handle delete
  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus harga ini?')) {
      return
    }

    try {
      const response = await fetch(`/api/harga-telur/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        await fetchHargaTelur()
      } else {
        alert('Gagal menghapus harga')
      }
    } catch (error) {
      console.error('Error deleting harga:', error)
      alert('Terjadi kesalahan')
    }
  }

  // Reset form
  const resetForm = () => {
    setFormData({
      jenis: 'BAGUS',
      hargaPerKg: 0,
      hargaPerPeti: 0,
      tanggal: new Date().toISOString().split('T')[0]
    })
    setEditingHarga(null)
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
              <Egg className="h-8 w-8 text-primary" />
              Manajemen Telur & Harga
            </h2>
            <p className="text-muted-foreground">
              Kelola harga telur (telur bagus, bentes, cream) dan pantau history harga
            </p>
          </div>

          {/* Latest Prices Cards */}
          <div className="mb-6 grid gap-4 md:grid-cols-3">
            {JENIS_TELUR.map((jenis) => {
              const harga = latestPrices[jenis]
              return (
                <Card key={jenis}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      {JENIS_TELUR_LABEL[jenis]}
                    </CardTitle>
                    <Egg className={`h-4 w-4 ${JENIS_TELUR_COLOR[jenis]}`} />
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div>
                        <p className="text-2xl font-bold">
                          Rp {harga?.hargaPerKg.toLocaleString()}
                        </p>
                        <p className="text-xs text-muted-foreground">per kg</p>
                      </div>
                      {harga?.hargaPerPeti && (
                        <div>
                          <p className="text-lg font-semibold text-green-600">
                            Rp {harga.hargaPerPeti.toLocaleString()}
                          </p>
                          <p className="text-xs text-muted-foreground">per peti (25kg)</p>
                        </div>
                      )}
                      {harga && (
                        <p className="text-xs text-muted-foreground">
                          Update: {new Date(harga.tanggal).toLocaleDateString('id-ID')}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Header & Actions */}
          <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="text-xl font-bold">History Harga Telur</h3>
              <p className="text-sm text-muted-foreground">
                Riwayat perubahan harga telur
              </p>
            </div>

            <Dialog open={dialogOpen} onOpenChange={(open) => {
              setDialogOpen(open)
              if (!open) resetForm()
            }}>
              <DialogTrigger asChild>
                <Button onClick={() => setEditingHarga(null)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Input Harga Baru
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingHarga ? 'Edit Harga Telur' : 'Input Harga Telur Baru'}
                  </DialogTitle>
                  <DialogDescription>
                    {editingHarga ? 'Edit harga telur' : 'Input harga telur untuk setiap jenis'}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="jenis">Jenis Telur</Label>
                      <Select
                        value={formData.jenis}
                        onValueChange={(value) => setFormData({ ...formData, jenis: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih jenis telur" />
                        </SelectTrigger>
                        <SelectContent>
                          {JENIS_TELUR.map((jenis) => (
                            <SelectItem key={jenis} value={jenis}>
                              {JENIS_TELUR_LABEL[jenis]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="hargaPerKg">Harga per Kg</Label>
                      <Input
                        id="hargaPerKg"
                        type="number"
                        min="0"
                        step="100"
                        placeholder="Rp 0"
                        value={formData.hargaPerKg || ''}
                        onChange={(e) => setFormData({ ...formData, hargaPerKg: parseFloat(e.target.value) || 0 })}
                        required
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="hargaPerPeti">Harga per Peti (25 kg) - Opsional</Label>
                      <Input
                        id="hargaPerPeti"
                        type="number"
                        min="0"
                        step="100"
                        placeholder="Rp 0"
                        value={formData.hargaPerPeti || ''}
                        onChange={(e) => setFormData({ ...formData, hargaPerPeti: parseFloat(e.target.value) || 0 })}
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="tanggal">Tanggal Berlaku</Label>
                      <Input
                        id="tanggal"
                        type="date"
                        value={formData.tanggal}
                        onChange={(e) => setFormData({ ...formData, tanggal: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit">
                      {editingHarga ? 'Update' : 'Simpan'}
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
                placeholder="Cari history harga..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={selectedJenis} onValueChange={setSelectedJenis}>
              <SelectTrigger>
                <SelectValue placeholder="Filter berdasarkan jenis telur" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Semua Jenis</SelectItem>
                {JENIS_TELUR.map((jenis) => (
                  <SelectItem key={jenis} value={jenis}>
                    {JENIS_TELUR_LABEL[jenis]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Harga Telur Table */}
          <Card>
            <CardHeader>
              <CardTitle>Riwayat Harga Telur</CardTitle>
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
                        <TableHead>Tanggal</TableHead>
                        <TableHead>Jenis Telur</TableHead>
                        <TableHead>Harga per Kg</TableHead>
                        <TableHead>Harga per Peti</TableHead>
                        <TableHead>Trend</TableHead>
                        <TableHead className="text-right">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredHargaTelur.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center">
                            Tidak ada data harga ditemukan
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredHargaTelur.map((harga, index) => {
                          // Calculate trend
                          const previousHarga = filteredHargaTelur[index + 1]
                          let trend = null
                          if (previousHarga && previousHarga.jenis === harga.jenis) {
                            const diff = harga.hargaPerKg - previousHarga.hargaPerKg
                            trend = diff > 0 ? 'naik' : diff < 0 ? 'turun' : 'stabil'
                          }

                          return (
                            <TableRow key={harga.id}>
                              <TableCell>
                                {new Date(harga.tanggal).toLocaleDateString('id-ID')}
                              </TableCell>
                              <TableCell>
                                <Badge className={JENIS_TELUR_COLOR[harga.jenis]}>
                                  {JENIS_TELUR_LABEL[harga.jenis]}
                                </Badge>
                              </TableCell>
                              <TableCell className="font-semibold">
                                Rp {harga.hargaPerKg.toLocaleString()}
                              </TableCell>
                              <TableCell>
                                {harga.hargaPerPeti
                                  ? `Rp ${harga.hargaPerPeti.toLocaleString()}`
                                  : '-'}
                              </TableCell>
                              <TableCell>
                                {trend === 'naik' && (
                                  <Badge className="bg-green-500">
                                    <TrendingUp className="mr-1 h-3 w-3" /> Naik
                                  </Badge>
                                )}
                                {trend === 'turun' && (
                                  <Badge variant="destructive">
                                    <TrendingUp className="mr-1 h-3 w-3 rotate-180" /> Turun
                                  </Badge>
                                )}
                                {trend === 'stabil' && (
                                  <Badge variant="secondary">Stabil</Badge>
                                )}
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    onClick={() => handleEdit(harga)}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    onClick={() => handleDelete(harga.id)}
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
