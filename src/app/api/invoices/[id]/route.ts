import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const body = await req.json()

    const updateData: Record<string, unknown> = {}
    if (body.status) updateData.status = body.status

    const invoice = await prisma.invoice.update({
      where: { id },
      data: updateData,
    })

    // If marked as paid, create a payment record
    if (body.status === 'PAID') {
      await prisma.payment.create({
        data: {
          invoiceId: id,
          amount: invoice.total,
          method: 'card',
          paidAt: new Date(),
        },
      })
    }

    return NextResponse.json(invoice)
  } catch (error) {
    console.error('Failed to update invoice:', error)
    return NextResponse.json({ error: 'Failed to update invoice' }, { status: 500 })
  }
}
