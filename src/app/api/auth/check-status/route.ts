import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const { email } = await req.json()

    if (!email) {
      return NextResponse.json({ suspended: false })
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, role: true },
    })

    if (!user || user.role !== 'CUSTOMER') {
      return NextResponse.json({ suspended: false })
    }

    const customer = await prisma.customer.findUnique({
      where: { userId: user.id },
      select: { status: true },
    })

    return NextResponse.json({
      suspended: customer?.status === 'SUSPENDED',
    })
  } catch {
    return NextResponse.json({ suspended: false })
  }
}
