import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET single kandang
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const kandang = await db.kandang.findUnique({
      where: { id: params.id }
    })

    if (!kandang) {
      return NextResponse.json(
        { error: 'Kandang tidak ditemukan' },
        { status: 404 }
      )
    }

    return NextResponse.json({ kandang })
  } catch (error) {
    console.error('Get kandang error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}

// PUT update kandang
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { nama, jenis, kapasitas, jumlahAyam, isActive } = body

    // Check if kandang exists
    const existingKandang = await db.kandang.findUnique({
      where: { id: params.id }
    })

    if (!existingKandang) {
      return NextResponse.json(
        { error: 'Kandang tidak ditemukan' },
        { status: 404 }
      )
    }

    // Check if new name already exists (if name is being changed)
    if (nama && nama !== existingKandang.nama) {
      const nameExists = await db.kandang.findUnique({
        where: { nama }
      })

      if (nameExists) {
        return NextResponse.json(
          { error: 'Nama kandang sudah ada' },
          { status: 400 }
        )
      }
    }

    // Prepare update data
    const updateData: any = {}
    if (nama) updateData.nama = nama
    if (jenis) updateData.jenis = jenis
    if (kapasitas) updateData.kapasitas = kapasitas
    if (typeof jumlahAyam === 'number') updateData.jumlahAyam = jumlahAyam
    if (typeof isActive === 'boolean') updateData.isActive = isActive

    // Update kandang
    const kandang = await db.kandang.update({
      where: { id: params.id },
      data: updateData
    })

    return NextResponse.json({
      message: 'Kandang berhasil diupdate',
      kandang
    })
  } catch (error) {
    console.error('Update kandang error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}

// DELETE kandang
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if kandang exists
    const existingKandang = await db.kandang.findUnique({
      where: { id: params.id }
    })

    if (!existingKandang) {
      return NextResponse.json(
        { error: 'Kandang tidak ditemukan' },
        { status: 404 }
      )
    }

    // Delete kandang
    await db.kandang.delete({
      where: { id: params.id }
    })

    return NextResponse.json({
      message: 'Kandang berhasil dihapus'
    })
  } catch (error) {
    console.error('Delete kandang error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}
