import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET all jadwal vaksin
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const kandangId = searchParams.get('kandangId')
    const status = searchParams.get('status')

    const where: any = {}

    if (kandangId) {
      where.kandangId = kandangId
    }

    if (status) {
      where.status = status
    }

    const jadwalVaksin = await db.jadwalVaksin.findMany({
      where,
      include: {
        kandang: {
          select: {
            id: true,
            nama: true,
            jenis: true
          }
        }
      },
      orderBy: {
        tanggalJadwal: 'asc'
      }
    })

    return NextResponse.json({ jadwalVaksin })
  } catch (error) {
    console.error('Get jadwal vaksin error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}

// POST create jadwal vaksin
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { kandangId, namaVaksin, tanggalJadwal, jumlahAyam, keterangan } = body

    // Validate input
    if (!kandangId || !namaVaksin || !tanggalJadwal) {
      return NextResponse.json(
        { error: 'Kandang, nama vaksin, dan tanggal jadwal wajib diisi' },
        { status: 400 }
      )
    }

    // Create jadwal vaksin
    const jadwalVaksin = await db.jadwalVaksin.create({
      data: {
        kandangId,
        namaVaksin,
        tanggalJadwal: new Date(tanggalJadwal),
        jumlahAyam: jumlahAyam || 0,
        keterangan: keterangan || null,
        status: 'TERJADWAL'
      },
      include: {
        kandang: true
      }
    })

    return NextResponse.json(
      { message: 'Jadwal vaksin berhasil ditambahkan', jadwalVaksin },
      { status: 201 }
    )
  } catch (error) {
    console.error('Create jadwal vaksin error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}
