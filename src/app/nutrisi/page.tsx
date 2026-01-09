'use client'

import { useState, useEffect } from 'react'
import { Sidebar } from '@/components/layout/sidebar'
import { Header } from '@/components/layout/header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Wheat, Loader2, TrendingUp, DollarSign, CheckCircle, AlertCircle } from 'lucide-react'

interface Kandang {
  id: string
  nama: string
  jenis: string
  jumlahAyam: number
  kapasitas: number
}

interface FormulasiPakan {
  bahan: string
  persentase: number
  jumlah_kg: number
  alasan: string
}

interface KebutuhanNutrisi {
  protein: string
  energi: string
  kalsium: string
  fosfor: string
}

interface BiayaEstimasi {
  per_kg: string
  per_hari: string
  per_ayam: string
}

interface AnalysisResult {
  formulasi_pakan: FormulasiPakan[]
  kebutuhan_nutrisi: KebutuhanNutrisi
  biaya_estimasi: BiayaEstimasi
  rekomendasi: string[]
  manfaat: string[]
  raw_response?: string
}

export default function NutrisiPage() {
  const [kandangList, setKandangList] = useState<Kandang[]>([])
  const [loadingKandang, setLoadingKandang] = useState(true)
  const [selectedKandang, setSelectedKandang] = useState('')
  const [jumlahAyam, setJumlahAyam] = useState(0)
  const [targetProduksi, setTargetProduksi] = useState('')
  const [optimizing, setOptimizing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)
  const [error, setError] = useState('')

  // Fetch kandang
  const fetchKandang = async () => {
    try {
      const response = await fetch('/api/kandang')
      const data = await response.json()
      setKandangList(data.kandang || [])
    } catch (error) {
      console.error('Error fetching kandang:', error)
    } finally {
      setLoadingKandang(false)
    }
  }

  useEffect(() => {
    fetchKandang()
  }, [])

  // Handle kandang selection
  const handleKandangChange = (kandangId: string) => {
    setSelectedKandang(kandangId)
    const kandang = kandangList.find(k => k.id === kandangId)
    if (kandang) {
      setJumlahAyam(kandang.jumlahAyam)
    }
  }

  // Handle optimize
  const handleOptimize = async () => {
    if (!selectedKandang || !jumlahAyam) {
      setError('Pilih kandang dan masukkan jumlah ayam')
      return
    }

    setOptimizing(true)
    setError('')
    setAnalysisResult(null)

    try {
      const response = await fetch('/api/ai/feed-optimization', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          kandangId: selectedKandang,
          jumlahAyam,
          targetProduksi: targetProduksi ? parseInt(targetProduksi) : undefined
        })
      })

      const data = await response.json()

      if (response.ok) {
        setAnalysisResult(data.analysis)
      } else {
        setError(data.error || 'Terjadi kesalahan saat melakukan optimasi')
      }
    } catch (error) {
      console.error('Error optimizing feed:', error)
      setError('Terjadi kesalahan saat melakukan optimasi')
    } finally {
      setOptimizing(false)
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
              <Wheat className="h-8 w-8 text-primary" />
              AI Adaptive Feed Optimization
            </h2>
            <p className="text-muted-foreground">
              Optimasi formulasi pakan berbasis AI untuk efisiensi biaya dan kualitas produksi telur
            </p>
          </div>

          {/* Input Section */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Parameter Optimasi</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="grid gap-2">
                  <Label htmlFor="kandang">Pilih Kandang</Label>
                  <Select
                    value={selectedKandang}
                    onValueChange={handleKandangChange}
                    disabled={loadingKandang}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih kandang" />
                    </SelectTrigger>
                    <SelectContent>
                      {kandangList.map((k) => (
                        <SelectItem key={k.id} value={k.id}>
                          {k.nama} ({k.jenis}) - {k.jumlahAyam} ekor
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="jumlahAyam">Jumlah Ayam (ekor)</Label>
                  <input
                    id="jumlahAyam"
                    type="number"
                    min="1"
                    value={jumlahAyam || ''}
                    onChange={(e) => setJumlahAyam(parseInt(e.target.value) || 0)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="targetProduksi">Target Produksi (butir/hari) - Opsional</Label>
                  <input
                    id="targetProduksi"
                    type="number"
                    min="1"
                    value={targetProduksi}
                    onChange={(e) => setTargetProduksi(e.target.value)}
                    placeholder="Contoh: 5000"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>
              </div>

              <div className="mt-4 flex justify-end">
                <Button
                  onClick={handleOptimize}
                  disabled={optimizing || !selectedKandang || !jumlahAyam}
                  size="lg"
                >
                  {optimizing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sedang Menganalisis...
                    </>
                  ) : (
                    <>
                      <TrendingUp className="mr-2 h-4 w-4" />
                      Optimasi Pakan
                    </>
                  )}
                </Button>
              </div>

              {error && (
                <div className="mt-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-4 text-red-600">
                  <AlertCircle className="h-5 w-5" />
                  <p className="text-sm">{error}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Results Section */}
          {analysisResult && (
            <div className="space-y-6">
              {/* Kebutuhan Nutrisi */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    Kebutuhan Nutrisi Target
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-4">
                    <div className="rounded-lg border p-4">
                      <p className="text-sm text-muted-foreground">Protein</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {analysisResult.kebutuhan_nutrisi?.protein}
                      </p>
                    </div>
                    <div className="rounded-lg border p-4">
                      <p className="text-sm text-muted-foreground">Energi</p>
                      <p className="text-2xl font-bold text-orange-600">
                        {analysisResult.kebutuhan_nutrisi?.energi}
                      </p>
                    </div>
                    <div className="rounded-lg border p-4">
                      <p className="text-sm text-muted-foreground">Kalsium</p>
                      <p className="text-2xl font-bold text-green-600">
                        {analysisResult.kebutuhan_nutrisi?.kalsium}
                      </p>
                    </div>
                    <div className="rounded-lg border p-4">
                      <p className="text-sm text-muted-foreground">Fosfor</p>
                      <p className="text-2xl font-bold text-purple-600">
                        {analysisResult.kebutuhan_nutrisi?.fosfor}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Formulasi Pakan */}
              <Card>
                <CardHeader>
                  <CardTitle>Formulasi Pakan Rekomendasi</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="max-h-96 overflow-y-auto">
                    {analysisResult.formulasi_pakan && analysisResult.formulasi_pakan.length > 0 ? (
                      <div className="space-y-4">
                        {analysisResult.formulasi_pakan.map((item, index) => (
                          <div key={index} className="rounded-lg border p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-3">
                                  <h4 className="text-lg font-semibold">{item.bahan}</h4>
                                  <Badge className="bg-blue-500">{item.persentase}%</Badge>
                                  <Badge variant="outline">{item.jumlah_kg} kg</Badge>
                                </div>
                                <p className="mt-2 text-sm text-muted-foreground">{item.alasan}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-center text-muted-foreground">
                        Tidak ada formulasi pakan tersedia
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Biaya Estimasi */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-green-500" />
                    Estimasi Biaya Pakan
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="rounded-lg border bg-green-50 p-6">
                      <p className="text-sm text-muted-foreground">Biaya per Kg</p>
                      <p className="text-3xl font-bold text-green-600">
                        {analysisResult.biaya_estimasi?.per_kg}
                      </p>
                    </div>
                    <div className="rounded-lg border bg-blue-50 p-6">
                      <p className="text-sm text-muted-foreground">Biaya per Hari</p>
                      <p className="text-3xl font-bold text-blue-600">
                        {analysisResult.biaya_estimasi?.per_hari}
                      </p>
                    </div>
                    <div className="rounded-lg border bg-purple-50 p-6">
                      <p className="text-sm text-muted-foreground">Biaya per Ekor/Hari</p>
                      <p className="text-3xl font-bold text-purple-600">
                        {analysisResult.biaya_estimasi?.per_ayam}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Rekomendasi */}
              <Card>
                <CardHeader>
                  <CardTitle>Rekomendasi AI</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analysisResult.rekomendasi && analysisResult.rekomendasi.length > 0 ? (
                      analysisResult.rekomendasi.map((rec, index) => (
                        <div key={index} className="flex items-start gap-3 rounded-lg border p-4">
                          <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-500" />
                          <p className="text-sm">{rec}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-center text-muted-foreground">
                        Tidak ada rekomendasi tersedia
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Manfaat */}
              <Card>
                <CardHeader>
                  <CardTitle>Manfaat Optimasi</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3 md:grid-cols-2">
                    {analysisResult.manfaat && analysisResult.manfaat.length > 0 ? (
                      analysisResult.manfaat.map((manfaat, index) => (
                        <div key={index} className="flex items-start gap-3 rounded-lg border p-4">
                          <TrendingUp className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-500" />
                          <p className="text-sm">{manfaat}</p>
                        </div>
                      ))
                    ) : (
                      <p className="col-span-2 text-center text-muted-foreground">
                        Tidak ada informasi manfaat tersedia
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
