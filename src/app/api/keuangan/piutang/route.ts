import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET all piutang
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    const where: any = {}

    if (status) {
      where.status = status
    }

    const piutang = await db.piutang.findMany({
      where,
      orderBy: {
        jatuhTempo: 'asc'
      }
    })

    // Calculate totals
    const totalPiutang = piutang.reduce((sum, p) => sum + p.jumlah, 0)
    const totalSudahBayar = piutang.reduce((sum, p) => sum + p.sudahBayar, 0)
    const totalSisa = piutang.reduce((sum, p) => sum + p.sisa, 0)

    return NextResponse.json({
      piutang,
      summary: {
        totalPiutang,
        totalSudahBayar,
        totalSisa
      }
    })
  } catch (error) {
    console.error('Get piutang error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}

// POST create piutang
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { pelanggan, jumlah, jatuhTempo, keterangan } = body

    // Validate input
    if (!pelanggan || !jumlah || !jatuhTempo) {
      return NextResponse.json(
        { error: 'Pelanggan, jumlah, dan jatuh tempo wajib diisi' },
        { status: 400 }
      )
    }

    // Create piutang
    const piutang = await db.piutang.create({
      data: {
        pelanggan,
        jumlah,
        jatuhTempo: new Date(jatuhTempo),
        keterangan: keterangan || null,
        status: 'BELUM_LUNAS'
      }
    })

    return NextResponse.json(
      { message: 'Piutang berhasil ditambahkan', piutang },
      { status: 201 }
    )
  } catch (error) {
    console.error('Create piutang error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}
