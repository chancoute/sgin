import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET single bahan baku pakan
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const bahanBakuPakan = await db.bahanBakuPakan.findUnique({
      where: { id: params.id },
      include: {
        formulasiPakan: true
      }
    })

    if (!bahanBakuPakan) {
      return NextResponse.json(
        { error: 'Bahan baku pakan tidak ditemukan' },
        { status: 404 }
      )
    }

    return NextResponse.json({ bahanBakuPakan })
  } catch (error) {
    console.error('Get bahan baku pakan error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}

// PUT update bahan baku pakan
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { nama, hargaPerKg, jumlah, nutrisi } = body

    // Check if bahan baku exists
    const existingBahanBaku = await db.bahanBakuPakan.findUnique({
      where: { id: params.id }
    })

    if (!existingBahanBaku) {
      return NextResponse.json(
        { error: 'Bahan baku pakan tidak ditemukan' },
        { status: 404 }
      )
    }

    // Check if new name already exists (if name is being changed)
    if (nama && nama !== existingBahanBaku.nama) {
      const nameExists = await db.bahanBakuPakan.findUnique({
        where: { nama }
      })

      if (nameExists) {
        return NextResponse.json(
          { error: 'Bahan baku pakan dengan nama ini sudah ada' },
          { status: 400 }
        )
      }
    }

    // Prepare update data
    const updateData: any = {}
    if (nama) updateData.nama = nama
    if (typeof hargaPerKg === 'number') updateData.hargaPerKg = hargaPerKg
    if (typeof jumlah === 'number') updateData.jumlah = jumlah
    if (nutrisi !== undefined) updateData.nutrisi = nutrisi

    // Update bahan baku pakan
    const bahanBakuPakan = await db.bahanBakuPakan.update({
      where: { id: params.id },
      data: updateData
    })

    return NextResponse.json({
      message: 'Bahan baku pakan berhasil diupdate',
      bahanBakuPakan
    })
  } catch (error) {
    console.error('Update bahan baku pakan error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}

// DELETE bahan baku pakan
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if bahan baku exists
    const existingBahanBaku = await db.bahanBakuPakan.findUnique({
      where: { id: params.id }
    })

    if (!existingBahanBaku) {
      return NextResponse.json(
        { error: 'Bahan baku pakan tidak ditemukan' },
        { status: 404 }
      )
    }

    // Delete bahan baku pakan
    await db.bahanBakuPakan.delete({
      where: { id: params.id }
    })

    return NextResponse.json({
      message: 'Bahan baku pakan berhasil dihapus'
    })
  } catch (error) {
    console.error('Delete bahan baku pakan error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}
