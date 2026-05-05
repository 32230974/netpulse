import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { auth } from '@/auth'

export async function GET() {
  const session = await auth()
  if (!session?.user || !['ADMIN', 'EMPLOYEE'].includes(session.user.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const riskScores = await prisma.riskScore.findMany({
      include: {
        customer: { select: { id: true, firstName: true, lastName: true } },
      },
      orderBy: { calculatedAt: 'desc' },
    })

    // Deduplicate by customer (keep latest)
    const seen = new Set<string>()
    const uniqueScores = riskScores.filter(rs => {
      if (seen.has(rs.customerId)) return false
      seen.add(rs.customerId)
      return true
    })

    const customers = uniqueScores.map(rs => {
      let parsedFactors: string[] = []
      try {
        parsedFactors = JSON.parse(rs.factors as string)
      } catch {
        parsedFactors = typeof rs.factors === 'string' ? rs.factors.split(',').filter(Boolean) : []
      }
      return {
        id: rs.customer.id,
        firstName: rs.customer.firstName,
        lastName: rs.customer.lastName,
        score: rs.score,
        level: rs.level,
        factors: parsedFactors,
      }
    })

    return NextResponse.json({ customers })
  } catch (error) {
    console.error('Failed to fetch churn data:', error)
    return NextResponse.json({ customers: [] })
  }
}

export async function POST() {
  const session = await auth()
  if (!session?.user || !['ADMIN', 'EMPLOYEE'].includes(session.user.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const customers = await prisma.customer.findMany({
      include: {
        subscriptions: { include: { plan: true }, orderBy: { createdAt: 'desc' }, take: 1 },
        invoices: { orderBy: { createdAt: 'desc' }, take: 6 },
      },
    })

    for (const customer of customers) {
      let score = 0
      const factors: string[] = []

      // Factor 1: Late payments
      const overdueInvoices = customer.invoices.filter(i => i.status === 'OVERDUE')
      const unpaidInvoices = customer.invoices.filter(i => i.status === 'UNPAID')
      if (overdueInvoices.length > 0) {
        score += overdueInvoices.length * 15
        factors.push(`${overdueInvoices.length} overdue invoice(s)`)
      }
      if (unpaidInvoices.length > 2) {
        score += 10
        factors.push('Multiple unpaid invoices')
      }

      // Factor 2: Inactive status
      if (customer.status === 'INACTIVE') {
        score += 25
        factors.push('Account inactive')
      }

      // Factor 3: Subscription status
      const activeSub = customer.subscriptions[0]
      if (!activeSub || activeSub.status !== 'ACTIVE') {
        score += 20
        factors.push('No active subscription')
      }

      // Factor 4: Subscription end approaching
      if (activeSub && activeSub.endDate) {
        const daysUntilEnd = Math.ceil((new Date(activeSub.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
        if (daysUntilEnd < 7 && daysUntilEnd > 0) {
          score += 10
          factors.push('Subscription expiring soon')
        }
        if (daysUntilEnd <= 0) {
          score += 20
          factors.push('Subscription expired')
        }
      }

      // Factor 5: Low tier plan (more likely to churn)
      if (activeSub?.plan?.name === 'Basic') {
        score += 5
        factors.push('Basic plan subscriber')
      }

      // Add some randomness for realistic demo
      score += Math.floor(Math.random() * 10)
      score = Math.min(100, Math.max(0, score))

      const level = score <= 33 ? 'LOW' : score <= 66 ? 'MEDIUM' : 'HIGH'

      if (factors.length === 0) {
        factors.push('Good standing')
      }

      await prisma.riskScore.create({
        data: {
          customerId: customer.id,
          score,
          level: level as 'LOW' | 'MEDIUM' | 'HIGH',
          factors: JSON.stringify(factors),
        },
      })
    }

    return NextResponse.json({ success: true, analyzed: customers.length })
  } catch (error) {
    console.error('Churn analysis error:', error)
    return NextResponse.json({ error: 'Failed to run churn analysis' }, { status: 500 })
  }
}
