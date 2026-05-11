import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { auth } from '@/auth'

export async function POST() {
  const session = await auth()
  if (!session?.user || !['ADMIN', 'EMPLOYEE'].includes(session.user.role || '')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const now = new Date()
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)

    const expiringSoon = await prisma.subscription.findMany({
      where: {
        status: 'ACTIVE',
        endDate: {
          lte: sevenDaysFromNow,
          gte: now,
        },
      },
      include: {
        customer: {
          include: { user: true },
        },
        plan: true,
        bundle: true,
      },
    })

    const results: Array<{ customerId: string; name: string; notificationId: string }> = []

    for (const sub of expiringSoon) {
      const customerName = `${sub.customer.firstName} ${sub.customer.lastName}`
      const title = 'Subscription Renewal Reminder'
      const message = `Hi ${customerName}, your ${sub.bundle?.name || sub.plan.name} internet subscription renews on ${sub.endDate.toLocaleDateString()}. Please renew soon to avoid interruption.`

      const recentNotification = await prisma.notification.findFirst({
        where: {
          userId: sub.customer.userId,
          title,
          createdAt: { gte: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000) },
        },
      })

      if (recentNotification) continue

      const notification = await prisma.notification.create({
        data: {
          userId: sub.customer.userId,
          title,
          message,
          type: 'warning',
        },
      })

      results.push({ customerId: sub.customer.id, name: customerName, notificationId: notification.id })
    }

    return NextResponse.json({
      success: true,
      processed: expiringSoon.length,
      sent: results.length,
      details: results,
    })
  } catch (error) {
    console.error('Failed to send renewal notifications:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
