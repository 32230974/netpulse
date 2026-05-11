import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { auth } from '@/auth'
import { checkAndSendUsageNotifications } from '@/lib/usage-notifications'

// The marketplace items customers can "buy" with their data
const MARKETPLACE_ITEMS: Record<string, { name: string; dataCostGb: number; description: string }> = {
  ai_insights: {
    name: 'AI Performance Report',
    dataCostGb: 5,
    description: 'Unlock a personalized AI performance report for your connection',
  },
  priority_support: {
    name: 'Priority Support',
    dataCostGb: 10,
    description: 'Move your next support ticket to the front of the queue',
  },
  speed_boost: {
    name: 'Turbo Speed Boost',
    dataCostGb: 20,
    description: 'Unlock 1Gbps speeds for 24 hours',
  },
  extra_device: {
    name: 'Extra Device Slot',
    dataCostGb: 8,
    description: 'Add an extra device to your connection',
  },
}

export async function GET() {
  // Return the catalogue of marketplace items
  const items = Object.entries(MARKETPLACE_ITEMS).map(([id, item]) => ({
    id,
    ...item,
  }))
  return NextResponse.json(items)
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user || session.user.role !== 'CUSTOMER') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const userId = session.user.id
  const email = session.user.email || ''

  // Validate domain (allow @netpulse.com or @gmail.com)
  const isAllowedDomain = email.endsWith('@netpulse.com') || email.endsWith('@gmail.com')
  if (!isAllowedDomain && process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'This feature is currently limited to specific domains.' }, { status: 403 })
  }

  try {
    const body = await req.json()
    const { itemId } = body

    if (!itemId || !MARKETPLACE_ITEMS[itemId]) {
      return NextResponse.json({ error: 'Invalid marketplace item' }, { status: 400 })
    }

    const item = MARKETPLACE_ITEMS[itemId]

    // Find the customer
    let customer = await prisma.customer.findUnique({
      where: { userId },
      include: {
        subscriptions: {
          where: { status: 'ACTIVE' },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    })

    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
    }

    let activeSub = customer.subscriptions[0]
    
    // If no active subscription, create a default "Basic" one
    if (!activeSub) {
      const basicPlan = await prisma.plan.findFirst({ where: { name: 'Basic' } })
      if (!basicPlan) {
        return NextResponse.json({ error: 'Base plan not found' }, { status: 500 })
      }

      activeSub = await prisma.subscription.create({
        data: {
          customerId: customer.id,
          planId: basicPlan.id,
          status: 'ACTIVE',
          dataCapGb: 0, 
          dataUsedGb: 0,
          startDate: new Date(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        }
      })
    }

    const remainingData = activeSub.dataCapGb - activeSub.dataUsedGb
    if (remainingData < item.dataCostGb) {
      return NextResponse.json(
        {
          error: `Not enough data. You need ${item.dataCostGb} GB but only have ${remainingData.toFixed(1)} GB remaining.`,
        },
        { status: 400 }
      )
    }

    // Deduct the data and save the unlocked feature
    const unlockedFeatures = JSON.parse(activeSub.unlockedFeatures || '[]')
    if (!unlockedFeatures.includes(itemId)) {
      unlockedFeatures.push(itemId)
    }

    await prisma.subscription.update({
      where: { id: activeSub.id },
      data: {
        dataUsedGb: activeSub.dataUsedGb + item.dataCostGb,
        unlockedFeatures: JSON.stringify(unlockedFeatures),
      },
    })

    // Create a notification for the customer
    await prisma.notification.create({
      data: {
        userId,
        title: `${item.name} Activated`,
        message: `You used ${item.dataCostGb} GB of data to unlock "${item.name}". Enjoy!`,
        type: 'success',
      },
    })

    // Automatically check and send 50%/100% usage notifications
    await checkAndSendUsageNotifications(activeSub.id)

    // Return updated data
    const updatedSub = await prisma.subscription.findUnique({
      where: { id: activeSub.id },
    })

    return NextResponse.json({
      success: true,
      item: { id: itemId, ...item },
      remainingData: updatedSub
        ? updatedSub.dataCapGb - updatedSub.dataUsedGb
        : remainingData - item.dataCostGb,
      dataUsedGb: updatedSub?.dataUsedGb ?? activeSub.dataUsedGb + item.dataCostGb,
      dataCapGb: activeSub.dataCapGb,
    })
  } catch (error) {
    console.error('Marketplace purchase error:', error)
    return NextResponse.json({ error: 'Failed to process purchase' }, { status: 500 })
  }
}
