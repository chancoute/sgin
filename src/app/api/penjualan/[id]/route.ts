import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET single penjualan
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const penjualan = await db.penjualan.findUnique({
      where: { id: params.id },
      include: {
        user: true
      }
    })

    if (!penjualan) {
      return NextResponse.json(
        { error: 'Penjualan tidak ditemukan' },
        { status: 404 }
      )
    }

    return NextResponse.json({ penjualan })
  } catch (error) {
    console.error('Get penjualan error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}

// PUT update penjualan
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const {
      nomorInvoice,
      tanggal,
      pelanggan,
      userId,
      telurKg,
      telurPeti,
      ayamAfkir,
      ayamPulet,
      hargaTelurPerKg,
      hargaTelurPerPeti,
      hargaAyamAfkir,
      hargaAyamPulet,
      dibayar,
      keterangan
    } = body

    // Check if penjualan exists
    const existingPenjualan = await db.penjualan.findUnique({
      where: { id: params.id }
    })

    if (!existingPenjualan) {
      return NextResponse.json(
        { error: 'Penjualan tidak ditemukan' },
        { status: 404 }
      )
    }

    // Check if new invoice number already exists (if number is being changed)
    if (nomorInvoice && nomorInvoice !== existingPenjualan.nomorInvoice) {
      const invoiceExists = await db.penjualan.findUnique({
        where: { nomorInvoice }
      })

      if (invoiceExists) {
        return NextResponse.json(
          { error: 'Nomor invoice sudah ada' },
          { status: 400 }
        )
      }
    }

    // Calculate total if prices or quantities are provided
    let totalHarga = existingPenjualan.totalHarga
    if (
      telurKg !== undefined || telurPeti !== undefined ||
      ayamAfkir !== undefined || ayamPulet !== undefined ||
      hargaTelurPerKg !== undefined || hargaTelurPerPeti !== undefined ||
      hargaAyamAfkir !== undefined || hargaAyamPulet !== undefined
    ) {
      const tKg = telurKg !== undefined ? telurKg : existingPenjualan.telurKg
      const tPeti = telurPeti !== undefined ? telurPeti : existingPenjualan.telurPeti
      const aAfkir = ayamAfkir !== undefined ? ayamAfkir : existingPenjualan.ayamAfkir
      const aPulet = ayamPulet !== undefined ? ayamPulet : existingPenjualan.ayamPulet

      const hTelurKg = hargaTelurPerKg || 0
      const hTelurPeti = hargaTelurPerPeti || 0
      const hAyamAfkir = hargaAyamAfkir || 0
      const hAyamPulet = hargaAyamPulet || 0

      const totalTelur = tKg * hTelurKg + tPeti * hTelurPeti
      const totalAyam = aAfkir * hAyamAfkir + aPulet * hAyamPulet
      totalHarga = totalTelur + totalAyam
    }

    const paid = dibayar !== undefined ? dibayar : existingPenjualan.dibayar
    const sisa = totalHarga - paid

    // Prepare update data
    const updateData: any = {}
    if (nomorInvoice) updateData.nomorInvoice = nomorInvoice
    if (tanggal) updateData.tanggal = new Date(tanggal)
    if (pelanggan !== undefined) updateData.pelanggan = pelanggan
    if (userId) updateData.userId = userId
    if (telurKg !== undefined) updateData.telurKg = telurKg
    if (telurPeti !== undefined) updateData.telurPeti = telurPeti
    if (ayamAfkir !== undefined) updateData.ayamAfkir = ayamAfkir
    if (ayamPulet !== undefined) updateData.ayamPulet = ayamPulet
    if (dibayar !== undefined) {
      updateData.dibayar = dibayar
      updateData.sisa = sisa
    }
    if (keterangan !== undefined) updateData.keterangan = keterangan

    // Recalculate total if needed
    if (
      telurKg !== undefined || telurPeti !== undefined ||
      ayamAfkir !== undefined || ayamPulet !== undefined
    ) {
      updateData.totalHarga = totalHarga
      updateData.sisa = totalHarga - (dibayar !== undefined ? dibayar : existingPenjualan.dibayar)
    }

    // Update penjualan
    const penjualan = await db.penjualan.update({
      where: { id: params.id },
      data: updateData,
      include: {
        user: true
      }
    })

    return NextResponse.json({
      message: 'Penjualan berhasil diupdate',
      penjualan
    })
  } catch (error) {
    console.error('Update penjualan error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}

// DELETE penjualan
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if penjualan exists
    const existingPenjualan = await db.penjualan.findUnique({
      where: { id: params.id }
    })

    if (!existingPenjualan) {
      return NextResponse.json(
        { error: 'Penjualan tidak ditemukan' },
        { status: 404 }
      )
    }

    // Delete penjualan
    await db.penjualan.delete({
      where: { id: params.id }
    })

    return NextResponse.json({
      message: 'Penjualan berhasil dihapus'
    })
  } catch (error) {
    console.error('Delete penjualan error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}
