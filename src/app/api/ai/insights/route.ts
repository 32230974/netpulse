import { NextResponse } from 'next/server'
import { generateAIResponse } from '@/lib/ai/openai'
import prisma from '@/lib/prisma'
import { auth } from '@/auth'

export async function GET() {
  const session = await auth()
  if (!session?.user || !['ADMIN', 'EMPLOYEE'].includes(session.user.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const insights = await prisma.aIInsight.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
    })
    return NextResponse.json({ insights })
  } catch (error) {
    console.error('Failed to fetch insights:', error)
    return NextResponse.json({ insights: [] })
  }
}

export async function POST() {
  const session = await auth()
  if (!session?.user || !['ADMIN', 'EMPLOYEE'].includes(session.user.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    // Gather business data
    const [
      totalCustomers,
      activeCustomers,
      subscriptions,
      invoices,
      tickets,
      riskScores,
    ] = await Promise.all([
      prisma.customer.count(),
      prisma.customer.count({ where: { status: 'ACTIVE' } }),
      prisma.subscription.findMany({ include: { plan: true } }),
      prisma.invoice.findMany(),
      prisma.ticket.findMany(),
      prisma.riskScore.findMany({ orderBy: { calculatedAt: 'desc' } }),
    ])

    const paidRevenue = invoices.filter(i => i.status === 'PAID').reduce((sum, i) => sum + i.total, 0)
    const unpaidRevenue = invoices.filter(i => i.status !== 'PAID').reduce((sum, i) => sum + i.total, 0)
    const planCounts = subscriptions.reduce((acc, s) => {
      const name = s.plan?.name || 'Unknown'
      acc[name] = (acc[name] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const highRisk = riskScores.filter(r => r.level === 'HIGH').length
    const openTickets = tickets.filter(t => t.status !== 'CLOSED').length

    const businessContext = `
Business Data:
- Total Customers: ${totalCustomers} (${activeCustomers} active)
- Total Revenue Collected: $${paidRevenue.toFixed(2)}
- Outstanding Revenue: $${unpaidRevenue.toFixed(2)}
- Subscriptions by Plan: ${JSON.stringify(planCounts)}
- High Risk Churn Customers: ${highRisk}
- Open Support Tickets: ${openTickets}
- Total Tickets: ${tickets.length}
`

    const insights = [
      {
        type: 'revenue',
        prompt: `Based on this ISP business data, provide a brief revenue analysis and prediction for next month. ${businessContext}`,
      },
      {
        type: 'churn',
        prompt: `Based on this ISP business data, analyze churn risk and provide actionable recommendations. ${businessContext}`,
      },
      {
        type: 'growth',
        prompt: `Based on this ISP business data, identify growth opportunities and the most profitable plans. ${businessContext}`,
      },
      {
        type: 'recommendation',
        prompt: `Based on this ISP business data, provide 3 specific actionable recommendations to improve the business. ${businessContext}`,
      },
    ]

    const generatedInsights = []

    for (const insight of insights) {
      const content = await generateAIResponse(
        'You are a business analytics AI for an ISP company called NetPulse. Provide concise, data-driven insights. Keep responses under 150 words. Be specific with numbers when possible.',
        insight.prompt
      )

      const titles: Record<string, string> = {
        revenue: 'Revenue Analysis & Forecast',
        churn: 'Churn Risk Assessment',
        growth: 'Growth Opportunities',
        recommendation: 'Strategic Recommendations',
      }

      const created = await prisma.aIInsight.create({
        data: {
          type: insight.type,
          title: titles[insight.type] || 'Business Insight',
          content,
        },
      })

      generatedInsights.push(created)
    }

    return NextResponse.json({ insights: generatedInsights })
  } catch (error) {
    console.error('Failed to generate insights:', error)
    return NextResponse.json({ error: 'Failed to generate insights' }, { status: 500 })
  }
}
