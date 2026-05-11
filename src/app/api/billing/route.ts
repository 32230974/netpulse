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
    if (role === 'CUSTOMER') {
      // Get customer by userId first
      const customer = await prisma.customer.findUnique({
        where: { userId },
      })

      if (!customer) {
        // No billing info if no customer record
        return NextResponse.json([])
      }

      const billingInfo = await prisma.billingInformation.findMany({
        where: { customerId: customer.id },
        include: {
          customer: {
            select: {
              firstName: true,
              lastName: true,
              id: true,
            }
          }
        },
        orderBy: { createdAt: 'desc' },
      })
      return NextResponse.json(billingInfo)
    } else {
      // Admin/Employee can see all
      const billingInfo = await prisma.billingInformation.findMany({
      include: {
        customer: {
          select: {
            firstName: true,
            lastName: true,
            id: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      })
      return NextResponse.json(billingInfo)
    }
  } catch (error) {
    console.error('Failed to fetch billing information:', error)
    return NextResponse.json({ error: 'Failed to fetch billing information', details: String(error) }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { id: userId } = session.user

    // Get the customer
    const customer = await prisma.customer.findUnique({
      where: { userId },
    })

    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
    }

    // Check if billing info already exists
    const existing = await prisma.billingInformation.findUnique({
      where: { customerId: customer.id },
    })

    if (existing) {
      // Update existing
      const updated = await prisma.billingInformation.update({
        where: { customerId: customer.id },
        data: {
          billingAddress: body.billingAddress,
          billingCity: body.billingCity,
          billingState: body.billingState,
          billingZipCode: body.billingZipCode,
          billingCountry: body.billingCountry || 'United States',
          paymentMethod: body.paymentMethod,
          cardHolderName: body.cardHolderName,
          cardLastFour: body.cardLastFour,
          cardExpiry: body.cardExpiry,
          bankAccountHolderName: body.bankAccountHolderName,
          bankAccountLastFour: body.bankAccountLastFour,
          bankRoutingNumber: body.bankRoutingNumber,
          taxId: body.taxId,
          businessName: body.businessName,
        },
      })
      return NextResponse.json(updated)
    }

    // Create new
    const billing = await prisma.billingInformation.create({
      data: {
        customerId: customer.id,
        billingAddress: body.billingAddress,
        billingCity: body.billingCity,
        billingState: body.billingState,
        billingZipCode: body.billingZipCode,
        billingCountry: body.billingCountry || 'United States',
        paymentMethod: body.paymentMethod,
        cardHolderName: body.cardHolderName,
        cardLastFour: body.cardLastFour,
        cardExpiry: body.cardExpiry,
        bankAccountHolderName: body.bankAccountHolderName,
        bankAccountLastFour: body.bankAccountLastFour,
        bankRoutingNumber: body.bankRoutingNumber,
        taxId: body.taxId,
        businessName: body.businessName,
        isDefault: true,
      },
    })
    return NextResponse.json(billing, { status: 201 })
  } catch (error) {
    console.error('Failed to create/update billing information:', error)
    return NextResponse.json({ error: 'Failed to save billing information' }, { status: 500 })
  }
}
