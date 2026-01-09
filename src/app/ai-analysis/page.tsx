'use client'

import { useState, useEffect } from 'react'
import { Sidebar } from '@/components/layout/sidebar'
import { Header } from '@/components/layout/header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Loader2, TrendingUp, DollarSign, Activity, Heart, BarChart3, AlertCircle, CheckCircle, Lightbulb } from 'lucide-react'

interface Kandang {
  id: string
  nama: string
  jenis: string
  jumlahAyam: number
}

interface AnalysisResult {
  ringkasan?: string
  rekomendasi?: string[] | string
  prediksi_produksi?: {
    besok: string
    '7_hari': string
    '30_hari': string
  }
  trend?: string
  faktor_pengaruh?: string[]
  potensi_masalah?: string[]
  struktur_biaya?: any
  total_biaya?: string
  biaya_per_butir?: string
  biaya_per_kg?: string
  efisiensi?: string
  area_penghematan?: string[]
  skor_performa?: string
  kategori_performa?: string
  metrik_utama?: any
  kekuatan?: string[]
  kelemahan?: string[]
  status_kesehatan?: string
  tingkat_mortalitas?: string
  tingkat_afkir?: string
  risiko_kesehatan?: string[]
  rekomendasi_kesehatan?: string[]
  jadwal_vaksin?: string
  profit_margin?: string
  kategori_profit?: string
  rasio_keuangan?: any
  area_optimasi?: string[]
}

const ANALISIS_TYPES = [
  { value: 'PRODUCTION_PREDICTION', label: 'Prediksi Produksi Telur', icon: TrendingUp, color: 'text-blue-500', bg: 'bg-blue-50' },
  { value: 'COST_ANALYSIS', label: 'Analisis Biaya Produksi', icon: DollarSign, color: 'text-green-500', bg: 'bg-green-50' },
  { value: 'PERFORMANCE_ANALYSIS', label: 'Analisis Performa Peternakan', icon: BarChart3, color: 'text-purple-500', bg: 'bg-purple-50' },
  { value: 'HEALTH_ANALYSIS', label: 'Analisis Kesehatan Ayam', icon: Heart, color: 'text-red-500', bg: 'bg-red-50' },
  { value: 'PROFITABILITY_ANALYSIS', label: 'Analisis Profitabilitas', icon: Activity, color: 'text-orange-500', bg: 'bg-orange-50' },
]

export default function AIAnalysisPage() {
  const [kandangList, setKandangList] = useState<Kandang[]>([])
  const [loadingKandang, setLoadingKandang] = useState(true)
  const [selectedKandang, setSelectedKandang] = useState('')
  const [jenisAnalisis, setJenisAnalisis] = useState('')
  const [periode, setPeriode] = useState('30')
  const [analyzing, setAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)
  const [analysisTitle, setAnalysisTitle] = useState('')
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

  // Handle analyze
  const handleAnalyze = async () => {
    if (!jenisAnalisis) {
      setError('Pilih jenis analisis')
      return
    }

    setAnalyzing(true)
    setError('')
    setAnalysisResult(null)

    try {
      const response = await fetch('/api/ai/analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          jenisAnalisis,
          kandangId: selectedKandang || null,
          periode
        })
      })

      const data = await response.json()

      if (response.ok) {
        setAnalysisResult(data.analysis)
        setAnalysisTitle(data.title)
      } else {
        setError(data.error || 'Terjadi kesalahan saat melakukan analisis')
      }
    } catch (error) {
      console.error('Error analyzing:', error)
      setError('Terjadi kesalahan saat melakukan analisis')
    } finally {
      setAnalyzing(false)
    }
  }

  const getAnalysisType = (type: string) => {
    return ANALISIS_TYPES.find(t => t.value === type)
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
              <TrendingUp className="h-8 w-8 text-primary" />
              AI Analysis - Prediksi & Rekomendasi
            </h2>
            <p className="text-muted-foreground">
              Analisis berbasis AI untuk prediksi produksi, biaya, performa, kesehatan, dan profitabilitas
            </p>
          </div>

          {/* Analysis Type Cards */}
          <div className="mb-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {ANALISIS_TYPES.map((type) => {
              const Icon = type.icon
              return (
                <Card
                  key={type.value}
                  className={`cursor-pointer transition-all hover:shadow-lg ${
                    jenisAnalisis === type.value ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => setJenisAnalisis(type.value)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <div className={`rounded-lg p-2 ${type.bg}`}>
                        <Icon className={`h-6 w-6 ${type.color}`} />
                      </div>
                      <CardTitle className="text-base">{type.label}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Analisis mendalam untuk optimalisasi peternakan
                    </p>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Input Section */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Parameter Analisis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="grid gap-2">
                  <Label htmlFor="kandang">Pilih Kandang (Opsional)</Label>
                  <Select
                    value={selectedKandang}
                    onValueChange={setSelectedKandang}
                    disabled={loadingKandang}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Semua kandang" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Semua Kandang</SelectItem>
                      {kandangList.map((k) => (
                        <SelectItem key={k.id} value={k.id}>
                          {k.nama} ({k.jenis})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="periode">Periode Data (hari)</Label>
                  <Select value={periode} onValueChange={setPeriode}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7">7 hari terakhir</SelectItem>
                      <SelectItem value="14">14 hari terakhir</SelectItem>
                      <SelectItem value="30">30 hari terakhir</SelectItem>
                      <SelectItem value="60">60 hari terakhir</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label>&nbsp;</Label>
                  <Button
                    onClick={handleAnalyze}
                    disabled={analyzing || !jenisAnalisis}
                    size="lg"
                    className="w-full"
                  >
                    {analyzing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sedang Menganalisis...
                      </>
                    ) : (
                      <>
                        <BarChart3 className="mr-2 h-4 w-4" />
                        Mulai Analisis
                      </>
                    )}
                  </Button>
                </div>
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
              {/* Analysis Header */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    {(() => {
                      const type = getAnalysisType(jenisAnalisis)
                      if (!type) return null
                      const Icon = type.icon
                      return (
                        <div className={`rounded-lg p-3 ${type.bg}`}>
                          <Icon className={`h-8 w-8 ${type.color}`} />
                        </div>
                      )
                    })()}
                    <div>
                      <CardTitle className="text-2xl">{analysisTitle}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {selectedKandang ? `Kandang: ${kandangList.find(k => k.id === selectedKandang)?.nama}` : 'Semua Kandang'}
                        {' • '} Periode: {periode} hari
                      </p>
                    </div>
                  </div>
                </CardHeader>
              </Card>

              {/* Ringkasan */}
              {analysisResult.ringkasan && (
                <Card>
                  <CardHeader>
                    <CardTitle>Ringkasan Analisis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm leading-relaxed">{analysisResult.ringkasan}</p>
                  </CardContent>
                </Card>
              )}

              {/* Production Prediction */}
              {analysisResult.prediksi_produksi && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-blue-500" />
                      Prediksi Produksi
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-3">
                      <div className="rounded-lg border bg-blue-50 p-6">
                        <p className="text-sm text-muted-foreground">Besok</p>
                        <p className="text-3xl font-bold text-blue-600">
                          {analysisResult.prediksi_produksi.besok}
                        </p>
                      </div>
                      <div className="rounded-lg border bg-green-50 p-6">
                        <p className="text-sm text-muted-foreground">7 Hari</p>
                        <p className="text-3xl font-bold text-green-600">
                          {analysisResult.prediksi_produksi['7_hari']}
                        </p>
                      </div>
                      <div className="rounded-lg border bg-purple-50 p-6">
                        <p className="text-sm text-muted-foreground">30 Hari</p>
                        <p className="text-3xl font-bold text-purple-600">
                          {analysisResult.prediksi_produksi['30_hari']}
                        </p>
                      </div>
                    </div>
                    {analysisResult.trend && (
                      <div className="mt-4 rounded-lg border p-4">
                        <p className="text-sm text-muted-foreground">Trend</p>
                        <Badge variant="outline" className="text-base">
                          {analysisResult.trend}
                        </Badge>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Cost Analysis */}
              {analysisResult.total_biaya && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5 text-green-500" />
                      Analisis Biaya
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-3">
                      <div className="rounded-lg border p-4">
                        <p className="text-sm text-muted-foreground">Total Biaya</p>
                        <p className="text-2xl font-bold text-green-600">{analysisResult.total_biaya}</p>
                      </div>
                      <div className="rounded-lg border p-4">
                        <p className="text-sm text-muted-foreground">Biaya per Butir</p>
                        <p className="text-2xl font-bold text-blue-600">{analysisResult.biaya_per_butir}</p>
                      </div>
                      <div className="rounded-lg border p-4">
                        <p className="text-sm text-muted-foreground">Biaya per Kg</p>
                        <p className="text-2xl font-bold text-purple-600">{analysisResult.biaya_per_kg}</p>
                      </div>
                    </div>
                    {analysisResult.efisiensi && (
                      <div className="mt-4 rounded-lg border bg-green-50 p-4">
                        <p className="text-sm text-muted-foreground">Efisiensi Biaya</p>
                        <p className="text-lg font-semibold text-green-600">{analysisResult.efisiensi}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Performance Analysis */}
              {analysisResult.skor_performa && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-purple-500" />
                      Skor Performa
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="rounded-lg border bg-purple-50 p-6 text-center">
                        <p className="text-sm text-muted-foreground">Skor Performa</p>
                        <p className="text-5xl font-bold text-purple-600">{analysisResult.skor_performa}</p>
                        <Badge className="mt-2">{analysisResult.kategori_performa}</Badge>
                      </div>
                      {analysisResult.metrik_utama && (
                        <div className="rounded-lg border p-4">
                          <p className="mb-3 text-sm font-semibold">Metrik Utama</p>
                          <div className="space-y-2">
                            {Object.entries(analysisResult.metrik_utama).map(([key, value]) => (
                              <div key={key} className="flex justify-between">
                                <span className="text-sm capitalize">{key.replace('_', ' ')}</span>
                                <span className="text-sm font-semibold">{value as string}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Health Analysis */}
              {analysisResult.status_kesehatan && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Heart className="h-5 w-5 text-red-500" />
                      Status Kesehatan
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-3">
                      <div className="rounded-lg border bg-red-50 p-4">
                        <p className="text-sm text-muted-foreground">Status Kesehatan</p>
                        <Badge className="mt-2 text-base">{analysisResult.status_kesehatan}</Badge>
                      </div>
                      <div className="rounded-lg border p-4">
                        <p className="text-sm text-muted-foreground">Tingkat Mortalitas</p>
                        <Badge variant="outline" className="mt-2">{analysisResult.tingkat_mortalitas}</Badge>
                      </div>
                      <div className="rounded-lg border p-4">
                        <p className="text-sm text-muted-foreground">Tingkat Afkir</p>
                        <Badge variant="outline" className="mt-2">{analysisResult.tingkat_afkir}</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Profitability Analysis */}
              {analysisResult.profit_margin && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5 text-orange-500" />
                      Analisis Profitabilitas
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="rounded-lg border bg-orange-50 p-6 text-center">
                        <p className="text-sm text-muted-foreground">Profit Margin</p>
                        <p className="text-5xl font-bold text-orange-600">{analysisResult.profit_margin}</p>
                        <Badge className="mt-2">{analysisResult.kategori_profit}</Badge>
                      </div>
                      {analysisResult.rasio_keuangan && (
                        <div className="rounded-lg border p-4">
                          <p className="mb-3 text-sm font-semibold">Rasio Keuangan</p>
                          <div className="space-y-2">
                            {Object.entries(analysisResult.rasio_keuangan).map(([key, value]) => (
                              <div key={key} className="flex justify-between">
                                <span className="text-sm capitalize">{key.replace('_', ' ')}</span>
                                <span className="text-sm font-semibold">{value as string}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Recommendations */}
              {analysisResult.rekomendasi && Array.isArray(analysisResult.rekomendasi) && analysisResult.rekomendasi.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Lightbulb className="h-5 w-5 text-yellow-500" />
                      Rekomendasi AI
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {analysisResult.rekomendasi.map((rec: string, index: number) => (
                        <div key={index} className="flex items-start gap-3 rounded-lg border p-4">
                          <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-500" />
                          <p className="text-sm">{rec}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Factors/Issues */}
              {analysisResult.faktor_pengaruh && analysisResult.faktor_pengaruh.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Faktor Pengaruh</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {analysisResult.faktor_pengaruh.map((faktor: string, index: number) => (
                        <div key={index} className="flex items-start gap-3 rounded-lg border p-4">
                          <TrendingUp className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-500" />
                          <p className="text-sm">{faktor}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Potential Problems */}
              {analysisResult.potensi_masalah && analysisResult.potensi_masalah.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertCircle className="h-5 w-5 text-red-500" />
                      Potensi Masalah
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {analysisResult.potensi_masalah.map((masalah: string, index: number) => (
                        <div key={index} className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
                          <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-500" />
                          <p className="text-sm text-red-700">{masalah}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
