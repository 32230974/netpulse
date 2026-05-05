import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { auth } from '@/auth'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    let notifications = []
    try {
      notifications = await (prisma as any).notification.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: 'desc' },
        take: 20,
      })
    } catch (e) {
      // Fallback to raw query
      notifications = await prisma.$queryRawUnsafe(
        `SELECT * FROM Notification WHERE userId = ? ORDER BY createdAt DESC LIMIT 20`,
        session.user.id
      )
      // Normalize raw results (boolean handling for SQLite)
      notifications = (notifications as any).map((n: any) => ({
        ...n,
        isRead: n.isRead === 1 || n.isRead === true
      }))
    }

    return NextResponse.json(notifications)
  } catch (error) {
    console.error('Failed to fetch notifications:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function PUT(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id } = await req.json()
    
    try {
      if (id) {
        await (prisma as any).notification.update({
          where: { id, userId: session.user.id },
          data: { isRead: true },
        })
      } else {
        await (prisma as any).notification.updateMany({
          where: { userId: session.user.id, isRead: false },
          data: { isRead: true },
        })
      }
    } catch (e) {
      // Fallback to raw update
      if (id) {
        await prisma.$executeRawUnsafe(
          `UPDATE Notification SET isRead = 1 WHERE id = ? AND userId = ?`,
          id, session.user.id
        )
      } else {
        await prisma.$executeRawUnsafe(
          `UPDATE Notification SET isRead = 1 WHERE userId = ? AND isRead = 0`,
          session.user.id
        )
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to update notification:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
