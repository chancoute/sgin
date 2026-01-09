import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET single stok
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const stok = await db.stok.findUnique({
      where: { id: params.id }
    })

    if (!stok) {
      return NextResponse.json(
        { error: 'Stok tidak ditemukan' },
        { status: 404 }
      )
    }

    return NextResponse.json({ stok })
  } catch (error) {
    console.error('Get stok error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}

// PUT update stok
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { jenis, nama, jumlah, satuan, hargaSatuan, keterangan } = body

    // Check if stok exists
    const existingStok = await db.stok.findUnique({
      where: { id: params.id }
    })

    if (!existingStok) {
      return NextResponse.json(
        { error: 'Stok tidak ditemukan' },
        { status: 404 }
      )
    }

    // Prepare update data
    const updateData: any = {}
    if (jenis) updateData.jenis = jenis
    if (nama) updateData.nama = nama
    if (typeof jumlah === 'number') updateData.jumlah = jumlah
    if (satuan) updateData.satuan = satuan
    if (typeof hargaSatuan === 'number') updateData.hargaSatuan = hargaSatuan
    if (keterangan !== undefined) updateData.keterangan = keterangan

    // Update stok
    const stok = await db.stok.update({
      where: { id: params.id },
      data: updateData
    })

    return NextResponse.json({
      message: 'Stok berhasil diupdate',
      stok
    })
  } catch (error) {
    console.error('Update stok error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}

// DELETE stok
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if stok exists
    const existingStok = await db.stok.findUnique({
      where: { id: params.id }
    })

    if (!existingStok) {
      return NextResponse.json(
        { error: 'Stok tidak ditemukan' },
        { status: 404 }
      )
    }

    // Delete stok
    await db.stok.delete({
      where: { id: params.id }
    })

    return NextResponse.json({
      message: 'Stok berhasil dihapus'
    })
  } catch (error) {
    console.error('Delete stok error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}
