import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const customer = await prisma.customer.findUnique({
      where: { id },
      include: {
        user: { select: { email: true, role: true } },
        subscriptions: {
          include: { plan: true },
          orderBy: { createdAt: 'desc' },
        },
        invoices: {
          include: { payments: true },
          orderBy: { createdAt: 'desc' },
        },
        riskScores: {
          orderBy: { calculatedAt: 'desc' },
          take: 1,
        },
      },
    })

    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
    }

    return NextResponse.json(customer)
  } catch (error) {
    console.error('Failed to fetch customer:', error)
    return NextResponse.json({ error: 'Failed to fetch customer' }, { status: 500 })
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const body = await req.json()
    const customer = await prisma.customer.update({
      where: { id },
      data: {
        firstName: body.firstName,
        lastName: body.lastName,
        phone: body.phone,
        address: body.address,
        city: body.city,
        status: body.status,
      },
    })
    return NextResponse.json(customer)
  } catch (error) {
    console.error('Failed to update customer:', error)
    return NextResponse.json({ error: 'Failed to update customer' }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const customer = await prisma.customer.findUnique({ where: { id } })
    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
    }

    await prisma.customer.delete({ where: { id } })
    await prisma.user.delete({ where: { id: customer.userId } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete customer:', error)
    return NextResponse.json({ error: 'Failed to delete customer' }, { status: 500 })
  }
}
