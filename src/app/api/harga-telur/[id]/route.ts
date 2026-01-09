import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET single harga telur
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const hargaTelur = await db.hargaTelur.findUnique({
      where: { id: params.id }
    })

    if (!hargaTelur) {
      return NextResponse.json(
        { error: 'Harga telur tidak ditemukan' },
        { status: 404 }
      )
    }

    return NextResponse.json({ hargaTelur })
  } catch (error) {
    console.error('Get harga telur error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}

// PUT update harga telur
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { jenis, hargaPerKg, hargaPerPeti, tanggal } = body

    // Check if harga telur exists
    const existingHarga = await db.hargaTelur.findUnique({
      where: { id: params.id }
    })

    if (!existingHarga) {
      return NextResponse.json(
        { error: 'Harga telur tidak ditemukan' },
        { status: 404 }
      )
    }

    // Prepare update data
    const updateData: any = {}
    if (jenis) updateData.jenis = jenis
    if (typeof hargaPerKg === 'number') updateData.hargaPerKg = hargaPerKg
    if (typeof hargaPerPeti === 'number') updateData.hargaPerPeti = hargaPerPeti
    if (tanggal) updateData.tanggal = new Date(tanggal)

    // Update harga telur
    const hargaTelur = await db.hargaTelur.update({
      where: { id: params.id },
      data: updateData
    })

    return NextResponse.json({
      message: 'Harga telur berhasil diupdate',
      hargaTelur
    })
  } catch (error) {
    console.error('Update harga telur error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}

// DELETE harga telur
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if harga telur exists
    const existingHarga = await db.hargaTelur.findUnique({
      where: { id: params.id }
    })

    if (!existingHarga) {
      return NextResponse.json(
        { error: 'Harga telur tidak ditemukan' },
        { status: 404 }
      )
    }

    // Delete harga telur
    await db.hargaTelur.delete({
      where: { id: params.id }
    })

    return NextResponse.json({
      message: 'Harga telur berhasil dihapus'
    })
  } catch (error) {
    console.error('Delete harga telur error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}
