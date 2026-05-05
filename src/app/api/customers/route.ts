import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

export async function GET() {
  try {
    const customers = await prisma.customer.findMany({
      include: {
        user: { select: { email: true, role: true } },
        subscriptions: {
          include: { plan: true },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
        riskScores: {
          orderBy: { calculatedAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(customers)
  } catch (error) {
    console.error('Failed to fetch customers:', error)
    return NextResponse.json({ error: 'Failed to fetch customers' }, { status: 500 })
  }
}

const createCustomerSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
  phone: z.string().min(1),
  address: z.string().min(1),
  city: z.string().min(1),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const parsed = createCustomerSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 })
    }

    const { email, password, firstName, lastName, phone, address, city, status } = parsed.data

    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) {
      return NextResponse.json({ error: 'Email already exists' }, { status: 409 })
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    const customer = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: { name: `${firstName} ${lastName}`, email, password: hashedPassword, role: 'CUSTOMER' },
      })
      return tx.customer.create({
        data: { userId: user.id, firstName, lastName, phone, address, city, status: status || 'ACTIVE' },
        include: { user: { select: { email: true } } },
      })
    })

    return NextResponse.json(customer, { status: 201 })
  } catch (error) {
    console.error('Failed to create customer:', error)
    return NextResponse.json({ error: 'Failed to create customer' }, { status: 500 })
  }
}
