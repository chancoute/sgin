import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET all stok
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const jenis = searchParams.get('jenis')

    const where: any = {}
    if (jenis) {
      where.jenis = jenis
    }

    const stok = await db.stok.findMany({
      where,
      orderBy: [
        { jenis: 'asc' },
        { nama: 'asc' }
      ]
    })

    return NextResponse.json({ stok })
  } catch (error) {
    console.error('Get stok error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}

// POST create stok
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { jenis, nama, jumlah, satuan, hargaSatuan, keterangan } = body

    // Validate input
    if (!jenis || !nama || !satuan) {
      return NextResponse.json(
        { error: 'Jenis, nama, dan satuan wajib diisi' },
        { status: 400 }
      )
    }

    // Create stok
    const stok = await db.stok.create({
      data: {
        jenis,
        nama,
        jumlah: jumlah || 0,
        satuan,
        hargaSatuan: hargaSatuan || null,
        keterangan: keterangan || null
      }
    })

    return NextResponse.json(
      { message: 'Stok berhasil ditambahkan', stok },
      { status: 201 }
    )
  } catch (error) {
    console.error('Create stok error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}
