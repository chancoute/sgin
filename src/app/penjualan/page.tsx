'use client'

import { useState, useEffect } from 'react'
import { Sidebar } from '@/components/layout/sidebar'
import { Header } from '@/components/layout/header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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
import { Plus, Edit, Trash2, Search, ShoppingCart, FileText, Egg, Package } from 'lucide-react'

interface Penjualan {
  id: string
  nomorInvoice: string
  tanggal: string
  pelanggan: string
  userId: string
  telurKg: number
  telurPeti: number
  ayamAfkir: number
  ayamPulet: number
  totalHarga: number
  dibayar: number
  sisa: number
  keterangan: string | null
  createdAt: string
  user: {
    id: string
    name: string
  }
}

interface Summary {
  totalTransaksi: number
  totalHarga: number
  totalTelurKg: number
  totalTelurPeti: number
  totalAyamAfkir: number
  totalAyamPulet: number
}

export default function PenjualanPage() {
  const [penjualanList, setPenjualanList] = useState<Penjualan[]>([])
  const [summary, setSummary] = useState<Summary | null>(null)
  const [usersList, setUsersList] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingPenjualan, setEditingPenjualan] = useState<Penjualan | null>(null)
  const [formData, setFormData] = useState({
    nomorInvoice: '',
    tanggal: new Date().toISOString().split('T')[0],
    pelanggan: '',
    userId: '',
    telurKg: 0,
    telurPeti: 0,
    ayamAfkir: 0,
    ayamPulet: 0,
    hargaTelurPerKg: 0,
    hargaTelurPerPeti: 0,
    hargaAyamAfkir: 0,
    hargaAyamPulet: 0,
    dibayar: 0,
    keterangan: ''
  })

  // Fetch penjualan
  const fetchPenjualan = async () => {
    try {
      const params = new URLSearchParams()
      if (startDate) params.append('startDate', startDate)
      if (endDate) params.append('endDate', endDate)

      const [penjualanResponse, usersResponse] = await Promise.all([
        fetch(`/api/penjualan?${params.toString()}`),
        fetch('/api/users')
      ])

      const penjualanData = await penjualanResponse.json()
      const usersData = await usersResponse.json()

      setPenjualanList(penjualanData.penjualan || [])
      setSummary(penjualanData.summary)
      setUsersList(usersData.users || [])
    } catch (error) {
      console.error('Error fetching penjualan:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPenjualan()
  }, [startDate, endDate])

  // Filter penjualan
  const filteredPenjualan = penjualanList.filter(p =>
    p.nomorInvoice.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.pelanggan.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Calculate total for current form
  const calculateTotal = () => {
    const totalTelur = (formData.telurKg || 0) * (formData.hargaTelurPerKg || 0) +
                       (formData.telurPeti || 0) * (formData.hargaTelurPerPeti || 0)
    const totalAyam = (formData.ayamAfkir || 0) * (formData.hargaAyamAfkir || 0) +
                     (formData.ayamPulet || 0) * (formData.hargaAyamPulet || 0)
    return totalTelur + totalAyam
  }

  const sisa = calculateTotal() - (formData.dibayar || 0)

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const url = editingPenjualan
        ? `/api/penjualan/${editingPenjualan.id}`
        : '/api/penjualan'

      const method = editingPenjualan ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          dibayar: formData.dibayar || 0
        })
      })

      if (response.ok) {
        await fetchPenjualan()
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
  const handleEdit = (penjualan: Penjualan) => {
    setEditingPenjualan(penjualan)
    setFormData({
      nomorInvoice: penjualan.nomorInvoice,
      tanggal: penjualan.tanggal.split('T')[0],
      pelanggan: penjualan.pelanggan,
      userId: penjualan.userId,
      telurKg: penjualan.telurKg,
      telurPeti: penjualan.telurPeti,
      ayamAfkir: penjualan.ayamAfkir,
      ayamPulet: penjualan.ayamPulet,
      hargaTelurPerKg: 0,
      hargaTelurPerPeti: 0,
      hargaAyamAfkir: 0,
      hargaAyamPulet: 0,
      dibayar: penjualan.dibayar,
      keterangan: penjualan.keterangan || ''
    })
    setDialogOpen(true)
  }

  // Handle delete
  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus penjualan ini?')) {
      return
    }

    try {
      const response = await fetch(`/api/penjualan/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        await fetchPenjualan()
      } else {
        alert('Gagal menghapus penjualan')
      }
    } catch (error) {
      console.error('Error deleting penjualan:', error)
      alert('Terjadi kesalahan')
    }
  }

  // Reset form
  const resetForm = () => {
    setFormData({
      nomorInvoice: '',
      tanggal: new Date().toISOString().split('T')[0],
      pelanggan: '',
      userId: '',
      telurKg: 0,
      telurPeti: 0,
      ayamAfkir: 0,
      ayamPulet: 0,
      hargaTelurPerKg: 0,
      hargaTelurPerPeti: 0,
      hargaAyamAfkir: 0,
      hargaAyamPulet: 0,
      dibayar: 0,
      keterangan: ''
    })
    setEditingPenjualan(null)
  }

  // Generate invoice number
  const generateInvoiceNumber = () => {
    const date = new Date()
    const invNum = (penjualanList.length + 1).toString().padStart(4, '0')
    return `INV${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}${invNum}`
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 md:ml-64">
        <Header onMenuClick={() => {}} />

        <div className="p-4 md:p-6">
          {/* Summary Cards */}
          <div className="mb-6 grid gap-4 md:grid-cols-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Transaksi</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{summary?.totalTransaksi || 0}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Penjualan</CardTitle>
                <ShoppingCart className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  Rp {(summary?.totalHarga || 0).toLocaleString()}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Telur (kg)</CardTitle>
                <Egg className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {(summary?.totalTelurKg || 0).toLocaleString()} kg
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Telur (peti)</CardTitle>
                <Package className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {(summary?.totalTelurPeti || 0).toLocaleString()}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Ayam Afkir</CardTitle>
                <Egg className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {summary?.totalAyamAfkir || 0} ekor
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Ayam Pulet</CardTitle>
                <Egg className="h-4 w-4 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {summary?.totalAyamPulet || 0} ekor
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Header */}
          <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-bold">Manajemen Penjualan</h2>
              <p className="text-muted-foreground">
                Kelola penjualan telur dan ayam dengan invoice
              </p>
            </div>

            <Dialog open={dialogOpen} onOpenChange={(open) => {
              setDialogOpen(open)
              if (!open) resetForm()
            }}>
              <DialogTrigger asChild>
                <Button onClick={() => {
                  setEditingPenjualan(null)
                  resetForm()
                  setFormData(prev => ({
                    ...prev,
                    nomorInvoice: generateInvoiceNumber()
                  }))
                }}>
                  <Plus className="mr-2 h-4 w-4" />
                  Buat Invoice Baru
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingPenjualan ? 'Edit Invoice' : 'Buat Invoice Baru'}
                  </DialogTitle>
                  <DialogDescription>
                    {editingPenjualan ? 'Edit data penjualan' : 'Masukkan data penjualan untuk membuat invoice'}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="grid gap-2">
                        <Label htmlFor="nomorInvoice">Nomor Invoice</Label>
                        <Input
                          id="nomorInvoice"
                          value={formData.nomorInvoice}
                          onChange={(e) => setFormData({ ...formData, nomorInvoice: e.target.value })}
                          required
                        />
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="tanggal">Tanggal</Label>
                        <Input
                          id="tanggal"
                          type="date"
                          value={formData.tanggal}
                          onChange={(e) => setFormData({ ...formData, tanggal: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="grid gap-2">
                        <Label htmlFor="pelanggan">Nama Pelanggan</Label>
                        <Input
                          id="pelanggan"
                          value={formData.pelanggan}
                          onChange={(e) => setFormData({ ...formData, pelanggan: e.target.value })}
                          required
                        />
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="userId">Petugas</Label>
                        <Select
                          value={formData.userId}
                          onValueChange={(value) => setFormData({ ...formData, userId: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih petugas" />
                          </SelectTrigger>
                          <SelectContent>
                            {usersList.map((u) => (
                              <SelectItem key={u.id} value={u.id}>
                                {u.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Penjualan Telur */}
                    <div className="border-t pt-4">
                      <h4 className="mb-3 font-semibold">Penjualan Telur</h4>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-3">
                          <div className="grid gap-2">
                            <Label htmlFor="telurKg">Jumlah (kg)</Label>
                            <Input
                              id="telurKg"
                              type="number"
                              min="0"
                              value={formData.telurKg || ''}
                              onChange={(e) => setFormData({ ...formData, telurKg: parseFloat(e.target.value) || 0 })}
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="hargaTelurPerKg">Harga per Kg</Label>
                            <Input
                              id="hargaTelurPerKg"
                              type="number"
                              min="0"
                              value={formData.hargaTelurPerKg || ''}
                              onChange={(e) => setFormData({ ...formData, hargaTelurPerKg: parseFloat(e.target.value) || 0 })}
                            />
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div className="grid gap-2">
                            <Label htmlFor="telurPeti">Jumlah Peti (25 kg)</Label>
                            <Input
                              id="telurPeti"
                              type="number"
                              min="0"
                              value={formData.telurPeti || ''}
                              onChange={(e) => setFormData({ ...formData, telurPeti: parseFloat(e.target.value) || 0 })}
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="hargaTelurPerPeti">Harga per Peti</Label>
                            <Input
                              id="hargaTelurPerPeti"
                              type="number"
                              min="0"
                              value={formData.hargaTelurPerPeti || ''}
                              onChange={(e) => setFormData({ ...formData, hargaTelurPerPeti: parseFloat(e.target.value) || 0 })}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Penjualan Ayam */}
                    <div className="border-t pt-4">
                      <h4 className="mb-3 font-semibold">Penjualan Ayam</h4>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-3">
                          <div className="grid gap-2">
                            <Label htmlFor="ayamAfkir">Ayam Afkir (ekor)</Label>
                            <Input
                              id="ayamAfkir"
                              type="number"
                              min="0"
                              value={formData.ayamAfkir || ''}
                              onChange={(e) => setFormData({ ...formData, ayamAfkir: parseInt(e.target.value) || 0 })}
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="hargaAyamAfkir">Harga per Ekor</Label>
                            <Input
                              id="hargaAyamAfkir"
                              type="number"
                              min="0"
                              value={formData.hargaAyamAfkir || ''}
                              onChange={(e) => setFormData({ ...formData, hargaAyamAfkir: parseFloat(e.target.value) || 0 })}
                            />
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div className="grid gap-2">
                            <Label htmlFor="ayamPulet">Ayam Pulet (ekor)</Label>
                            <Input
                              id="ayamPulet"
                              type="number"
                              min="0"
                              value={formData.ayamPulet || ''}
                              onChange={(e) => setFormData({ ...formData, ayamPulet: parseInt(e.target.value) || 0 })}
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="hargaAyamPulet">Harga per Ekor</Label>
                            <Input
                              id="hargaAyamPulet"
                              type="number"
                              min="0"
                              value={formData.hargaAyamPulet || ''}
                              onChange={(e) => setFormData({ ...formData, hargaAyamPulet: parseFloat(e.target.value) || 0 })}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Pembayaran */}
                    <div className="border-t pt-4">
                      <h4 className="mb-3 font-semibold">Pembayaran</h4>
                      <div className="space-y-3">
                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="rounded-lg border bg-blue-50 p-4">
                            <p className="text-sm text-muted-foreground">Total Harga</p>
                            <p className="text-2xl font-bold text-blue-600">
                              Rp {calculateTotal().toLocaleString()}
                            </p>
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="dibayar">Jumlah Dibayar</Label>
                            <Input
                              id="dibayar"
                              type="number"
                              min="0"
                              value={formData.dibayar || ''}
                              onChange={(e) => setFormData({ ...formData, dibayar: parseFloat(e.target.value) || 0 })}
                            />
                          </div>
                        </div>
                        {sisa > 0 && (
                          <div className="rounded-lg border bg-red-50 p-4">
                            <p className="text-sm text-muted-foreground">Sisa Pembayaran</p>
                            <p className="text-xl font-bold text-red-600">
                              Rp {sisa.toLocaleString()}
                            </p>
                            <Badge variant="destructive" className="mt-2">Belum Lunas</Badge>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="keterangan">Keterangan</Label>
                      <Textarea
                        id="keterangan"
                        placeholder="Keterangan tambahan..."
                        value={formData.keterangan}
                        onChange={(e) => setFormData({ ...formData, keterangan: e.target.value })}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit" size="lg">
                      {editingPenjualan ? 'Update Invoice' : 'Simpan Invoice'}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Filters */}
          <div className="mb-4 grid gap-4 md:grid-cols-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Cari invoice atau pelanggan..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="grid gap-2">
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">Tanggal Mulai</p>
            </div>
            <div className="grid gap-2">
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">Tanggal Selesai</p>
            </div>
          </div>

          {/* Penjualan Table */}
          <Card>
            <CardHeader>
              <CardTitle>Riwayat Penjualan</CardTitle>
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
                        <TableHead>No. Invoice</TableHead>
                        <TableHead>Tanggal</TableHead>
                        <TableHead>Pelanggan</TableHead>
                        <TableHead>Item</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Pembayaran</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredPenjualan.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center">
                            Tidak ada data penjualan ditemukan
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredPenjualan.map((penjualan) => (
                          <TableRow key={penjualan.id}>
                            <TableCell className="font-medium">{penjualan.nomorInvoice}</TableCell>
                            <TableCell>
                              {new Date(penjualan.tanggal).toLocaleDateString('id-ID')}
                            </TableCell>
                            <TableCell>{penjualan.pelanggan}</TableCell>
                            <TableCell>
                              <div className="text-sm space-y-1">
                                {penjualan.telurKg > 0 && <div>Telur: {penjualan.telurKg} kg</div>}
                                {penjualan.telurPeti > 0 && <div>Peti: {penjualan.telurPeti}</div>}
                                {penjualan.ayamAfkir > 0 && <div>Afkir: {penjualan.ayamAfkir} ekor</div>}
                                {penjualan.ayamPulet > 0 && <div>Pulet: {penjualan.ayamPulet} ekor</div>}
                              </div>
                            </TableCell>
                            <TableCell className="font-semibold">
                              Rp {penjualan.totalHarga.toLocaleString()}
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                <div>Dibayar: Rp {penjualan.dibayar.toLocaleString()}</div>
                                <div className={penjualan.sisa > 0 ? 'text-red-600' : 'text-green-600'}>
                                  Sisa: Rp {penjualan.sisa.toLocaleString()}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant={penjualan.sisa > 0 ? 'destructive' : 'default'}>
                                {penjualan.sisa > 0 ? 'Belum Lunas' : 'Lunas'}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => handleEdit(penjualan)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => handleDelete(penjualan.id)}
                                >
                                  <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
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
