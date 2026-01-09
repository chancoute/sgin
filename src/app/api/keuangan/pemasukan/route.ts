import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET all pemasukan
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const jenis = searchParams.get('jenis')

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

    const pemasukan = await db.pemasukan.findMany({
      where,
      include: {
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

    // Calculate totals
    const totalPemasukan = pemasukan.reduce((sum, p) => sum + p.jumlah, 0)
    const byJenis = pemasukan.reduce((acc: any, p) => {
      acc[p.jenis] = (acc[p.jenis] || 0) + p.jumlah
      return acc
    }, {})

    return NextResponse.json({
      pemasukan,
      summary: {
        totalPemasukan,
        byJenis
      }
    })
  } catch (error) {
    console.error('Get pemasukan error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}

// POST create pemasukan
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { nomorBukti, tanggal, jenis, jumlah, keterangan, userId } = body

    // Validate input
    if (!nomorBukti || !jenis || !jumlah || !userId) {
      return NextResponse.json(
        { error: 'Nomor bukti, jenis, jumlah, dan user wajib diisi' },
        { status: 400 }
      )
    }

    // Check if nomor bukti already exists
    const existingPemasukan = await db.pemasukan.findUnique({
      where: { nomorBukti }
    })

    if (existingPemasukan) {
      return NextResponse.json(
        { error: 'Nomor bukti sudah ada' },
        { status: 400 }
      )
    }

    // Create pemasukan
    const pemasukan = await db.pemasukan.create({
      data: {
        nomorBukti,
        tanggal: tanggal ? new Date(tanggal) : new Date(),
        jenis,
        jumlah,
        keterangan: keterangan || null,
        userId
      },
      include: {
        user: true
      }
    })

    return NextResponse.json(
      { message: 'Pemasukan berhasil ditambahkan', pemasukan },
      { status: 201 }
    )
  } catch (error) {
    console.error('Create pemasukan error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}
