import type { NextAuthConfig } from "next-auth"

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const isPublicPage = ['/', '/login', '/register'].includes(nextUrl.pathname)

      if (!isPublicPage && !isLoggedIn) {
        return false // Redirect to login
      }
      
      if (isPublicPage && isLoggedIn) {
        return Response.redirect(new URL('/dashboard', nextUrl))
      }

      return true
    },
  },
  providers: [], // Add providers in auth.ts
} satisfies NextAuthConfig
