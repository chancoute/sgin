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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
import { Plus, Edit, Trash2, Search, DollarSign, ArrowUp, ArrowDown, Wallet, CreditCard } from 'lucide-react'

interface Pemasukan {
  id: string
  nomorBukti: string
  tanggal: string
  jenis: string
  jumlah: number
  keterangan: string | null
  user: {
    name: string
  }
}

interface Pengeluaran {
  id: string
  nomorBukti: string
  tanggal: string
  jenis: string
  jumlah: number
  keterangan: string | null
  user: {
    name: string
  }
}

interface Piutang {
  id: string
  pelanggan: string
  jumlah: number
  jatuhTempo: string
  sudahBayar: number
  sisa: number
  status: string
  keterangan: string | null
}

interface Utang {
  id: string
  pemasok: string
  jumlah: number
  jatuhTempo: string
  sudahBayar: number
  sisa: number
  status: string
  keterangan: string | null
}

const JENIS_PEMASUKAN = ['PENJUALAN_TELUR', 'PENJUALAN_AYAM_AFKIR', 'PENJUALAN_AYAM_PULET', 'LAINNYA']

const JENIS_PENGELUARAN = ['PEMBELIAN_PAKAN', 'PEMBELIAN_OBAT', 'PEMBELIAN_BAHAN_BAKU', 'GAJI_KARYAWAN', 'LISTRIK_AIR', 'LAINNYA']

export default function KeuanganPage() {
  const [activeTab, setActiveTab] = useState('pemasukan')
  const [pemasukanList, setPemasukanList] = useState<Pemasukan[]>([])
  const [pengeluaranList, setPengeluaranList] = useState<Pengeluaran[]>([])
  const [piutangList, setPiutangList] = useState<Piutang[]>([])
  const [utangList, setUtangList] = useState<Utang[]>([])
  const [usersList, setUsersList] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Pemasukan state
  const [pemasukanDialogOpen, setPemasukanDialogOpen] = useState(false)
  const [pemasukanFormData, setPemasukanFormData] = useState({
    nomorBukti: '',
    tanggal: new Date().toISOString().split('T')[0],
    jenis: 'PENJUALAN_TELUR',
    jumlah: 0,
    keterangan: '',
    userId: ''
  })

  // Pengeluaran state
  const [pengeluaranDialogOpen, setPengeluaranDialogOpen] = useState(false)
  const [pengeluaranFormData, setPengeluaranFormData] = useState({
    nomorBukti: '',
    tanggal: new Date().toISOString().split('T')[0],
    jenis: 'PEMBELIAN_PAKAN',
    jumlah: 0,
    keterangan: '',
    userId: ''
  })

  // Piutang state
  const [piutangDialogOpen, setPiutangDialogOpen] = useState(false)
  const [piutangFormData, setPiutangFormData] = useState({
    pelanggan: '',
    jumlah: 0,
    jatuhTempo: '',
    keterangan: ''
  })

  // Utang state
  const [utangDialogOpen, setUtangDialogOpen] = useState(false)
  const [utangFormData, setUtangFormData] = useState({
    pemasok: '',
    jumlah: 0,
    jatuhTempo: '',
    keterangan: ''
  })

  // Fetch data
  const fetchData = async () => {
    try {
      const [pemasukanRes, pengeluaranRes, piutangRes, utangRes, usersRes] = await Promise.all([
        fetch('/api/keuangan/pemasukan'),
        fetch('/api/keuangan/pengeluaran'),
        fetch('/api/keuangan/piutang'),
        fetch('/api/keuangan/utang'),
        fetch('/api/users')
      ])

      const pemasukanData = await pemasukanRes.json()
      const pengeluaranData = await pengeluaranRes.json()
      const piutangData = await piutangRes.json()
      const utangData = await utangRes.json()
      const usersData = await usersRes.json()

      setPemasukanList(pemasukanData.pemasukan || [])
      setPengeluaranList(pengeluaranData.pengeluaran || [])
      setPiutangList(piutangData.piutang || [])
      setUtangList(utangData.utang || [])
      setUsersList(usersData.users || [])
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  // Calculate totals
  const totalPemasukan = pemasukanList.reduce((sum, p) => sum + p.jumlah, 0)
  const totalPengeluaran = pengeluaranList.reduce((sum, p) => sum + p.jumlah, 0)
  const labaRugi = totalPemasukan - totalPengeluaran

  const totalPiutang = piutangList.reduce((sum, p) => sum + p.sisa, 0)
  const totalUtang = utangList.reduce((sum, u) => sum + u.sisa, 0)

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
              <Wallet className="h-8 w-8 text-primary" />
              Manajemen Keuangan
            </h2>
            <p className="text-muted-foreground">
              Kelola pemasukan, pengeluaran, piutang, dan utang peternakan
            </p>
          </div>

          {/* Summary Cards */}
          <div className="mb-6 grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Pemasukan</CardTitle>
                <ArrowUp className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  Rp {totalPemasukan.toLocaleString()}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Pengeluaran</CardTitle>
                <ArrowDown className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  Rp {totalPengeluaran.toLocaleString()}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Laba/Rugi</CardTitle>
                <DollarSign className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${labaRugi >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  Rp {labaRugi.toLocaleString()}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Piutang - Utang</CardTitle>
                <CreditCard className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  Rp {(totalPiutang - totalUtang).toLocaleString()}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="pemasukan">Pemasukan</TabsTrigger>
              <TabsTrigger value="pengeluaran">Pengeluaran</TabsTrigger>
              <TabsTrigger value="piutang">Piutang</TabsTrigger>
              <TabsTrigger value="utang">Utang</TabsTrigger>
            </TabsList>

            {/* Pemasukan Tab */}
            <TabsContent value="pemasukan" className="space-y-4">
              <div className="flex justify-between">
                <h3 className="text-xl font-bold">Daftar Pemasukan</h3>
                <Dialog open={pemasukanDialogOpen} onOpenChange={setPemasukanDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Tambah Pemasukan
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Tambah Pemasukan</DialogTitle>
                      <DialogDescription>Masukkan data pemasukan</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={(e) => {
                      e.preventDefault()
                      // Handle submit - simplified for brevity
                      fetch('/api/keuangan/pemasukan', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(pemasukanFormData)
                      }).then(() => {
                        fetchData()
                        setPemasukanDialogOpen(false)
                      })
                    }}>
                      <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                          <Label>Nomor Bukti</Label>
                          <Input
                            value={pemasukanFormData.nomorBukti}
                            onChange={(e) => setPemasukanFormData({ ...pemasukanFormData, nomorBukti: e.target.value })}
                            required
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label>Jenis Pemasukan</Label>
                          <Select
                            value={pemasukanFormData.jenis}
                            onValueChange={(v) => setPemasukanFormData({ ...pemasukanFormData, jenis: v })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {JENIS_PEMASUKAN.map(j => <SelectItem key={j} value={j}>{j.replace(/_/g, ' ')}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="grid gap-2">
                            <Label>Jumlah (Rp)</Label>
                            <Input
                              type="number"
                              value={pemasukanFormData.jumlah || ''}
                              onChange={(e) => setPemasukanFormData({ ...pemasukanFormData, jumlah: parseFloat(e.target.value) || 0 })}
                              required
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label>Tanggal</Label>
                            <Input
                              type="date"
                              value={pemasukanFormData.tanggal}
                              onChange={(e) => setPemasukanFormData({ ...pemasukanFormData, tanggal: e.target.value })}
                              required
                            />
                          </div>
                        </div>
                        <div className="grid gap-2">
                          <Label>Petugas</Label>
                          <Select
                            value={pemasukanFormData.userId}
                            onValueChange={(v) => setPemasukanFormData({ ...pemasukanFormData, userId: v })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {usersList.map(u => <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid gap-2">
                          <Label>Keterangan</Label>
                          <Textarea
                            value={pemasukanFormData.keterangan}
                            onChange={(e) => setPemasukanFormData({ ...pemasukanFormData, keterangan: e.target.value })}
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button type="submit">Simpan</Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>

              <Card>
                <CardContent className="p-0">
                  <div className="max-h-96 overflow-y-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Tanggal</TableHead>
                          <TableHead>No. Bukti</TableHead>
                          <TableHead>Jenis</TableHead>
                          <TableHead>Jumlah</TableHead>
                          <TableHead>Keterangan</TableHead>
                          <TableHead>Petugas</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {pemasukanList.length === 0 ? (
                          <TableRow><TableCell colSpan={6} className="text-center py-8">Tidak ada pemasukan</TableCell></TableRow>
                        ) : (
                          pemasukanList.map((p) => (
                            <TableRow key={p.id}>
                              <TableCell>{new Date(p.tanggal).toLocaleDateString('id-ID')}</TableCell>
                              <TableCell className="font-medium">{p.nomorBukti}</TableCell>
                              <TableCell><Badge variant="outline">{p.jenis.replace(/_/g, ' ')}</Badge></TableCell>
                              <TableCell className="font-semibold text-green-600">Rp {p.jumlah.toLocaleString()}</TableCell>
                              <TableCell>{p.keterangan || '-'}</TableCell>
                              <TableCell>{p.user.name}</TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Pengeluaran Tab */}
            <TabsContent value="pengeluaran" className="space-y-4">
              <div className="flex justify-between">
                <h3 className="text-xl font-bold">Daftar Pengeluaran</h3>
                <Dialog open={pengeluaranDialogOpen} onOpenChange={setPengeluaranDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Tambah Pengeluaran
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Tambah Pengeluaran</DialogTitle>
                      <DialogDescription>Masukkan data pengeluaran</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={(e) => {
                      e.preventDefault()
                      fetch('/api/keuangan/pengeluaran', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(pengeluaranFormData)
                      }).then(() => {
                        fetchData()
                        setPengeluaranDialogOpen(false)
                      })
                    }}>
                      <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                          <Label>Nomor Bukti</Label>
                          <Input
                            value={pengeluaranFormData.nomorBukti}
                            onChange={(e) => setPengeluaranFormData({ ...pengeluaranFormData, nomorBukti: e.target.value })}
                            required
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label>Jenis Pengeluaran</Label>
                          <Select
                            value={pengeluaranFormData.jenis}
                            onValueChange={(v) => setPengeluaranFormData({ ...pengeluaranFormData, jenis: v })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {JENIS_PENGELUARAN.map(j => <SelectItem key={j} value={j}>{j.replace(/_/g, ' ')}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="grid gap-2">
                            <Label>Jumlah (Rp)</Label>
                            <Input
                              type="number"
                              value={pengeluaranFormData.jumlah || ''}
                              onChange={(e) => setPengeluaranFormData({ ...pengeluaranFormData, jumlah: parseFloat(e.target.value) || 0 })}
                              required
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label>Tanggal</Label>
                            <Input
                              type="date"
                              value={pengeluaranFormData.tanggal}
                              onChange={(e) => setPengeluaranFormData({ ...pengeluaranFormData, tanggal: e.target.value })}
                              required
                            />
                          </div>
                        </div>
                        <div className="grid gap-2">
                          <Label>Petugas</Label>
                          <Select
                            value={pengeluaranFormData.userId}
                            onValueChange={(v) => setPengeluaranFormData({ ...pengeluaranFormData, userId: v })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {usersList.map(u => <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid gap-2">
                          <Label>Keterangan</Label>
                          <Textarea
                            value={pengeluaranFormData.keterangan}
                            onChange={(e) => setPengeluaranFormData({ ...pengeluaranFormData, keterangan: e.target.value })}
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button type="submit">Simpan</Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>

              <Card>
                <CardContent className="p-0">
                  <div className="max-h-96 overflow-y-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Tanggal</TableHead>
                          <TableHead>No. Bukti</TableHead>
                          <TableHead>Jenis</TableHead>
                          <TableHead>Jumlah</TableHead>
                          <TableHead>Keterangan</TableHead>
                          <TableHead>Petugas</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {pengeluaranList.length === 0 ? (
                          <TableRow><TableCell colSpan={6} className="text-center py-8">Tidak ada pengeluaran</TableCell></TableRow>
                        ) : (
                          pengeluaranList.map((p) => (
                            <TableRow key={p.id}>
                              <TableCell>{new Date(p.tanggal).toLocaleDateString('id-ID')}</TableCell>
                              <TableCell className="font-medium">{p.nomorBukti}</TableCell>
                              <TableCell><Badge variant="outline">{p.jenis.replace(/_/g, ' ')}</Badge></TableCell>
                              <TableCell className="font-semibold text-red-600">Rp {p.jumlah.toLocaleString()}</TableCell>
                              <TableCell>{p.keterangan || '-'}</TableCell>
                              <TableCell>{p.user.name}</TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Piutang Tab */}
            <TabsContent value="piutang" className="space-y-4">
              <div className="flex justify-between">
                <h3 className="text-xl font-bold">Daftar Piutang</h3>
                <Dialog open={piutangDialogOpen} onOpenChange={setPiutangDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Tambah Piutang
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Tambah Piutang</DialogTitle>
                      <DialogDescription>Masukkan data piutang</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={(e) => {
                      e.preventDefault()
                      fetch('/api/keuangan/piutang', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(piutangFormData)
                      }).then(() => {
                        fetchData()
                        setPiutangDialogOpen(false)
                      })
                    }}>
                      <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                          <Label>Pelanggan</Label>
                          <Input
                            value={piutangFormData.pelanggan}
                            onChange={(e) => setPiutangFormData({ ...piutangFormData, pelanggan: e.target.value })}
                            required
                          />
                        </div>
                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="grid gap-2">
                            <Label>Jumlah (Rp)</Label>
                            <Input
                              type="number"
                              value={piutangFormData.jumlah || ''}
                              onChange={(e) => setPiutangFormData({ ...piutangFormData, jumlah: parseFloat(e.target.value) || 0 })}
                              required
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label>Jatuh Tempo</Label>
                            <Input
                              type="date"
                              value={piutangFormData.jatuhTempo}
                              onChange={(e) => setPiutangFormData({ ...piutangFormData, jatuhTempo: e.target.value })}
                              required
                            />
                          </div>
                        </div>
                        <div className="grid gap-2">
                          <Label>Keterangan</Label>
                          <Textarea
                            value={piutangFormData.keterangan}
                            onChange={(e) => setPiutangFormData({ ...piutangFormData, keterangan: e.target.value })}
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button type="submit">Simpan</Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>

              <Card>
                <CardContent className="p-0">
                  <div className="max-h-96 overflow-y-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Pelanggan</TableHead>
                          <TableHead>Jumlah</TableHead>
                          <TableHead>Jatuh Tempo</TableHead>
                          <TableHead>Sudah Bayar</TableHead>
                          <TableHead>Sisa</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {piutangList.length === 0 ? (
                          <TableRow><TableCell colSpan={6} className="text-center py-8">Tidak ada piutang</TableCell></TableRow>
                        ) : (
                          piutangList.map((p) => (
                            <TableRow key={p.id}>
                              <TableCell className="font-medium">{p.pelanggan}</TableCell>
                              <TableCell>Rp {p.jumlah.toLocaleString()}</TableCell>
                              <TableCell>{new Date(p.jatuhTempo).toLocaleDateString('id-ID')}</TableCell>
                              <TableCell>Rp {p.sudahBayar.toLocaleString()}</TableCell>
                              <TableCell className="font-semibold text-orange-600">Rp {p.sisa.toLocaleString()}</TableCell>
                              <TableCell><Badge variant={p.status === 'LUNAS' ? 'default' : 'destructive'}>{p.status}</Badge></TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Utang Tab */}
            <TabsContent value="utang" className="space-y-4">
              <div className="flex justify-between">
                <h3 className="text-xl font-bold">Daftar Utang</h3>
                <Dialog open={utangDialogOpen} onOpenChange={setUtangDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Tambah Utang
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Tambah Utang</DialogTitle>
                      <DialogDescription>Masukkan data utang</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={(e) => {
                      e.preventDefault()
                      fetch('/api/keuangan/utang', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(utangFormData)
                      }).then(() => {
                        fetchData()
                        setUtangDialogOpen(false)
                      })
                    }}>
                      <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                          <Label>Pemasok</Label>
                          <Input
                            value={utangFormData.pemasok}
                            onChange={(e) => setUtangFormData({ ...utangFormData, pemasok: e.target.value })}
                            required
                          />
                        </div>
                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="grid gap-2">
                            <Label>Jumlah (Rp)</Label>
                            <Input
                              type="number"
                              value={utangFormData.jumlah || ''}
                              onChange={(e) => setUtangFormData({ ...utangFormData, jumlah: parseFloat(e.target.value) || 0 })}
                              required
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label>Jatuh Tempo</Label>
                            <Input
                              type="date"
                              value={utangFormData.jatuhTempo}
                              onChange={(e) => setUtangFormData({ ...utangFormData, jatuhTempo: e.target.value })}
                              required
                            />
                          </div>
                        </div>
                        <div className="grid gap-2">
                          <Label>Keterangan</Label>
                          <Textarea
                            value={utangFormData.keterangan}
                            onChange={(e) => setUtangFormData({ ...utangFormData, keterangan: e.target.value })}
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button type="submit">Simpan</Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>

              <Card>
                <CardContent className="p-0">
                  <div className="max-h-96 overflow-y-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Pemasok</TableHead>
                          <TableHead>Jumlah</TableHead>
                          <TableHead>Jatuh Tempo</TableHead>
                          <TableHead>Sudah Bayar</TableHead>
                          <TableHead>Sisa</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {utangList.length === 0 ? (
                          <TableRow><TableCell colSpan={6} className="text-center py-8">Tidak ada utang</TableCell></TableRow>
                        ) : (
                          utangList.map((u) => (
                            <TableRow key={u.id}>
                              <TableCell className="font-medium">{u.pemasok}</TableCell>
                              <TableCell>Rp {u.jumlah.toLocaleString()}</TableCell>
                              <TableCell>{new Date(u.jatuhTempo).toLocaleDateString('id-ID')}</TableCell>
                              <TableCell>Rp {u.sudahBayar.toLocaleString()}</TableCell>
                              <TableCell className="font-semibold text-red-600">Rp {u.sisa.toLocaleString()}</TableCell>
                              <TableCell><Badge variant={u.status === 'LUNAS' ? 'default' : 'destructive'}>{u.status}</Badge></TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
