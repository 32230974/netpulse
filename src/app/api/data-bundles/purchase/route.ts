import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { auth } from '@/auth'
import { checkAndSendUsageNotifications } from '@/lib/usage-notifications'

export async function GET() {
  try {
    const bundles = await prisma.dataBundle.findMany({
      where: { isActive: true },
      orderBy: { dataGb: 'asc' }
    })
    return NextResponse.json(bundles)
  } catch (error) {
    console.error('Failed to fetch data bundles:', error)
    return NextResponse.json({ error: 'Failed to fetch data bundles' }, { status: 500 })
  }
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
    const { bundleId } = body

    const bundle = await prisma.dataBundle.findUnique({
      where: { id: bundleId, isActive: true }
    })

    if (!bundle) {
      return NextResponse.json({ error: 'Invalid data bundle' }, { status: 400 })
    }

    // Use offerPrice if available, otherwise use regular price
    const actualPrice = bundle.offerPrice ?? bundle.price

    // Find the customer and their active subscription
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
          dataCapGb: 0, // Start at 0, recharge will add to it
          dataUsedGb: 0,
          startDate: new Date(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        }
      })
    }

    // Recharge Logic:
    // 1. If customer has used data, reduce the "used" amount first (effectively giving back data)
    // 2. If they have 0 used data, increase their "cap" (giving them more total data)
    
    let updatedSub;
    if (activeSub.dataUsedGb > 0) {
      const reduction = Math.min(activeSub.dataUsedGb, bundle.dataGb)
      const overflow = bundle.dataGb - reduction
      
      updatedSub = await prisma.subscription.update({
        where: { id: activeSub.id },
        data: {
          dataUsedGb: activeSub.dataUsedGb - reduction,
          dataCapGb: activeSub.dataCapGb + overflow
        },
      })
    } else {
      updatedSub = await prisma.subscription.update({
        where: { id: activeSub.id },
        data: {
          dataCapGb: activeSub.dataCapGb + bundle.dataGb
        },
      })
    }

    // Create a notification
    await prisma.notification.create({
      data: {
        userId,
        title: `${bundle.name} Activated!`,
        message: `You recharged ${bundle.dataGb} GB of data for $${actualPrice.toFixed(2)}. Your balance has been updated.`,
        type: 'success',
      },
    })

    // Automatically check and send 50%/100% usage notifications
    await checkAndSendUsageNotifications(updatedSub.id)

    return NextResponse.json({
      success: true,
      bundle: { id: bundle.id, name: bundle.name, dataGb: bundle.dataGb, price: actualPrice },
      dataUsedGb: updatedSub.dataUsedGb,
      dataCapGb: updatedSub.dataCapGb,
      dataRemainingGb: updatedSub.dataCapGb - updatedSub.dataUsedGb,
    })
  } catch (error) {
    console.error('Data recharge error:', error)
    return NextResponse.json({ error: 'Failed to process recharge' }, { status: 500 })
  }
}

