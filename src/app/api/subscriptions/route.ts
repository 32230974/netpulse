import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { auth } from '@/auth'

export async function GET() {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id: userId, role } = session.user

  try {
    const where = role === 'CUSTOMER' 
      ? { customer: { userId } } 
      : {}

    const subscriptions = await prisma.subscription.findMany({
      where,
      include: {
        plan: true,
        bundle: true,
        customer: { select: { firstName: true, lastName: true } },
      },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(subscriptions)
  } catch (error) {
    console.error('Failed to fetch subscriptions:', error)
    return NextResponse.json({ error: 'Failed to fetch subscriptions' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const subscription = await prisma.subscription.create({
      data: {
        customerId: body.customerId,
        planId: body.planId,
        bundleId: body.bundleId || undefined,
        status: 'ACTIVE',
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        autoRenew: body.autoRenew ?? true,
        dataCapGb: body.dataCapGb ?? 0,
        dataUsedGb: body.dataUsedGb ?? 0,
      },
      include: { plan: true, bundle: true },
    })
    return NextResponse.json(subscription, { status: 201 })
  } catch (error) {
    console.error('Failed to create subscription:', error)
    return NextResponse.json({ error: 'Failed to create subscription' }, { status: 500 })
  }
}
