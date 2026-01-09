import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET all kandang
export async function GET(request: NextRequest) {
  try {
    const kandang = await db.kandang.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({ kandang })
  } catch (error) {
    console.error('Get kandang error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}

// POST create kandang
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { nama, jenis, kapasitas, jumlahAyam } = body

    // Validate input
    if (!nama || !jenis || !kapasitas) {
      return NextResponse.json(
        { error: 'Nama, jenis, dan kapasitas wajib diisi' },
        { status: 400 }
      )
    }

    // Check if kandang name already exists
    const existingKandang = await db.kandang.findUnique({
      where: { nama }
    })

    if (existingKandang) {
      return NextResponse.json(
        { error: 'Nama kandang sudah ada' },
        { status: 400 }
      )
    }

    // Create kandang
    const kandang = await db.kandang.create({
      data: {
        nama,
        jenis,
        kapasitas,
        jumlahAyam: jumlahAyam || 0
      }
    })

    return NextResponse.json(
      { message: 'Kandang berhasil dibuat', kandang },
      { status: 201 }
    )
  } catch (error) {
    console.error('Create kandang error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}
