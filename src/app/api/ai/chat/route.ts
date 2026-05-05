import { NextResponse } from 'next/server'
import { generateAIResponse } from '@/lib/ai/openai'
import { auth } from '@/auth'
import prisma from '@/lib/prisma'

const SYSTEM_PROMPT = `You are NetPulse AI, an intelligent customer support assistant for an Internet Service Provider (ISP) called NetPulse. 

Your responsibilities:
- Answer questions about subscription plans (Basic $29/mo 50Mbps, Standard $49/mo 100Mbps, Premium $99/mo 500Mbps)
- Help with billing inquiries and payment issues
- Troubleshoot basic internet connectivity problems
- Provide account information
- Guide users to create support tickets for complex issues

Be professional, friendly, and concise. If you don't know something specific about a customer's account, suggest they check their dashboard or create a support ticket.

Always respond in a helpful, empathetic tone. Keep responses under 200 words.`

export async function POST(req: Request) {
  try {
    const session = await auth()
    const body = await req.json()
    const { message, history = [] } = body

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    // Get customer context if available
    let customerContext = ''
    if (session?.user?.id) {
      try {
        const customer = await prisma.customer.findFirst({
          where: { userId: session.user.id },
          include: {
            subscriptions: { include: { plan: true }, take: 1, orderBy: { createdAt: 'desc' } },
            invoices: { take: 3, orderBy: { createdAt: 'desc' } },
          },
        })

        if (customer) {
          customerContext = `\n\nCustomer Context:
- Name: ${customer.firstName} ${customer.lastName}
- Status: ${customer.status}
- Current Plan: ${customer.subscriptions[0]?.plan?.name || 'None'}
- Plan Price: $${customer.subscriptions[0]?.plan?.price || 0}/mo
- Subscription Status: ${customer.subscriptions[0]?.status || 'No subscription'}
- Subscription Ends: ${customer.subscriptions[0]?.endDate || 'N/A'}
- Recent Invoices: ${customer.invoices.map(i => `$${i.total} (${i.status})`).join(', ') || 'None'}`
        }
      } catch (e) {
        console.error('Failed to fetch customer context:', e)
      }
    }

    const response = await generateAIResponse(
      SYSTEM_PROMPT + customerContext,
      message,
      history
    )

    // Store chat message if user is authenticated (non-blocking, don't let it fail the response)
    if (session?.user?.id) {
      try {
        // Verify user exists before saving, fallback to email
        let chatUserId = session.user.id
        const userExists = await prisma.user.findUnique({ where: { id: chatUserId } })
        if (!userExists && session.user.email) {
          const userByEmail = await prisma.user.findUnique({ where: { email: session.user.email } })
          if (userByEmail) chatUserId = userByEmail.id
        }
        if (userExists || chatUserId !== session.user.id) {
          await prisma.chatMessage.createMany({
            data: [
              { userId: chatUserId, role: 'user', content: message },
              { userId: chatUserId, role: 'assistant', content: response },
            ],
          })
        }
      } catch (e) {
        console.error('Failed to save chat messages (non-critical):', e)
      }
    }

    return NextResponse.json({ response })
  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json({
      response: 'I apologize, but I\'m having trouble processing your request right now. Please try again or create a support ticket for assistance.',
    })
  }
}
