import { NextResponse } from 'next/server'
import { generateAIResponse } from '@/lib/ai/openai'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { subject, description, messages = [] } = body

    const conversationHistory = messages.map((m: string) => `Previous message: ${m}`).join('\n')

    const prompt = `A customer has submitted a support ticket for an ISP (Internet Service Provider):

Subject: ${subject}
Description: ${description}
${conversationHistory ? `\nConversation History:\n${conversationHistory}` : ''}

Based on this ticket, suggest:
1. A professional response to the customer (2-3 sentences)
2. Step-by-step resolution steps (3-5 steps)

Format your response as a helpful reply that can be directly sent to the customer.`

    const suggestion = await generateAIResponse(
      'You are an expert ISP technical support agent for NetPulse. Provide helpful, professional, and empathetic responses. Include specific troubleshooting steps when dealing with technical issues. Keep responses concise and actionable.',
      prompt
    )

    return NextResponse.json({ suggestion })
  } catch (error) {
    console.error('AI suggestion error:', error)
    return NextResponse.json({
      suggestion: 'Thank you for reaching out. We understand your concern and our team is looking into this. In the meantime, please try restarting your router and checking all cable connections. If the issue persists, we will escalate this to our technical team for further investigation.',
    })
  }
}
