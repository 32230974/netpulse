import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { auth } from '@/auth'

export async function GET() {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const isAdmin = session.user.role === 'ADMIN' || session.user.role === 'EMPLOYEE'

  try {
    const bundles = await prisma.bundle.findMany({
      where: isAdmin ? {} : { isActive: true },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(bundles)
  } catch (error) {
    console.error('Failed to fetch bundles:', error)
    return NextResponse.json({ error: 'Failed to fetch bundles' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user || !['ADMIN', 'EMPLOYEE'].includes(session.user.role || '')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const plans = Array.isArray(body.plans) ? body.plans : []

    const bundle = await prisma.bundle.create({
      data: {
        name: body.name,
        description: body.description,
        discount: Number(body.discount) || 0,
        totalPrice: Number(body.totalPrice) || 0,
        plans: JSON.stringify(plans),
        isActive: body.isActive ?? true,
      },
    })

    return NextResponse.json(bundle, { status: 201 })
  } catch (error) {
    console.error('Failed to create bundle:', error)
    return NextResponse.json({ error: 'Failed to create bundle' }, { status: 500 })
  }
}
