import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { kandangId, jumlahAyam, targetProduksi } = body

    // Validate input
    if (!kandangId || !jumlahAyam) {
      return NextResponse.json(
        { error: 'Kandang dan jumlah ayam wajib diisi' },
        { status: 400 }
      )
    }

    // Get kandang data
    const kandang = await db.kandang.findUnique({
      where: { id: kandangId }
    })

    if (!kandang) {
      return NextResponse.json(
        { error: 'Kandang tidak ditemukan' },
        { status: 404 }
      )
    }

    // Get bahan baku pakan stock
    const stokBahanBaku = await db.stok.findMany({
      where: { jenis: 'BAHAN_BAKU_PAKAN' }
    })

    // Get historical data for this kandang
    const historicalData = await db.dataHarian.findMany({
      where: { kandangId },
      orderBy: { tanggal: 'desc' },
      take: 30
    })

    // Calculate averages from historical data
    const avgProduksi = historicalData.length > 0
      ? historicalData.reduce((sum, d) => sum + d.telurBagus + d.telurBentes + d.telurCream, 0) / historicalData.length
      : 0

    const avgPakan = historicalData.length > 0
      ? historicalData.reduce((sum, d) => sum + d.bahanBakuPakan + d.pakanJadi, 0) / historicalData.length
      : 0

    const fcr = avgProduksi > 0 ? avgPakan / avgProduksi : 2.2 // Default FCR for layer chickens

    // Prepare context for AI
    const bahanBakuList = stokBahanBaku.map(s => ({
      nama: s.nama,
      jumlah: s.jumlah,
      satuan: s.satuan,
      harga: s.hargaSatuan
    }))

    const prompt = `Sebagai ahli nutrisi ayam petelur, berikan rekomendasi formulasi pakan yang optimal dengan informasi berikut:

KONTEKS PETERNAKAN:
- Jenis kandang: ${kandang.jenis}
- Jumlah ayam: ${jumlahAyam} ekor
- Kapasitas kandang: ${kandang.kapasitas} ekor
- Target produksi: ${targetProduksi || avgProduksi.toFixed(0)} butir/hari

RIWAYAT PRODUKSI:
- Rata-rata produksi telur: ${avgProduksi.toFixed(0)} butir/hari
- Rata-rata konsumsi pakan: ${avgPakan.toFixed(1)} kg/hari
- Feed Conversion Ratio (FCR) saat ini: ${fcr.toFixed(2)}

STOK BAHAN BAKU TERSEDIA:
${bahanBakuList.map(b => `- ${b.nama}: ${b.jumlah} ${b.satuan} (Rp ${b.hargaSatuan || 'N/A'}/${b.satuan})`).join('\n')}

Berikan rekomendasi berikut dalam format JSON:
{
  "formulasi_pakan": [
    {
      "bahan": "nama bahan",
      "persentase": 0-100,
      "jumlah_kg": jumlah dalam kg,
      "alasan": "alasan penggunaan bahan ini"
    }
  ],
  "kebutuhan_nutrisi": {
    "protein": "persentase target",
    "energi": "kcal/kg",
    "kalsium": "persentase",
    "fosfor": "persentase"
  },
  "biaya_estimasi": {
    "per_kg": "Rp/kg",
    "per_hari": "Rp/hari",
    "per_ayam": "Rp/ekor/hari"
  },
  "rekomendasi": [
    "rekomendasi 1",
    "rekomendasi 2"
  ],
  "manfaat": [
    "manfaat 1",
    "manfaat 2"
  ]
}

Pastikan formulasi pakan memenuhi standar nutrisi ayam petelur dan memaksimalkan efisiensi biaya.`

    // Call AI using z-ai-web-dev-sdk
    const { createChatCompletion } = await import('z-ai-web-dev-sdk')

    const aiResponse = await createChatCompletion({
      messages: [
        {
          role: 'system',
          content: 'Anda adalah ahli nutrisi ayam petelur dengan pengalaman luas dalam formulasi pakan yang efisien dan ekonomis. Selalu berikan respons dalam format JSON yang valid.'
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
        formulasi_pakan: [],
        kebutuhan_nutrisi: {
          protein: '16-18%',
          energi: '2800-3000 kcal/kg',
          kalsium: '3.5-4.0%',
          fosfor: '0.4-0.45%'
        },
        biaya_estimasi: {
          per_kg: 'Rp 0',
          per_hari: 'Rp 0',
          per_ayam: 'Rp 0'
        },
        rekomendasi: [
          'Gunakan formulasi pakan seimbang dengan protein 16-18%',
          'Pastikan kalsium cukup untuk kualitas cangkang telur'
        ],
        manfaat: [
          'Meningkatkan kualitas telur',
          'Mengoptimalkan biaya produksi'
        ],
        raw_response: aiResponse.choices[0].message.content
      }
    }

    // Save analysis to database
    const savedAnalysis = await db.aIAnalysis.create({
      data: {
        jenisAnalisis: 'FEED_OPTIMIZATION',
        hasil: JSON.stringify(analysisResult),
        rekomendasi: analysisResult.rekomendasi?.join('; ')
      }
    })

    return NextResponse.json({
      message: 'Optimasi pakan berhasil',
      analysis: analysisResult,
      kandang: {
        id: kandang.id,
        nama: kandang.nama,
        jenis: kandang.jenis
      },
      summary: {
        jumlahAyam,
        fcr: fcr.toFixed(2),
        avgProduksi: avgProduksi.toFixed(0),
        avgPakan: avgPakan.toFixed(1)
      },
      analysisId: savedAnalysis.id
    })
  } catch (error) {
    console.error('AI feed optimization error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat melakukan optimasi pakan' },
      { status: 500 }
    )
  }
}
