import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { jenisAnalisis, kandangId, periode } = body

    // Validate input
    if (!jenisAnalisis) {
      return NextResponse.json(
        { error: 'Jenis analisis wajib dipilih' },
        { status: 400 }
      )
    }

    // Get kandang data if kandangId is provided
    let kandang = null
    if (kandangId) {
      kandang = await db.kandang.findUnique({
        where: { id: kandangId }
      })
    }

    // Get all kandang if no specific kandang
    const allKandang = kandangId
      ? [kandang]
      : await db.kandang.findMany()

    // Get historical data
    const historicalData = await db.dataHarian.findMany({
      where: kandangId ? { kandangId } : undefined,
      orderBy: { tanggal: 'desc' },
      take: periode ? parseInt(periode) : 30
    })

    // Get stok data
    const stokList = await db.stok.findMany()

    // Get penjualan data
    const penjualanData = await db.penjualan.findMany({
      orderBy: { tanggal: 'desc' },
      take: periode ? parseInt(periode) : 30
    })

    let prompt = ''
    let analysisTitle = ''

    switch (jenisAnalisis) {
      case 'PRODUCTION_PREDICTION':
        analysisTitle = 'Prediksi Produksi Telur'
        prompt = generateProductionPredictionPrompt(kandang, allKandang, historicalData, periode)
        break

      case 'COST_ANALYSIS':
        analysisTitle = 'Analisis Biaya Produksi'
        prompt = generateCostAnalysisPrompt(stokList, penjualanData, historicalData)
        break

      case 'PERFORMANCE_ANALYSIS':
        analysisTitle = 'Analisis Performa Peternakan'
        prompt = generatePerformanceAnalysisPrompt(kandang, allKandang, historicalData)
        break

      case 'HEALTH_ANALYSIS':
        analysisTitle = 'Analisis Kesehatan Ayam'
        prompt = generateHealthAnalysisPrompt(historicalData)
        break

      case 'PROFITABILITY_ANALYSIS':
        analysisTitle = 'Analisis Profitabilitas'
        prompt = generateProfitabilityAnalysisPrompt(penjualanData, stokList, historicalData)
        break

      default:
        return NextResponse.json(
          { error: 'Jenis analisis tidak valid' },
          { status: 400 }
        )
    }

    // Call AI using z-ai-web-dev-sdk
    const { createChatCompletion } = await import('z-ai-web-dev-sdk')

    const aiResponse = await createChatCompletion({
      messages: [
        {
          role: 'system',
          content: 'Anda adalah ahli analisis peternakan ayam petelur. Berikan analisis mendalam dengan rekomendasi yang dapat ditindaklanjuti. Selalu berikan respons dalam format JSON yang valid.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      model: 'gpt-4'
    })

    let analysisResult
    try {
      // Try to parse JSON from AI response
      const jsonMatch = aiResponse.choices[0].message.content.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        analysisResult = JSON.parse(jsonMatch[0])
      } else {
        throw new Error('No JSON found')
      }
    } catch (error) {
      // Fallback if JSON parsing fails
      analysisResult = {
        ringkasan: aiResponse.choices[0].message.content.substring(0, 500),
        rekomendasi: [
          'Lakukan monitoring rutin terhadap produksi telur',
          'Optimalkan formulasi pakan untuk efisiensi biaya',
          'Perhatikan kesehatan ayam untuk mengurangi mortalitas'
        ],
        raw_response: aiResponse.choices[0].message.content
      }
    }

    // Save analysis to database
    const savedAnalysis = await db.aIAnalysis.create({
      data: {
        jenisAnalisis,
        hasil: JSON.stringify(analysisResult),
        rekomendasi: analysisResult.rekomendasi?.join('; ') || analysisResult.rekomendasi?.toString()
      }
    })

    return NextResponse.json({
      message: 'Analisis berhasil',
      analysis: analysisResult,
      title: analysisTitle,
      analysisId: savedAnalysis.id
    })
  } catch (error) {
    console.error('AI analysis error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat melakukan analisis' },
      { status: 500 }
    )
  }
}

function generateProductionPredictionPrompt(kandang: any, allKandang: any[], data: any[], periode?: string) {
  const totalAyam = allKandang.reduce((sum, k) => sum + k.jumlahAyam, 0)
  const totalKandang = allKandang.length

  const avgProduksi = data.length > 0
    ? data.reduce((sum, d) => sum + d.telurBagus + d.telurBentes + d.telurCream, 0) / data.length
    : 0

  const avgPakan = data.length > 0
    ? data.reduce((sum, d) => sum + d.bahanBakuPakan + d.pakanJadi, 0) / data.length
    : 0

  const avgMortalitas = data.length > 0
    ? data.reduce((sum, d) => sum + d.kematian, 0) / data.length
    : 0

  return `Lakukan prediksi produksi telur untuk peternakan dengan data berikut:

DATA PETERNAKAN:
- Jumlah kandang: ${totalKandang}
- Total ayam: ${totalAyam} ekor
- Periode data: ${data.length} hari terakhir
- ${kandang ? `Kandang: ${kandang.nama} (${kandang.jenis})` : 'Semua kandang'}

RIWAYAT PRODUKSI:
- Rata-rata produksi harian: ${avgProduksi.toFixed(0)} butir
- Rata-rata konsumsi pakan: ${avgPakan.toFixed(1)} kg/hari
- Rata-rata mortalitas: ${avgMortalitas.toFixed(2)} ekor/hari
- FCR saat ini: ${avgProduksi > 0 ? (avgPakan / avgProduksi).toFixed(2) : 'N/A'}

DETAIL PRODUKSI TERAKHIR:
${data.slice(0, 7).map((d, i) => `- Hari ke-${i + 1}: ${(d.telurBagus + d.telurBentes + d.telurCream)} butir, ${(d.bahanBakuPakan + d.pakanJadi).toFixed(1)} kg pakan`).join('\n')}

Berikan prediksi dalam format JSON:
{
  "prediksi_produksi": {
    "besok": "jumlah prediksi",
    "7_hari": "total prediksi 7 hari",
    "30_hari": "total prediksi 30 hari"
  },
  "trend": "naik/turun/stabil",
  "faktor_pengaruh": [
    "faktor 1",
    "faktor 2"
  ],
  "rekomendasi": [
    "rekomendasi 1",
    "rekomendasi 2"
  ],
  "potensi_masalah": [
    "masalah 1",
    "masalah 2"
  ],
  "ringkasan": "ringkasan analisis prediksi"
}`
}

function generateCostAnalysisPrompt(stokList: any[], penjualanData: any[], dataHarian: any[]) {
  return `Lakukan analisis biaya produksi peternakan dengan data berikut:

STOK DAN HARGA:
${stokList.map(s => `- ${s.nama}: ${s.jumlah} ${s.satuan} @ Rp ${s.hargaSatuan || 'N/A'}/${s.satuan}`).join('\n')}

PENJUALAN TERAKHIR:
${penjualanData.slice(0, 10).map(p => `- ${new Date(p.tanggal).toLocaleDateString()}: Rp ${p.totalHarga.toLocaleString()}`).join('\n')}

Berikan analisis biaya dalam format JSON:
{
  "struktur_biaya": {
    "pakan": "persentase atau jumlah",
    "obat": "persentase atau jumlah",
    "tenaga_kerja": "persentase atau jumlah",
    "lainnya": "persentase atau jumlah"
  },
  "total_biaya": "estimasi total biaya",
  "biaya_per_butir": "biaya produksi per butir telur",
  "biaya_per_kg": "biaya produksi per kg telur",
  "efisiensi": "penilaian efisiensi biaya",
  "area_penghematan": [
    "area 1",
    "area 2"
  ],
  "rekomendasi": [
    "rekomendasi 1",
    "rekomendasi 2"
  ],
  "ringkasan": "ringkasan analisis biaya"
}`
}

function generatePerformanceAnalysisPrompt(kandang: any, allKandang: any[], data: any[]) {
  return `Lakukan analisis performa peternakan dengan data berikut:

DATA KANDANG:
${allKandang.map(k => `- ${k.nama}: ${k.jumlahAyam}/${k.kapasitas} ekor (${((k.jumlahAyam / k.kapasitas) * 100).toFixed(1)}% utilisasi)`).join('\n')}

RIWAYAT PRODUKSI:
${data.length > 0 ? data.slice(0, 7).map((d, i) => `- Hari ke-${i + 1}: ${d.telurBagus + d.telurBentes + d.telurCream} telur`).join('\n') : 'Tidak ada data'}

Berikan analisis performa dalam format JSON:
{
  "skor_performa": "skor 0-100",
  "kategori_performa": "sangat baik/baik/cukup/kurang",
  "metrik_utama": {
    "produktivitas": "skor",
    "efisiensi_pakan": "skor",
    "kesehatan": "skor",
    "kualitas_telur": "skor"
  },
  "kekuatan": [
    "kekuatan 1",
    "kekuatan 2"
  ],
  "kelemahan": [
    "kelemahan 1",
    "kelemahan 2"
  ],
  "rekomendasi": [
    "rekomendasi 1",
    "rekomendasi 2"
  ],
  "ringkasan": "ringkasan analisis performa"
}`
}

function generateHealthAnalysisPrompt(data: any[]) {
  return `Lakukan analisis kesehatan ayam dengan data berikut:

DATA KESEHATAN HARIAN:
${data.slice(0, 14).map((d, i) => `- Hari ke-${i + 1}: ${d.kematian} kematian, ${d.afkir} afkir${d.vaksinasi ? `, vaksin: ${d.vaksinasi}` : ''}`).join('\n')}

TOTAL KEMATIAN: ${data.reduce((sum, d) => sum + d.kematian, 0)} ekor
TOTAL AFKIR: ${data.reduce((sum, d) => sum + d.afkir, 0)} ekor
JUMLAH VAKSINASI: ${data.filter(d => d.vaksinasi).length} kali

Berikan analisis kesehatan dalam format JSON:
{
  "status_kesehatan": "sehat/cukup sehat/perlu perhatian/kritis",
  "tingkat_mortalitas": "rendah/sedang/tinggi",
  "tingkat_afkir": "rendah/sedang/tinggi",
  "risiko_kesehatan": [
    "risiko 1",
    "risiko 2"
  ],
  "rekomendasi_kesehatan": [
    "rekomendasi 1",
    "rekomendasi 2"
  ],
  "jadwal_vaksin": "rekomendasi jadwal vaksin",
  "ringkasan": "ringkasan analisis kesehatan"
}`
}

function generateProfitabilityAnalysisPrompt(penjualanData: any[], stokList: any[], dataHarian: any[]) {
  return `Lakukan analisis profitabilitas peternakan dengan data berikut:

PENJUALAN:
Total Transaksi: ${penjualanData.length}
Total Pendapatan: Rp ${penjualanData.reduce((sum, p) => sum + p.totalHarga, 0).toLocaleString()}
Piutang Belum Lunas: Rp ${penjualanData.reduce((sum, p) => sum + (p.sisa || 0), 0).toLocaleString()}

PRODUKSI:
Total Telur: ${dataHarian.reduce((sum, d) => sum + d.telurBagus + d.telurBentes + d.telurCream, 0)} butir
Total Pakan: ${dataHarian.reduce((sum, d) => sum + d.bahanBakuPakan + d.pakanJadi, 0).toFixed(1)} kg

Berikan analisis profitabilitas dalam format JSON:
{
  "profit_margin": "persentase profit",
  "kategori_profit": "sangat menguntungkan/menguntungkan/break even/rugi",
  "rasio_keuangan": {
    "pendapatan": "nilai",
    "pengeluaran_estimasi": "nilai",
    "profit_bersih": "nilai",
    "roi": "persentase"
  },
  "area_optimasi": [
    "area 1",
    "area 2"
  ],
  "rekomendasi": [
    "rekomendasi 1",
    "rekomendasi 2"
  ],
  "ringkasan": "ringkasan analisis profitabilitas"
}`
}
