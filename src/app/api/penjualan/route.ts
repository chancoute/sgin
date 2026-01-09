import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET all penjualan
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const status = searchParams.get('status')

    const where: any = {}

    if (startDate || endDate) {
      where.tanggal = {}
      if (startDate) {
        where.tanggal.gte = new Date(startDate)
      }
      if (endDate) {
        where.tanggal.lte = new Date(endDate)
      }
    }

    const penjualan = await db.penjualan.findMany({
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
    const totalHarga = penjualan.reduce((sum, p) => sum + p.totalHarga, 0)
    const totalTelurKg = penjualan.reduce((sum, p) => sum + p.telurKg, 0)
    const totalTelurPeti = penjualan.reduce((sum, p) => sum + p.telurPeti, 0)
    const totalAyamAfkir = penjualan.reduce((sum, p) => sum + p.ayamAfkir, 0)
    const totalAyamPulet = penjualan.reduce((sum, p) => sum + p.ayamPulet, 0)

    return NextResponse.json({
      penjualan,
      summary: {
        totalTransaksi: penjualan.length,
        totalHarga,
        totalTelurKg,
        totalTelurPeti,
        totalAyamAfkir,
        totalAyamPulet
      }
    })
  } catch (error) {
    console.error('Get penjualan error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}

// POST create penjualan
export async function POST(request: NextRequest) {
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

    // Validate input
    if (!nomorInvoice || !userId) {
      return NextResponse.json(
        { error: 'Nomor invoice dan user wajib diisi' },
        { status: 400 }
      )
    }

    // Check if invoice number already exists
    const existingInvoice = await db.penjualan.findUnique({
      where: { nomorInvoice }
    })

    if (existingInvoice) {
      return NextResponse.json(
        { error: 'Nomor invoice sudah ada' },
        { status: 400 }
      )
    }

    // Calculate total
    const totalTelur = (telurKg || 0) * (hargaTelurPerKg || 0) +
                       (telurPeti || 0) * (hargaTelurPerPeti || 0)
    const totalAyam = (ayamAfkir || 0) * (hargaAyamAfkir || 0) +
                     (ayamPulet || 0) * (hargaAyamPulet || 0)
    const totalHarga = totalTelur + totalAyam
    const sisa = totalHarga - (dibayar || 0)

    // Create penjualan
    const penjualan = await db.penjualan.create({
      data: {
        nomorInvoice,
        tanggal: tanggal ? new Date(tanggal) : new Date(),
        pelanggan: pelanggan || '',
        userId,
        telurKg: telurKg || 0,
        telurPeti: telurPeti || 0,
        ayamAfkir: ayamAfkir || 0,
        ayamPulet: ayamPulet || 0,
        totalHarga,
        dibayar: dibayar || 0,
        sisa,
        keterangan: keterangan || null
      },
      include: {
        user: true
      }
    })

    return NextResponse.json(
      { message: 'Penjualan berhasil ditambahkan', penjualan },
      { status: 201 }
    )
  } catch (error) {
    console.error('Create penjualan error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}
