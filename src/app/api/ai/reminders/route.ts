import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { auth } from '@/auth'
import { generateAIResponse } from '@/lib/ai/openai'

export async function POST() {
  const session = await auth()
  if (!session?.user || !['ADMIN', 'EMPLOYEE'].includes(session.user.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const now = new Date()
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)

    // Find active subscriptions ending in the next 7 days
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
          include: {
            user: true,
          },
        },
        plan: true,
      },
    })

    const results = []

    for (const sub of expiringSoon) {
      const customerName = `${sub.customer.firstName} ${sub.customer.lastName}`
      const planName = sub.plan.name
      const endDate = sub.endDate.toLocaleDateString()

      // Check if we already sent a reminder recently (using raw query as fallback)
      let existingNotification = null
      try {
        existingNotification = await (prisma as any).notification.findFirst({
          where: {
            userId: sub.customer.userId,
            title: 'Subscription Renewal Reminder',
            createdAt: { gte: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000) },
          },
        })
      } catch (e) {
        // Fallback to raw query if model not generated
        const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString()
        const rows: any = await prisma.$queryRawUnsafe(
          `SELECT id FROM Notification WHERE userId = ? AND title = ? AND createdAt >= ? LIMIT 1`,
          sub.customer.userId, 'Subscription Renewal Reminder', threeDaysAgo
        )
        if (rows.length > 0) existingNotification = rows[0]
      }

      if (existingNotification) continue

      const prompt = `Generate a short, urgent but professional renewal reminder for an ISP customer.
Customer: ${customerName}
Plan: ${planName}
Expiry Date: ${endDate}

The message should warn them that their internet service will be disconnected if they don't renew. Keep it under 60 words.`

      const aiMessage = await generateAIResponse(
        "You are an automated ISP billing assistant. Your goal is to help customers keep their service active by reminding them to renew.",
        prompt
      )

      try {
        // Try standard prisma create
        const notification = await (prisma as any).notification.create({
          data: {
            userId: sub.customer.userId,
            title: 'Subscription Renewal Reminder',
            message: aiMessage,
            type: 'warning',
          },
        })
        results.push({ customerId: sub.customer.id, name: customerName, notificationId: notification.id })
      } catch (e) {
        // Fallback to raw insert
        const id = `notif_${Math.random().toString(36).substr(2, 9)}`
        await prisma.$executeRawUnsafe(
          `INSERT INTO Notification (id, userId, title, message, type, isRead, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)`,
          id, sub.customer.userId, 'Subscription Renewal Reminder', aiMessage, 'warning', 0, new Date().toISOString()
        )
        results.push({ customerId: sub.customer.id, name: customerName, notificationId: id })
      }
    }

    return NextResponse.json({ 
      success: true, 
      processed: expiringSoon.length, 
      sent: results.length,
      details: results
    })
  } catch (error) {
    console.error('Failed to process renewal reminders:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
