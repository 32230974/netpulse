import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { auth } from '@/auth'

function buildUsageTitle(threshold: number) {
  return `Data Usage Alert - ${threshold}%`
}

function buildUsageMessage(customerName: string, bundleNameOrPlanName: string, usedGb: number, capGb: number, threshold: number) {
  return `Hi ${customerName}, you have used ${usedGb.toFixed(1)}GB of ${capGb.toFixed(1)}GB on your ${bundleNameOrPlanName} internet service. You are now at ${threshold}% of your data allowance.`
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user || !['ADMIN', 'EMPLOYEE'].includes(session.user.role || '')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json().catch(() => ({}))
    const threshold = Number(body.threshold) === 100 ? 100 : 50
    const now = new Date()

    const subscriptions = await prisma.subscription.findMany({
      where: {
        status: 'ACTIVE',
        dataCapGb: { gt: 0 },
      },
      include: {
        customer: { include: { user: true } },
        plan: true,
        bundle: true,
      },
    })

    const matches = subscriptions.filter((subscription) => {
      const usagePercent = (subscription.dataUsedGb / subscription.dataCapGb) * 100
      if (threshold === 100) return usagePercent >= 100
      return usagePercent >= 50 && usagePercent < 100
    })

    const results: Array<{ customerId: string; name: string; notificationId: string }> = []
    const title = buildUsageTitle(threshold)

    for (const sub of matches) {
      const customerName = `${sub.customer.firstName} ${sub.customer.lastName}`
      const bundleNameOrPlanName = sub.bundle?.name || sub.plan.name
      const existing = await prisma.notification.findFirst({
        where: {
          userId: sub.customer.userId,
          title,
          createdAt: { gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) },
        },
      })

      if (existing) continue

      const notification = await prisma.notification.create({
        data: {
          userId: sub.customer.userId,
          title,
          message: buildUsageMessage(customerName, bundleNameOrPlanName, sub.dataUsedGb, sub.dataCapGb, threshold),
          type: threshold === 100 ? 'error' : 'warning',
        },
      })

      results.push({ customerId: sub.customer.id, name: customerName, notificationId: notification.id })
    }

    return NextResponse.json({
      success: true,
      threshold,
      processed: matches.length,
      sent: results.length,
      details: results,
    })
  } catch (error) {
    console.error('Failed to send usage notifications:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
