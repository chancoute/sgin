import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET all data kesehatan
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const kandangId = searchParams.get('kandangId')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    const where: any = {}

    if (kandangId) {
      where.kandangId = kandangId
    }

    if (startDate || endDate) {
      where.tanggal = {}
      if (startDate) {
        where.tanggal.gte = new Date(startDate)
      }
      if (endDate) {
        where.tanggal.lte = new Date(endDate)
      }
    }

    const kesehatanAyam = await db.kesehatanAyam.findMany({
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
    const totalAyamSakit = kesehatanAyam.reduce((sum, k) => sum + k.ayamSakit, 0)
    const totalAyamSembuh = kesehatanAyam.reduce((sum, k) => sum + k.ayamSembuh, 0)

    return NextResponse.json({
      kesehatanAyam,
      summary: {
        totalAyamSakit,
        totalAyamSembuh
      }
    })
  } catch (error) {
    console.error('Get kesehatan ayam error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}

// POST create data kesehatan
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { kandangId, tanggal, userId, ayamSakit, gejala, diagnosa, ayamSembuh, obat, dosis, keterangan } = body

    // Validate input
    if (!kandangId || !userId) {
      return NextResponse.json(
        { error: 'Kandang dan user wajib diisi' },
        { status: 400 }
      )
    }

    // Create kesehatan ayam
    const kesehatanAyam = await db.kesehatanAyam.create({
      data: {
        kandangId,
        tanggal: tanggal ? new Date(tanggal) : new Date(),
        userId,
        ayamSakit: ayamSakit || 0,
        gejala: gejala || null,
        diagnosa: diagnosa || null,
        ayamSembuh: ayamSembuh || 0,
        obat: obat || null,
        dosis: dosis || null,
        keterangan: keterangan || null
      },
      include: {
        user: true
      }
    })

    return NextResponse.json(
      { message: 'Data kesehatan berhasil ditambahkan', kesehatanAyam },
      { status: 201 }
    )
  } catch (error) {
    console.error('Create kesehatan ayam error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}
