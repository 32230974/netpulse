import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const plans = await prisma.plan.findMany({
      where: { isActive: true },
      orderBy: { price: 'asc' },
    })
    return NextResponse.json(plans)
  } catch (error) {
    console.error('Failed to fetch plans:', error)
    return NextResponse.json({ error: 'Failed to fetch plans' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const plan = await prisma.plan.create({
      data: {
        name: body.name,
        description: body.description,
        price: body.price,
        speed: body.speed,
        features: body.features,
      },
    })
    return NextResponse.json(plan, { status: 201 })
  } catch (error) {
    console.error('Failed to create plan:', error)
    return NextResponse.json({ error: 'Failed to create plan' }, { status: 500 })
  }
}
