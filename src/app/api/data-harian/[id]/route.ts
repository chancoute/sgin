import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET single data harian
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const dataHarian = await db.dataHarian.findUnique({
      where: { id: params.id },
      include: {
        kandang: true,
        user: true
      }
    })

    if (!dataHarian) {
      return NextResponse.json(
        { error: 'Data harian tidak ditemukan' },
        { status: 404 }
      )
    }

    return NextResponse.json({ dataHarian })
  } catch (error) {
    console.error('Get data harian error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}

// PUT update data harian
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const {
      kandangId,
      tanggal,
      userId,
      telurBagus,
      telurBentes,
      telurCream,
      bahanBakuPakan,
      pakanJadi,
      kematian,
      afkir,
      vaksinasi,
      jumlahVaksin
    } = body

    // Check if data harian exists
    const existingData = await db.dataHarian.findUnique({
      where: { id: params.id }
    })

    if (!existingData) {
      return NextResponse.json(
        { error: 'Data harian tidak ditemukan' },
        { status: 404 }
      )
    }

    // Prepare update data
    const updateData: any = {}
    if (kandangId) updateData.kandangId = kandangId
    if (tanggal) updateData.tanggal = new Date(tanggal)
    if (userId) updateData.userId = userId
    if (typeof telurBagus === 'number') updateData.telurBagus = telurBagus
    if (typeof telurBentes === 'number') updateData.telurBentes = telurBentes
    if (typeof telurCream === 'number') updateData.telurCream = telurCream
    if (typeof bahanBakuPakan === 'number') updateData.bahanBakuPakan = bahanBakuPakan
    if (typeof pakanJadi === 'number') updateData.pakanJadi = pakanJadi
    if (typeof kematian === 'number') updateData.kematian = kematian
    if (typeof afkir === 'number') updateData.afkir = afkir
    if (vaksinasi !== undefined) updateData.vaksinasi = vaksinasi
    if (typeof jumlahVaksin === 'number') updateData.jumlahVaksin = jumlahVaksin

    // Update data harian
    const dataHarian = await db.dataHarian.update({
      where: { id: params.id },
      data: updateData,
      include: {
        kandang: true,
        user: true
      }
    })

    return NextResponse.json({
      message: 'Data harian berhasil diupdate',
      dataHarian
    })
  } catch (error) {
    console.error('Update data harian error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}

// DELETE data harian
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if data harian exists
    const existingData = await db.dataHarian.findUnique({
      where: { id: params.id }
    })

    if (!existingData) {
      return NextResponse.json(
        { error: 'Data harian tidak ditemukan' },
        { status: 404 }
      )
    }

    // Delete data harian
    await db.dataHarian.delete({
      where: { id: params.id }
    })

    return NextResponse.json({
      message: 'Data harian berhasil dihapus'
    })
  } catch (error) {
    console.error('Delete data harian error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}
