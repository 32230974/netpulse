import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import Google from "next-auth/providers/google"
import Facebook from "next-auth/providers/facebook"
import { z } from "zod"
import bcrypt from "bcryptjs"
import prisma from "@/lib/prisma"
import { PrismaAdapter } from "@auth/prisma-adapter"

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
    /* 
    Facebook({
      clientId: process.env.AUTH_FACEBOOK_ID,
      clientSecret: process.env.AUTH_FACEBOOK_SECRET,
    }),
    */
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

        // Check if the customer account has been suspended due to high risk
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
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id as string
        token.role = (user as any).role || "CUSTOMER"
      } else if (token.id && !token.role) {
        // Fetch role if missing (for OAuth users)
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id },
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
      // Automatically create a Customer record for new OAuth users
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
