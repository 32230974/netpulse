import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { auth } from '@/auth'

export async function GET() {
  const session = await auth()
  if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'EMPLOYEE')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const bundles = await prisma.dataBundle.findMany({
      orderBy: { dataGb: 'asc' }
    })
    return NextResponse.json(bundles)
  } catch (error) {
    console.error('Failed to fetch data bundles for admin:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'EMPLOYEE')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { bundleId, offerPrice } = body

    if (!bundleId) {
      return NextResponse.json({ error: 'Bundle ID is required' }, { status: 400 })
    }

    const updatedBundle = await prisma.dataBundle.update({
      where: { id: bundleId },
      data: {
        offerPrice: offerPrice === null ? null : parseFloat(offerPrice),
      }
    })

    return NextResponse.json({
      success: true,
      bundle: updatedBundle
    })
  } catch (error) {
    console.error('Failed to update data bundle offer:', error)
    return NextResponse.json({ error: 'Failed to update offer' }, { status: 500 })
  }
}
