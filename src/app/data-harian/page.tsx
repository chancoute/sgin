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
import { Plus, Edit, Trash2, Search, ClipboardList, Egg, Wheat, AlertCircle, Syringe } from 'lucide-react'

interface Kandang {
  id: string
  nama: string
  jenis: string
}

interface User {
  id: string
  name: string
  role: string
}

interface DataHarian {
  id: string
  kandangId: string
  tanggal: string
  userId: string
  telurBagus: number
  telurBentes: number
  telurCream: number
  bahanBakuPakan: number
  pakanJadi: number
  kematian: number
  afkir: number
  vaksinasi?: string
  jumlahVaksin: number
  createdAt: string
  kandang: Kandang
  user: User
}

export default function DataHarianPage() {
  const [dataHarianList, setDataHarianList] = useState<DataHarian[]>([])
  const [kandangList, setKandangList] = useState<Kandang[]>([])
  const [usersList, setUsersList] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedKandang, setSelectedKandang] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingData, setEditingData] = useState<DataHarian | null>(null)
  const [formData, setFormData] = useState({
    kandangId: '',
    tanggal: new Date().toISOString().split('T')[0],
    userId: '',
    telurBagus: 0,
    telurBentes: 0,
    telurCream: 0,
    bahanBakuPakan: 0,
    pakanJadi: 0,
    kematian: 0,
    afkir: 0,
    vaksinasi: '',
    jumlahVaksin: 0
  })

  // Fetch data
  const fetchData = async () => {
    try {
      const [dataResponse, kandangResponse, usersResponse] = await Promise.all([
        fetch('/api/data-harian'),
        fetch('/api/kandang'),
        fetch('/api/users')
      ])

      const data = await dataResponse.json()
      const kandang = await kandangResponse.json()
      const users = await usersResponse.json()

      setDataHarianList(data.dataHarian || [])
      setKandangList(kandang.kandang || [])
      setUsersList(users.users || [])
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  // Filter data harian
  const filteredData = dataHarianList.filter(d => {
    const matchesSearch = d.kandang.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         d.user.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesKandang = !selectedKandang || d.kandangId === selectedKandang
    return matchesSearch && matchesKandang
  })

  // Calculate totals
  const totalTelur = filteredData.reduce((sum, d) => sum + d.telurBagus + d.telurBentes + d.telurCream, 0)
  const totalPakan = filteredData.reduce((sum, d) => sum + d.bahanBakuPakan + d.pakanJadi, 0)
  const totalKematian = filteredData.reduce((sum, d) => sum + d.kematian, 0)
  const totalAfkir = filteredData.reduce((sum, d) => sum + d.afkir, 0)

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const url = editingData
        ? `/api/data-harian/${editingData.id}`
        : '/api/data-harian'

      const method = editingData ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        await fetchData()
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
  const handleEdit = (data: DataHarian) => {
    setEditingData(data)
    setFormData({
      kandangId: data.kandangId,
      tanggal: data.tanggal.split('T')[0],
      userId: data.userId,
      telurBagus: data.telurBagus,
      telurBentes: data.telurBentes,
      telurCream: data.telurCream,
      bahanBakuPakan: data.bahanBakuPakan,
      pakanJadi: data.pakanJadi,
      kematian: data.kematian,
      afkir: data.afkir,
      vaksinasi: data.vaksinasi || '',
      jumlahVaksin: data.jumlahVaksin
    })
    setDialogOpen(true)
  }

  // Handle delete
  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus data ini?')) {
      return
    }

    try {
      const response = await fetch(`/api/data-harian/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        await fetchData()
      } else {
        alert('Gagal menghapus data')
      }
    } catch (error) {
      console.error('Error deleting data:', error)
      alert('Terjadi kesalahan')
    }
  }

  // Reset form
  const resetForm = () => {
    setFormData({
      kandangId: '',
      tanggal: new Date().toISOString().split('T')[0],
      userId: '',
      telurBagus: 0,
      telurBentes: 0,
      telurCream: 0,
      bahanBakuPakan: 0,
      pakanJadi: 0,
      kematian: 0,
      afkir: 0,
      vaksinasi: '',
      jumlahVaksin: 0
    })
    setEditingData(null)
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
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Telur</CardTitle>
                <Egg className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalTelur.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">butir</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Pakan</CardTitle>
                <Wheat className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalPakan.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">kg</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Kematian</CardTitle>
                <AlertCircle className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-500">{totalKematian}</div>
                <p className="text-xs text-muted-foreground">ekor</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Afkir</CardTitle>
                <AlertCircle className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{totalAfkir}</div>
                <p className="text-xs text-muted-foreground">ekor</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Vaksinasi</CardTitle>
                <Syringe className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-500">
                  {filteredData.filter(d => d.vaksinasi).length}
                </div>
                <p className="text-xs text-muted-foreground">jeda</p>
              </CardContent>
            </Card>
          </div>

          {/* Header */}
          <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-bold">Input Data Harian</h2>
              <p className="text-muted-foreground">
                Catat produksi telur, konsumsi pakan, kesehatan per kandang
              </p>
            </div>

            <Dialog open={dialogOpen} onOpenChange={(open) => {
              setDialogOpen(open)
              if (!open) resetForm()
            }}>
              <DialogTrigger asChild>
                <Button onClick={() => setEditingData(null)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Tambah Data
                </Button>
              </DialogTrigger>
              <DialogContent className="max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingData ? 'Edit Data Harian' : 'Tambah Data Harian'}
                  </DialogTitle>
                  <DialogDescription>
                    {editingData ? 'Edit data harian' : 'Isi formulir untuk menambahkan data harian baru'}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="kandangId">Kandang</Label>
                      <Select
                        value={formData.kandangId}
                        onValueChange={(value) => setFormData({ ...formData, kandangId: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih kandang" />
                        </SelectTrigger>
                        <SelectContent>
                          {kandangList.map((k) => (
                            <SelectItem key={k.id} value={k.id}>
                              {k.nama} - {k.jenis}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
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
                              {u.name} - {u.role.replace('_', ' ')}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="border-t pt-4">
                      <h4 className="mb-3 font-semibold">Produksi Telur</h4>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="telurBagus">Bagus</Label>
                          <Input
                            id="telurBagus"
                            type="number"
                            min="0"
                            value={formData.telurBagus || ''}
                            onChange={(e) => setFormData({ ...formData, telurBagus: parseInt(e.target.value) || 0 })}
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="telurBentes">Bentes</Label>
                          <Input
                            id="telurBentes"
                            type="number"
                            min="0"
                            value={formData.telurBentes || ''}
                            onChange={(e) => setFormData({ ...formData, telurBentes: parseInt(e.target.value) || 0 })}
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="telurCream">Cream</Label>
                          <Input
                            id="telurCream"
                            type="number"
                            min="0"
                            value={formData.telurCream || ''}
                            onChange={(e) => setFormData({ ...formData, telurCream: parseInt(e.target.value) || 0 })}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="border-t pt-4">
                      <h4 className="mb-3 font-semibold">Konsumsi Pakan (kg)</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="bahanBakuPakan">Bahan Baku</Label>
                          <Input
                            id="bahanBakuPakan"
                            type="number"
                            min="0"
                            value={formData.bahanBakuPakan || ''}
                            onChange={(e) => setFormData({ ...formData, bahanBakuPakan: parseFloat(e.target.value) || 0 })}
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="pakanJadi">Pakan Jadi</Label>
                          <Input
                            id="pakanJadi"
                            type="number"
                            min="0"
                            value={formData.pakanJadi || ''}
                            onChange={(e) => setFormData({ ...formData, pakanJadi: parseFloat(e.target.value) || 0 })}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="border-t pt-4">
                      <h4 className="mb-3 font-semibold">Kesehatan Ayam</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="kematian">Kematian</Label>
                          <Input
                            id="kematian"
                            type="number"
                            min="0"
                            value={formData.kematian || ''}
                            onChange={(e) => setFormData({ ...formData, kematian: parseInt(e.target.value) || 0 })}
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="afkir">Afkir</Label>
                          <Input
                            id="afkir"
                            type="number"
                            min="0"
                            value={formData.afkir || ''}
                            onChange={(e) => setFormData({ ...formData, afkir: parseInt(e.target.value) || 0 })}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="border-t pt-4">
                      <h4 className="mb-3 font-semibold">Vaksinasi</h4>
                      <div className="grid gap-2">
                        <Label htmlFor="vaksinasi">Nama Vaksin</Label>
                        <Input
                          id="vaksinasi"
                          placeholder="Nama vaksin (opsional)"
                          value={formData.vaksinasi}
                          onChange={(e) => setFormData({ ...formData, vaksinasi: e.target.value })}
                        />
                      </div>
                      <div className="mt-2 grid gap-2">
                        <Label htmlFor="jumlahVaksin">Jumlah Ayam yang Divaksin</Label>
                        <Input
                          id="jumlahVaksin"
                          type="number"
                          min="0"
                          value={formData.jumlahVaksin || ''}
                          onChange={(e) => setFormData({ ...formData, jumlahVaksin: parseInt(e.target.value) || 0 })}
                        />
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit">
                      {editingData ? 'Update' : 'Simpan'}
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
                placeholder="Cari berdasarkan kandang atau petugas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={selectedKandang} onValueChange={setSelectedKandang}>
              <SelectTrigger>
                <SelectValue placeholder="Filter berdasarkan kandang" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Semua Kandang</SelectItem>
                {kandangList.map((k) => (
                  <SelectItem key={k.id} value={k.id}>
                    {k.nama}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Data Harian Table */}
          <Card>
            <CardHeader>
              <CardTitle>Riwayat Data Harian</CardTitle>
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
                        <TableHead>Kandang</TableHead>
                        <TableHead>Petugas</TableHead>
                        <TableHead>Telur</TableHead>
                        <TableHead>Pakan (kg)</TableHead>
                        <TableHead>Kematian</TableHead>
                        <TableHead>Afkir</TableHead>
                        <TableHead>Vaksin</TableHead>
                        <TableHead className="text-right">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredData.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={9} className="text-center">
                            Tidak ada data ditemukan
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredData.map((data) => (
                          <TableRow key={data.id}>
                            <TableCell>
                              {new Date(data.tanggal).toLocaleDateString('id-ID')}
                            </TableCell>
                            <TableCell className="font-medium">
                              {data.kandang.nama}
                              <br />
                              <span className="text-xs text-muted-foreground">{data.kandang.jenis}</span>
                            </TableCell>
                            <TableCell>{data.user.name}</TableCell>
                            <TableCell>
                              <div className="text-sm">
                                <div>Bagus: {data.telurBagus}</div>
                                <div>Bentes: {data.telurBentes}</div>
                                <div>Cream: {data.telurCream}</div>
                                <div className="font-semibold">Total: {data.telurBagus + data.telurBentes + data.telurCream}</div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                <div>Bahan Baku: {data.bahanBakuPakan}</div>
                                <div>Pakan Jadi: {data.pakanJadi}</div>
                                <div className="font-semibold">Total: {(data.bahanBakuPakan + data.pakanJadi).toFixed(1)}</div>
                              </div>
                            </TableCell>
                            <TableCell>
                              {data.kematian > 0 ? (
                                <Badge variant="destructive">{data.kematian}</Badge>
                              ) : (
                                <span className="text-muted-foreground">0</span>
                              )}
                            </TableCell>
                            <TableCell>
                              {data.afkir > 0 ? (
                                <Badge variant="secondary">{data.afkir}</Badge>
                              ) : (
                                <span className="text-muted-foreground">0</span>
                              )}
                            </TableCell>
                            <TableCell>
                              {data.vaksinasi ? (
                                <Badge variant="outline" className="text-blue-500">
                                  {data.vaksinasi} ({data.jumlahVaksin})
                                </Badge>
                              ) : (
                                <span className="text-muted-foreground">-</span>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => handleEdit(data)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => handleDelete(data.id)}
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
