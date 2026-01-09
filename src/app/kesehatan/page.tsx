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
import { Plus, Edit, Trash2, Heart, Syringe, AlertCircle, CheckCircle } from 'lucide-react'

interface JadwalVaksin {
  id: string
  kandangId: string
  namaVaksin: string
  tanggalJadwal: string
  tanggalSelesai: string | null
  jumlahAyam: number
  status: string
  keterangan: string | null
  kandang: {
    id: string
    nama: string
    jenis: string
  }
}

interface KesehatanAyam {
  id: string
  kandangId: string
  tanggal: string
  ayamSakit: number
  gejala: string | null
  diagnosa: string | null
  ayamSembuh: number
  obat: string | null
  dosis: string | null
  keterangan: string | null
  user: {
    name: string
  }
}

export default function KesehatanPage() {
  const [activeTab, setActiveTab] = useState('jadwal')
  const [jadwalVaksinList, setJadwalVaksinList] = useState<JadwalVaksin[]>([])
  const [kesehatanAyamList, setKesehatanAyamList] = useState<KesehatanAyam[]>([])
  const [kandangList, setKandangList] = useState<any[]>([])
  const [usersList, setUsersList] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Jadwal vaksin state
  const [vaksinDialogOpen, setVaksinDialogOpen] = useState(false)
  const [vaksinFormData, setVaksinFormData] = useState({
    kandangId: '',
    namaVaksin: '',
    tanggalJadwal: new Date().toISOString().split('T')[0],
    jumlahAyam: 0,
    keterangan: ''
  })

  // Kesehatan ayam state
  const [kesehatanDialogOpen, setKesehatanDialogOpen] = useState(false)
  const [kesehatanFormData, setKesehatanFormData] = useState({
    kandangId: '',
    tanggal: new Date().toISOString().split('T')[0],
    userId: '',
    ayamSakit: 0,
    gejala: '',
    diagnosa: '',
    ayamSembuh: 0,
    obat: '',
    dosis: '',
    keterangan: ''
  })

  // Fetch data
  const fetchData = async () => {
    try {
      const [jadwalRes, kesehatanRes, kandangRes, usersRes] = await Promise.all([
        fetch('/api/kesehatan/jadwal-vaksin'),
        fetch('/api/kesehatan/data'),
        fetch('/api/kandang'),
        fetch('/api/users')
      ])

      const jadwalData = await jadwalRes.json()
      const kesehatanData = await kesehatanRes.json()
      const kandangData = await kandangRes.json()
      const usersData = await usersRes.json()

      setJadwalVaksinList(jadwalData.jadwalVaksin || [])
      setKesehatanAyamList(kesehatanData.kesehatanAyam || [])
      setKandangList(kandangData.kandang || [])
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
              <Heart className="h-8 w-8 text-primary" />
              Manajemen Kesehatan
            </h2>
            <p className="text-muted-foreground">
              Kelola jadwal vaksin, data ayam sakit, dan pemulihan
            </p>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="jadwal">Jadwal Vaksin</TabsTrigger>
              <TabsTrigger value="data">Data Kesehatan</TabsTrigger>
            </TabsList>

            {/* Jadwal Vaksin Tab */}
            <TabsContent value="jadwal" className="space-y-4">
              <div className="flex justify-between">
                <h3 className="text-xl font-bold">Jadwal Vaksinasi</h3>
                <Dialog open={vaksinDialogOpen} onOpenChange={setVaksinDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Tambah Jadwal Vaksin
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Tambah Jadwal Vaksin</DialogTitle>
                      <DialogDescription>Jadwalkan vaksinasi untuk kandang</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={(e) => {
                      e.preventDefault()
                      fetch('/api/kesehatan/jadwal-vaksin', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(vaksinFormData)
                      }).then(() => {
                        fetchData()
                        setVaksinDialogOpen(false)
                      })
                    }}>
                      <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                          <Label>Kandang</Label>
                          <Select
                            value={vaksinFormData.kandangId}
                            onValueChange={(v) => setVaksinFormData({ ...vaksinFormData, kandangId: v })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {kandangList.map(k => <SelectItem key={k.id} value={k.id}>{k.nama} - {k.jenis}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid gap-2">
                          <Label>Nama Vaksin</Label>
                          <Input
                            value={vaksinFormData.namaVaksin}
                            onChange={(e) => setVaksinFormData({ ...vaksinFormData, namaVaksin: e.target.value })}
                            placeholder="Contoh: ND Vaccine, IB Vaccine"
                            required
                          />
                        </div>
                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="grid gap-2">
                            <Label>Tanggal Jadwal</Label>
                            <Input
                              type="date"
                              value={vaksinFormData.tanggalJadwal}
                              onChange={(e) => setVaksinFormData({ ...vaksinFormData, tanggalJadwal: e.target.value })}
                              required
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label>Jumlah Ayam</Label>
                            <Input
                              type="number"
                              min="0"
                              value={vaksinFormData.jumlahAyam || ''}
                              onChange={(e) => setVaksinFormData({ ...vaksinFormData, jumlahAyam: parseInt(e.target.value) || 0 })}
                            />
                          </div>
                        </div>
                        <div className="grid gap-2">
                          <Label>Keterangan</Label>
                          <Textarea
                            value={vaksinFormData.keterangan}
                            onChange={(e) => setVaksinFormData({ ...vaksinFormData, keterangan: e.target.value })}
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
                          <TableHead>Tanggal Jadwal</TableHead>
                          <TableHead>Kandang</TableHead>
                          <TableHead>Nama Vaksin</TableHead>
                          <TableHead>Jumlah Ayam</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Keterangan</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {jadwalVaksinList.length === 0 ? (
                          <TableRow><TableCell colSpan={6} className="text-center py-8">Tidak ada jadwal vaksin</TableCell></TableRow>
                        ) : (
                          jadwalVaksinList.map((jv) => (
                            <TableRow key={jv.id}>
                              <TableCell>{new Date(jv.tanggalJadwal).toLocaleDateString('id-ID')}</TableCell>
                              <TableCell className="font-medium">{jv.kandang.nama}</TableCell>
                              <TableCell><Badge variant="outline">{jv.namaVaksin}</Badge></TableCell>
                              <TableCell>{jv.jumlahAyam.toLocaleString()} ekor</TableCell>
                              <TableCell>
                                <Badge className={
                                  jv.status === 'SELESAI' ? 'bg-green-500' :
                                  jv.status === 'DITUNDA' ? 'bg-yellow-500' : 'bg-blue-500'
                                }>
                                  {jv.status}
                                </Badge>
                              </TableCell>
                              <TableCell>{jv.keterangan || '-'}</TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Data Kesehatan Tab */}
            <TabsContent value="data" className="space-y-4">
              <div className="flex justify-between">
                <h3 className="text-xl font-bold">Data Kesehatan Ayam</h3>
                <Dialog open={kesehatanDialogOpen} onOpenChange={setKesehatanDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Tambah Data Kesehatan
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Catat Data Kesehatan</DialogTitle>
                      <DialogDescription>Masukkan data ayam sakit dan pemulihan</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={(e) => {
                      e.preventDefault()
                      fetch('/api/kesehatan/data', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(kesehatanFormData)
                      }).then(() => {
                        fetchData()
                        setKesehatanDialogOpen(false)
                      })
                    }}>
                      <div className="grid gap-4 py-4">
                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="grid gap-2">
                            <Label>Kandang</Label>
                            <Select
                              value={kesehatanFormData.kandangId}
                              onValueChange={(v) => setKesehatanFormData({ ...kesehatanFormData, kandangId: v })}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {kandangList.map(k => <SelectItem key={k.id} value={k.id}>{k.nama}</SelectItem>)}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="grid gap-2">
                            <Label>Petugas</Label>
                            <Select
                              value={kesehatanFormData.userId}
                              onValueChange={(v) => setKesehatanFormData({ ...kesehatanFormData, userId: v })}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {usersList.map(u => <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>)}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="grid gap-2">
                          <Label>Tanggal</Label>
                          <Input
                            type="date"
                            value={kesehatanFormData.tanggal}
                            onChange={(e) => setKesehatanFormData({ ...kesehatanFormData, tanggal: e.target.value })}
                          />
                        </div>

                        {/* Data Ayam Sakit */}
                        <div className="border-t pt-4">
                          <h4 className="mb-3 font-semibold text-red-600">Data Ayam Sakit</h4>
                          <div className="grid gap-4 md:grid-cols-2">
                            <div className="grid gap-2">
                              <Label>Jumlah Ayam Sakit</Label>
                              <Input
                                type="number"
                                min="0"
                                value={kesehatanFormData.ayamSakit || ''}
                                onChange={(e) => setKesehatanFormData({ ...kesehatanFormData, ayamSakit: parseInt(e.target.value) || 0 })}
                              />
                            </div>
                            <div className="grid gap-2">
                              <Label>Gejala</Label>
                              <Textarea
                                value={kesehatanFormData.gejala}
                                onChange={(e) => setKesehatanFormData({ ...kesehatanFormData, gejala: e.target.value })}
                                placeholder="Gejala yang terlihat..."
                              />
                            </div>
                          </div>
                          <div className="mt-2 grid gap-2">
                            <Label>Diagnosa</Label>
                            <Textarea
                              value={kesehatanFormData.diagnosa}
                              onChange={(e) => setKesehatanFormData({ ...kesehatanFormData, diagnosa: e.target.value })}
                              placeholder="Diagnosa dokter hewan..."
                            />
                          </div>
                        </div>

                        {/* Data Pengobatan */}
                        <div className="border-t pt-4">
                          <h4 className="mb-3 font-semibold text-blue-600">Pengobatan</h4>
                          <div className="grid gap-4 md:grid-cols-2">
                            <div className="grid gap-2">
                              <Label>Obat</Label>
                              <Input
                                value={kesehatanFormData.obat}
                                onChange={(e) => setKesehatanFormData({ ...kesehatanFormData, obat: e.target.value })}
                                placeholder="Nama obat..."
                              />
                            </div>
                            <div className="grid gap-2">
                              <Label>Dosis</Label>
                              <Input
                                value={kesehatanFormData.dosis}
                                onChange={(e) => setKesehatanFormData({ ...kesehatanFormData, dosis: e.target.value })}
                                placeholder="Dosis penggunaan..."
                              />
                            </div>
                          </div>
                        </div>

                        {/* Data Pemulihan */}
                        <div className="border-t pt-4">
                          <h4 className="mb-3 font-semibold text-green-600">Pemulihan</h4>
                          <div className="grid gap-2">
                            <Label>Jumlah Ayam Sembuh</Label>
                            <Input
                              type="number"
                              min="0"
                              value={kesehatanFormData.ayamSembuh || ''}
                              onChange={(e) => setKesehatanFormData({ ...kesehatanFormData, ayamSembuh: parseInt(e.target.value) || 0 })}
                            />
                          </div>
                        </div>

                        <div className="grid gap-2">
                          <Label>Keterangan Tambahan</Label>
                          <Textarea
                            value={kesehatanFormData.keterangan}
                            onChange={(e) => setKesehatanFormData({ ...kesehatanFormData, keterangan: e.target.value })}
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button type="submit">Simpan Data</Button>
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
                          <TableHead>Ayam Sakit</TableHead>
                          <TableHead>Ayam Sembuh</TableHead>
                          <TableHead>Diagnosa</TableHead>
                          <TableHead>Obat</TableHead>
                          <TableHead>Petugas</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {kesehatanAyamList.length === 0 ? (
                          <TableRow><TableCell colSpan={6} className="text-center py-8">Tidak ada data kesehatan</TableCell></TableRow>
                        ) : (
                          kesehatanAyamList.map((k) => (
                            <TableRow key={k.id}>
                              <TableCell>{new Date(k.tanggal).toLocaleDateString('id-ID')}</TableCell>
                              <TableCell>
                                {k.ayamSakit > 0 ? (
                                  <Badge variant="destructive"><AlertCircle className="mr-1 h-3 w-3" /> {k.ayamSakit} ekor</Badge>
                                ) : '-'}
                              </TableCell>
                              <TableCell>
                                {k.ayamSembuh > 0 ? (
                                  <Badge className="bg-green-500"><CheckCircle className="mr-1 h-3 w-3" /> {k.ayamSembuh} ekor</Badge>
                                ) : '-'}
                              </TableCell>
                              <TableCell>{k.diagnosa || '-'}</TableCell>
                              <TableCell>{k.obat || '-'}</TableCell>
                              <TableCell>{k.user.name}</TableCell>
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
