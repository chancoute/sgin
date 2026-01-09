import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET all utang
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    const where: any = {}

    if (status) {
      where.status = status
    }

    const utang = await db.utang.findMany({
      where,
      orderBy: {
        jatuhTempo: 'asc'
      }
    })

    // Calculate totals
    const totalUtang = utang.reduce((sum, u) => sum + u.jumlah, 0)
    const totalSudahBayar = utang.reduce((sum, u) => sum + u.sudahBayar, 0)
    const totalSisa = utang.reduce((sum, u) => sum + u.sisa, 0)

    return NextResponse.json({
      utang,
      summary: {
        totalUtang,
        totalSudahBayar,
        totalSisa
      }
    })
  } catch (error) {
    console.error('Get utang error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}

// POST create utang
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { pemasok, jumlah, jatuhTempo, keterangan } = body

    // Validate input
    if (!pemasok || !jumlah || !jatuhTempo) {
      return NextResponse.json(
        { error: 'Pemasok, jumlah, dan jatuh tempo wajib diisi' },
        { status: 400 }
      )
    }

    // Create utang
    const utang = await db.utang.create({
      data: {
        pemasok,
        jumlah,
        jatuhTempo: new Date(jatuhTempo),
        keterangan: keterangan || null,
        status: 'BELUM_LUNAS'
      }
    })

    return NextResponse.json(
      { message: 'Utang berhasil ditambahkan', utang },
      { status: 201 }
    )
  } catch (error) {
    console.error('Create utang error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}
