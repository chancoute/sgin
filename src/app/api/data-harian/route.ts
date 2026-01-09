import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET all data harian
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const kandangId = searchParams.get('kandangId')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    const where: any = {}

    if (kandangId) {
      where.kandangId = kandangId
    }

    if (startDate || endDate) {
      where.tanggal = {}
      if (startDate) {
        where.tanggal.gte = new Date(startDate)
      }
      if (endDate) {
        where.tanggal.lte = new Date(endDate)
      }
    }

    const dataHarian = await db.dataHarian.findMany({
      where,
      include: {
        kandang: {
          select: {
            id: true,
            nama: true,
            jenis: true
          }
        },
        user: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: {
        tanggal: 'desc'
      }
    })

    return NextResponse.json({ dataHarian })
  } catch (error) {
    console.error('Get data harian error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}

// POST create data harian
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      kandangId,
      tanggal,
      userId,
      telurBagus,
      telurBentes,
      telurCream,
      bahanBakuPakan,
      pakanJadi,
      kematian,
      afkir,
      vaksinasi,
      jumlahVaksin
    } = body

    // Validate input
    if (!kandangId || !userId) {
      return NextResponse.json(
        { error: 'Kandang dan user wajib dipilih' },
        { status: 400 }
      )
    }

    // Check if kandang exists
    const kandang = await db.kandang.findUnique({
      where: { id: kandangId }
    })

    if (!kandang) {
      return NextResponse.json(
        { error: 'Kandang tidak ditemukan' },
        { status: 404 }
      )
    }

    // Check if user exists
    const user = await db.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User tidak ditemukan' },
        { status: 404 }
      )
    }

    // Create data harian
    const dataHarian = await db.dataHarian.create({
      data: {
        kandangId,
        tanggal: tanggal ? new Date(tanggal) : new Date(),
        userId,
        telurBagus: telurBagus || 0,
        telurBentes: telurBentes || 0,
        telurCream: telurCream || 0,
        bahanBakuPakan: bahanBakuPakan || 0,
        pakanJadi: pakanJadi || 0,
        kematian: kematian || 0,
        afkir: afkir || 0,
        vaksinasi,
        jumlahVaksin: jumlahVaksin || 0
      },
      include: {
        kandang: true,
        user: true
      }
    })

    // Update jumlah ayam di kandang jika ada kematian
    if (kematian > 0) {
      await db.kandang.update({
        where: { id: kandangId },
        data: {
          jumlahAyam: Math.max(0, kandang.jumlahAyam - kematian)
        }
      })
    }

    return NextResponse.json(
      { message: 'Data harian berhasil disimpan', dataHarian },
      { status: 201 }
    )
  } catch (error) {
    console.error('Create data harian error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}
