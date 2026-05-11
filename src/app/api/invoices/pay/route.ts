import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { auth } from '@/auth'

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { invoiceId } = body

    if (!invoiceId) {
      return NextResponse.json({ error: 'Invoice ID is required' }, { status: 400 })
    }

    // Find the invoice
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        customer: true,
      },
    })

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
    }

    // For customers, verify they own this invoice
    if (session.user.role === 'CUSTOMER') {
      const customer = await prisma.customer.findUnique({
        where: { userId: session.user.id },
      })
      if (!customer || invoice.customerId !== customer.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
      }
    }

    if (invoice.status === 'PAID') {
      return NextResponse.json({ error: 'Invoice is already paid' }, { status: 400 })
    }

    // Mark invoice as paid
    await prisma.invoice.update({
      where: { id: invoiceId },
      data: { status: 'PAID' },
    })

    // Create payment record
    await prisma.payment.create({
      data: {
        invoiceId,
        amount: invoice.total,
        method: 'card',
        paidAt: new Date(),
      },
    })

    // Recalculate risk score for this customer
    const unpaidCount = await prisma.invoice.count({
      where: { customerId: invoice.customerId, status: { in: ['UNPAID', 'OVERDUE'] } },
    })

    // Update risk score if one exists
    const latestRisk = await prisma.riskScore.findFirst({
      where: { customerId: invoice.customerId },
      orderBy: { calculatedAt: 'desc' },
    })

    if (latestRisk) {
      // Reduce the score based on payment (fewer unpaid = lower risk)
      const newScore = Math.max(0, Math.min(100, unpaidCount * 20))
      const newLevel = newScore >= 70 ? 'HIGH' : newScore >= 40 ? 'MEDIUM' : 'LOW'

      await prisma.riskScore.create({
        data: {
          customerId: invoice.customerId,
          score: newScore,
          level: newLevel,
          factors: JSON.stringify({
            unpaidInvoices: unpaidCount,
            paidInvoice: invoiceId,
            previousScore: latestRisk.score,
            reason: 'Score updated after invoice payment',
          }),
        },
      })
    }

    // Create a success notification
    await prisma.notification.create({
      data: {
        userId: invoice.customer.userId,
        title: 'Payment Received',
        message: `Your payment of $${invoice.total.toFixed(2)} for "${invoice.description}" has been processed successfully.`,
        type: 'success',
      },
    })

    return NextResponse.json({
      success: true,
      invoiceId,
      amount: invoice.total,
      newUnpaidCount: unpaidCount,
    })
  } catch (error) {
    console.error('Invoice payment error:', error)
    return NextResponse.json({ error: 'Failed to process payment' }, { status: 500 })
  }
}
