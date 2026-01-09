import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET all harga telur
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const jenis = searchParams.get('jenis')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    const where: any = {}

    if (jenis) {
      where.jenis = jenis
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

    const hargaTelur = await db.hargaTelur.findMany({
      where,
      orderBy: {
        tanggal: 'desc'
      },
      take: 100 // Limit to last 100 records
    })

    // Get latest prices for each type
    const latestPrices = await db.hargaTelur.findMany({
      distinct: ['jenis'],
      orderBy: {
        tanggal: 'desc'
      }
    })

    return NextResponse.json({
      hargaTelur,
      latestPrices
    })
  } catch (error) {
    console.error('Get harga telur error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}

// POST create harga telur
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { jenis, hargaPerKg, hargaPerPeti, tanggal } = body

    // Validate input
    if (!jenis || !hargaPerKg) {
      return NextResponse.json(
        { error: 'Jenis telur dan harga per kg wajib diisi' },
        { status: 400 }
      )
    }

    // Create harga telur
    const hargaTelur = await db.hargaTelur.create({
      data: {
        jenis,
        hargaPerKg,
        hargaPerPeti: hargaPerPeti || null,
        tanggal: tanggal ? new Date(tanggal) : new Date()
      }
    })

    return NextResponse.json(
      { message: 'Harga telur berhasil ditambahkan', hargaTelur },
      { status: 201 }
    )
  } catch (error) {
    console.error('Create harga telur error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}
