import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import prisma from "@/lib/prisma"
import { authConfig } from "./auth.config"
import Credentials from "next-auth/providers/credentials"
import Google from "next-auth/providers/google"
import { z } from "zod"
import bcrypt from "bcryptjs"

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  debug: true,
  logger: {
    error(code, ...message) {
      console.error('AUTH_ERROR:', code, ...message)
      console.log('ENV_CHECK:', { 
        hasSecret: !!process.env.AUTH_SECRET,
        url: process.env.AUTH_URL || process.env.NEXTAUTH_URL,
        nodeEnv: process.env.NODE_ENV
      })
    },
  },
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
  trustHost: true,
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = z
          .object({
            email: z.string().email(),
            password: z.string().min(6),
          })
          .safeParse(credentials)

        if (!parsed.success) return null

        const { email, password } = parsed.data

        const user = await prisma.user.findUnique({
          where: { email },
        })

        if (!user || !user.password) return null

        const isValid = await bcrypt.compare(password, user.password)
        if (!isValid) return null

        if (user.role === 'CUSTOMER') {
          const customer = await prisma.customer.findUnique({
            where: { userId: user.id },
          })
          if (customer?.status === 'SUSPENDED') {
            throw new Error('ACCOUNT_SUSPENDED')
          }
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          image: user.image,
        }
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = (user as any).role || "CUSTOMER"
      } else if (token.id && !token.role) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { role: true },
        })
        if (dbUser) {
          token.role = dbUser.role
        }
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
      }
      return session
    },
  },
  events: {
    async createUser({ user }) {
      if (user.id) {
        await prisma.customer.create({
          data: {
            userId: user.id,
            firstName: user.name?.split(" ")[0] || "New",
            lastName: user.name?.split(" ").slice(1).join(" ") || "Customer",
            phone: "",
            address: "",
            city: "",
            country: "United States",
            status: "ACTIVE",
          },
        })
      }
    },
  },
})
