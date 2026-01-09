import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET all role permissions
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const role = searchParams.get('role')

    const where: any = {}
    if (role) {
      where.role = role
    }

    const permissions = await db.rolePermission.findMany({
      where,
      orderBy: [
        { role: 'asc' },
        { fitur: 'asc' }
      ]
    })

    // Group by role
    const groupedPermissions = permissions.reduce((acc: any, perm) => {
      if (!acc[perm.role]) {
        acc[perm.role] = []
      }
      acc[perm.role].push(perm)
      return acc
    }, {})

    return NextResponse.json({
      permissions,
      groupedPermissions
    })
  } catch (error) {
    console.error('Get role permissions error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}

// POST create/update role permission
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { role, fitur, bisaAkses } = body

    // Validate input
    if (!role || !fitur) {
      return NextResponse.json(
        { error: 'Role dan fitur wajib diisi' },
        { status: 400 }
      )
    }

    // Check if permission exists
    const existingPermission = await db.rolePermission.findUnique({
      where: {
        role_fitur: {
          role,
          fitur
        }
      }
    })

    let permission
    if (existingPermission) {
      // Update existing
      permission = await db.rolePermission.update({
        where: {
          role_fitur: {
            role,
            fitur
          }
        },
        data: {
          bisaAkses: typeof bisaAkses === 'boolean' ? bisaAkses : true
        }
      })
    } else {
      // Create new
      permission = await db.rolePermission.create({
        data: {
          role,
          fitur,
          bisaAkses: typeof bisaAkses === 'boolean' ? bisaAkses : true
        }
      })
    }

    return NextResponse.json({
      message: 'Permission berhasil disimpan',
      permission
    })
  } catch (error) {
    console.error('Create role permission error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}

// Initialize default permissions
export async function PUT(request: NextRequest) {
  try {
    const roles = ['SUPER_USER', 'ADMIN', 'PETUGAS', 'PIMPINAN']
    const fiturList = [
      'dashboard', 'users', 'kandang', 'stok', 'data-harian',
      'nutrisi', 'telur', 'kesehatan', 'penjualan', 'keuangan',
      'laporan', 'ai-analysis', 'pengaturan'
    ]

    // SUPER_USER has all access
    for (const fitur of fiturList) {
      await db.rolePermission.upsert({
        where: {
          role_fitur: {
            role: 'SUPER_USER',
            fitur
          }
        },
        create: {
          role: 'SUPER_USER',
          fitur,
          bisaAkses: true
        },
        update: {
          bisaAkses: true
        }
      })
    }

    // ADMIN has most access except pengaturan
    for (const fitur of fiturList) {
      await db.rolePermission.upsert({
        where: {
          role_fitur: {
            role: 'ADMIN',
            fitur
          }
        },
        create: {
          role: 'ADMIN',
          fitur,
          bisaAkses: fitur !== 'pengaturan'
        },
        update: {
          bisaAkses: fitur !== 'pengaturan'
        }
      })
    }

    // PETUGAS has limited access
    const petugasAccess = ['data-harian', 'stok', 'kesehatan']
    for (const fitur of fiturList) {
      await db.rolePermission.upsert({
        where: {
          role_fitur: {
            role: 'PETUGAS',
            fitur
          }
        },
        create: {
          role: 'PETUGAS',
          fitur,
          bisaAkses: petugasAccess.includes(fitur)
        },
        update: {
          bisaAkses: petugasAccess.includes(fitur)
        }
      })
    }

    // PIMPINAN has read-only access to reports and AI analysis
    const pimpinanAccess = ['dashboard', 'laporan', 'ai-analysis']
    for (const fitur of fiturList) {
      await db.rolePermission.upsert({
        where: {
          role_fitur: {
            role: 'PIMPINAN',
            fitur
          }
        },
        create: {
          role: 'PIMPINAN',
          fitur,
          bisaAkses: pimpinanAccess.includes(fitur)
        },
        update: {
          bisaAkses: pimpinanAccess.includes(fitur)
        }
      })
    }

    return NextResponse.json({
      message: 'Default permissions berhasil diinisialisasi'
    })
  } catch (error) {
    console.error('Initialize permissions error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}
