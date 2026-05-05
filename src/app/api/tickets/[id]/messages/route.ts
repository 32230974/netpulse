import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { auth } from '@/auth'

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const message = await prisma.ticketMessage.create({
      data: {
        ticketId: id,
        senderId: session.user.id,
        content: body.content,
        isAiGenerated: body.isAiGenerated || false,
      },
      include: {
        sender: { select: { name: true, role: true } },
      },
    })

    // Update ticket status to IN_PROGRESS if it's OPEN
    const ticket = await prisma.ticket.findUnique({ where: { id } })
    if (ticket?.status === 'OPEN') {
      await prisma.ticket.update({
        where: { id },
        data: { status: 'IN_PROGRESS' },
      })
    }

    return NextResponse.json(message, { status: 201 })
  } catch (error) {
    console.error('Failed to send message:', error)
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
  }
}
