import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { auth } from '@/auth'

export async function GET() {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id: userId, role } = session.user

  try {
    const where = role === 'CUSTOMER' 
      ? { creatorId: userId } 
      : {}

    const tickets = await prisma.ticket.findMany({
      where,
      include: {
        creator: { select: { name: true, email: true, role: true } },
        messages: { select: { id: true } },
      },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(tickets)
  } catch (error) {
    console.error('Failed to fetch tickets:', error)
    return NextResponse.json({ error: 'Failed to fetch tickets' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify user exists, fallback to email lookup if ID doesn't match
    let userId = session.user.id
    const userById = await prisma.user.findUnique({ where: { id: userId } })
    if (!userById && session.user.email) {
      const userByEmail = await prisma.user.findUnique({ where: { email: session.user.email } })
      if (userByEmail) {
        userId = userByEmail.id
      } else {
        return NextResponse.json({ error: 'User not found' }, { status: 404 })
      }
    }

    const body = await req.json()
    const ticket = await prisma.ticket.create({
      data: {
        subject: body.subject,
        description: body.description,
        priority: body.priority || 'MEDIUM',
        creatorId: userId,
      },
      include: {
        creator: { select: { name: true, email: true } },
      },
    })
    return NextResponse.json(ticket, { status: 201 })
  } catch (error) {
    console.error('Failed to create ticket:', error)
    return NextResponse.json({ error: 'Failed to create ticket' }, { status: 500 })
  }
}
