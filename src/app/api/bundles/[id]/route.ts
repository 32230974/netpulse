import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { auth } from '@/auth'

type RouteContext = {
  params: Promise<{ id: string }>
}

function isAdminRole(role?: string | null) {
  return role === 'ADMIN' || role === 'EMPLOYEE'
}

export async function PUT(req: Request, context: RouteContext) {
  const session = await auth()
  if (!session?.user || !isAdminRole(session.user.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id } = await context.params
    const body = await req.json()
    const plans = Array.isArray(body.plans) ? body.plans : []

    const bundle = await prisma.bundle.update({
      where: { id },
      data: {
        name: body.name,
        description: body.description,
        discount: Number(body.discount) || 0,
        totalPrice: Number(body.totalPrice) || 0,
        plans: JSON.stringify(plans),
        isActive: body.isActive ?? true,
      },
    })

    return NextResponse.json(bundle)
  } catch (error) {
    console.error('Failed to update bundle:', error)
    return NextResponse.json({ error: 'Failed to update bundle' }, { status: 500 })
  }
}

export async function DELETE(_req: Request, context: RouteContext) {
  const session = await auth()
  if (!session?.user || !isAdminRole(session.user.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id } = await context.params

    await prisma.bundle.delete({
      where: { id },
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Failed to delete bundle:', error)
    return NextResponse.json({ error: 'Failed to delete bundle' }, { status: 500 })
  }
}
