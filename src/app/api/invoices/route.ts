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
      ? { customer: { userId } } 
      : {}

    const invoices = await prisma.invoice.findMany({
      where,
      include: {
        customer: {
          include: { user: { select: { email: true } } },
        },
        payments: true,
      },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(invoices)
  } catch (error) {
    console.error('Failed to fetch invoices:', error)
    return NextResponse.json({ error: 'Failed to fetch invoices' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const invoice = await prisma.invoice.create({
      data: {
        customerId: body.customerId,
        amount: body.amount,
        tax: body.tax || 0,
        total: body.total || body.amount,
        description: body.description,
        dueDate: new Date(body.dueDate),
        status: 'UNPAID',
      },
    })
    return NextResponse.json(invoice, { status: 201 })
  } catch (error) {
    console.error('Failed to create invoice:', error)
    return NextResponse.json({ error: 'Failed to create invoice' }, { status: 500 })
  }
}
