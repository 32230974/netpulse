import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Get JWT token (Edge-compatible, no DB required)
  const token = await getToken({ 
    req, 
    secret: process.env.NEXTAUTH_SECRET 
  })

  const isLoggedIn = !!token
  const userRole = token?.role as string | undefined

  // Public routes
  const publicRoutes = ['/', '/login', '/register']
  if (publicRoutes.includes(pathname)) {
    if (isLoggedIn && (pathname === '/login' || pathname === '/register')) {
      return NextResponse.redirect(new URL('/dashboard', req.nextUrl))
    }
    return NextResponse.next()
  }

  // Protected routes - redirect to login if not authenticated
  if (!isLoggedIn) {
    return NextResponse.redirect(new URL('/login', req.nextUrl))
  }

  // Admin-only routes
  const adminRoutes = ['/ai-insights']
  if (adminRoutes.some(route => pathname.startsWith(route)) && userRole !== 'ADMIN') {
    return NextResponse.redirect(new URL('/dashboard', req.nextUrl))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
