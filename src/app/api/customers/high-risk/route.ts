import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { auth } from '@/auth'

// GET: List all customers with risk > 87%
export async function GET() {
  const session = await auth()
  if (!session?.user || !['ADMIN', 'EMPLOYEE'].includes(session.user.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Find customers with their latest risk score > 87
    const customers = await prisma.customer.findMany({
      where: { status: { not: 'SUSPENDED' } },
      include: {
        user: { select: { email: true, name: true } },
        riskScores: {
          orderBy: { calculatedAt: 'desc' },
          take: 1,
        },
        subscriptions: {
          include: { plan: true },
          where: { status: 'ACTIVE' },
          take: 1,
        },
      },
    })

    const highRiskCustomers = customers.filter(
      (c) => c.riskScores[0] && c.riskScores[0].score > 87
    )

    return NextResponse.json({
      customers: highRiskCustomers.map((c) => ({
        id: c.id,
        firstName: c.firstName,
        lastName: c.lastName,
        email: c.user.email,
        status: c.status,
        riskScore: c.riskScores[0]?.score || 0,
        riskLevel: c.riskScores[0]?.level || 'UNKNOWN',
        plan: c.subscriptions[0]?.plan?.name || 'No Plan',
      })),
      count: highRiskCustomers.length,
    })
  } catch (error) {
    console.error('Failed to fetch high-risk customers:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST: Suspend all customers with risk > 87% (or a specific one)
export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user || !['ADMIN', 'EMPLOYEE'].includes(session.user.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { customerId } = body // optional: suspend a specific customer

    let suspendedCount = 0

    if (customerId) {
      // Suspend a specific customer
      const customer = await prisma.customer.findUnique({
        where: { id: customerId },
        include: {
          riskScores: { orderBy: { calculatedAt: 'desc' }, take: 1 },
        },
      })

      if (!customer) {
        return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
      }

      if (!customer.riskScores[0] || customer.riskScores[0].score <= 87) {
        return NextResponse.json({
          error: 'Customer risk score is not above 87%. Cannot suspend.',
        }, { status: 400 })
      }

      await prisma.customer.update({
        where: { id: customerId },
        data: { status: 'SUSPENDED' },
      })

      // Cancel active subscriptions
      await prisma.subscription.updateMany({
        where: { customerId, status: 'ACTIVE' },
        data: { status: 'CANCELLED' },
      })

      // Create notification
      await prisma.notification.create({
        data: {
          userId: customer.userId,
          title: 'Account Suspended',
          message: `Your account has been suspended because your churn risk score (${customer.riskScores[0].score}%) exceeded the 87% threshold. Please contact support for assistance.`,
          type: 'error',
        },
      })

      suspendedCount = 1
    } else {
      // Suspend ALL customers with risk > 87%
      const highRiskCustomers = await prisma.customer.findMany({
        where: { status: { not: 'SUSPENDED' } },
        include: {
          riskScores: { orderBy: { calculatedAt: 'desc' }, take: 1 },
        },
      })

      const toSuspend = highRiskCustomers.filter(
        (c) => c.riskScores[0] && c.riskScores[0].score > 87
      )

      for (const customer of toSuspend) {
        await prisma.customer.update({
          where: { id: customer.id },
          data: { status: 'SUSPENDED' },
        })

        await prisma.subscription.updateMany({
          where: { customerId: customer.id, status: 'ACTIVE' },
          data: { status: 'CANCELLED' },
        })

        await prisma.notification.create({
          data: {
            userId: customer.userId,
            title: 'Account Suspended',
            message: `Your account has been suspended because your churn risk score (${customer.riskScores[0].score}%) exceeded the 87% threshold.`,
            type: 'error',
          },
        })
      }

      suspendedCount = toSuspend.length
    }

    return NextResponse.json({
      success: true,
      suspendedCount,
      message: `${suspendedCount} customer(s) have been suspended.`,
    })
  } catch (error) {
    console.error('Failed to suspend customers:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
