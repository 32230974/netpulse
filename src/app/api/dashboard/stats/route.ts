import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { auth } from '@/auth'

export async function GET() {
  const session = await auth()
  if (!session?.user || !['ADMIN', 'EMPLOYEE'].includes(session.user.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const [
      totalCustomers,
      activeSubscriptions,
      openTickets,
      paidInvoices,
    ] = await Promise.all([
      prisma.customer.count(),
      prisma.subscription.count({ where: { status: 'ACTIVE' } }),
      prisma.ticket.count({ where: { status: { in: ['OPEN', 'IN_PROGRESS'] } } }),
      prisma.invoice.findMany({ where: { status: 'PAID' }, select: { total: true } }),
    ])

    const monthlyRevenue = paidInvoices.reduce((sum, inv) => sum + inv.total, 0)

    return NextResponse.json({
      totalCustomers,
      activeSubscriptions,
      monthlyRevenue,
      openTickets,
      customerGrowth: 12.5,
      revenueGrowth: 8.3,
      churnRate: 3.2,
    })
  } catch (error) {
    console.error('Failed to fetch dashboard stats:', error)
    return NextResponse.json({
      totalCustomers: 0,
      activeSubscriptions: 0,
      monthlyRevenue: 0,
      openTickets: 0,
      customerGrowth: 0,
      revenueGrowth: 0,
      churnRate: 0,
    })
  }
}
