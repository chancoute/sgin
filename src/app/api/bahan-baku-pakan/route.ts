import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET all bahan baku pakan
export async function GET(request: NextRequest) {
  try {
    const bahanBakuPakan = await db.bahanBakuPakan.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({ bahanBakuPakan })
  } catch (error) {
    console.error('Get bahan baku pakan error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}

// POST create bahan baku pakan
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { nama, hargaPerKg, jumlah, nutrisi } = body

    // Validate input
    if (!nama || !hargaPerKg) {
      return NextResponse.json(
        { error: 'Nama dan harga per kg wajib diisi' },
        { status: 400 }
      )
    }

    // Check if bahan baku already exists
    const existingBahanBaku = await db.bahanBakuPakan.findUnique({
      where: { nama }
    })

    if (existingBahanBaku) {
      return NextResponse.json(
        { error: 'Bahan baku pakan sudah ada' },
        { status: 400 }
      )
    }

    // Create bahan baku pakan
    const bahanBakuPakan = await db.bahanBakuPakan.create({
      data: {
        nama,
        hargaPerKg,
        jumlah: jumlah || 0,
        nutrisi: nutrisi || null
      }
    })

    return NextResponse.json(
      { message: 'Bahan baku pakan berhasil ditambahkan', bahanBakuPakan },
      { status: 201 }
    )
  } catch (error) {
    console.error('Create bahan baku pakan error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}
