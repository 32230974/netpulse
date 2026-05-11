import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { auth } from '@/auth'

export async function GET() {
  const session = await auth()
  if (!session?.user || session.user.role !== 'CUSTOMER') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const userId = session.user.id

  try {
    const customer = await prisma.customer.findUnique({
      where: { userId },
      include: {
        subscriptions: {
          include: { plan: true },
          where: { status: 'ACTIVE' },
          take: 1,
        },
        invoices: {
          orderBy: { dueDate: 'desc' },
          take: 5,
        },
        _count: {
          select: { subscriptions: true, invoices: true }
        }
      }
    })

    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
    }

    const tickets = await prisma.ticket.findMany({
      where: { creatorId: userId },
      orderBy: { updatedAt: 'desc' },
      take: 5,
    })

    const unpaidInvoices = await prisma.invoice.count({
      where: { customerId: customer.id, status: 'UNPAID' }
    })

    const activeSub = customer.subscriptions[0] || null

    return NextResponse.json({
      activeSubscription: activeSub,
      dataCapGb: activeSub?.dataCapGb ?? 0,
      dataUsedGb: activeSub?.dataUsedGb ?? 0,
      unpaidInvoices,
      totalTickets: tickets.length,
      recentInvoices: customer.invoices,
      recentTickets: tickets,
    })
  } catch (error) {
    console.error('Failed to fetch customer dashboard stats:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
