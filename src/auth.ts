import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import prisma from "@/lib/prisma"
import { authConfig } from "./auth.config"
import Google from "next-auth/providers/google"
import Facebook from "next-auth/providers/facebook"
import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"

const googleClientId = process.env.AUTH_GOOGLE_ID || process.env.GOOGLE_CLIENT_ID
const googleClientSecret = process.env.AUTH_GOOGLE_SECRET || process.env.GOOGLE_CLIENT_SECRET
const facebookClientId = process.env.AUTH_FACEBOOK_ID || process.env.FACEBOOK_CLIENT_ID
const facebookClientSecret = process.env.AUTH_FACEBOOK_SECRET || process.env.FACEBOOK_CLIENT_SECRET

const providers = [
  Credentials({
    name: "credentials",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" },
    },
    async authorize(credentials) {
      if (!credentials?.email || !credentials?.password) return null

      const user = await prisma.user.findUnique({
        where: { email: credentials.email as string },
      })

      if (!user || !user.password) return null

      const isValid = await bcrypt.compare(
        credentials.password as string,
        user.password
      )

      if (!isValid) return null

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      }
    },
  }),
]

if (googleClientId && googleClientSecret) {
  providers.unshift(
    Google({
      clientId: googleClientId,
      clientSecret: googleClientSecret,
    })
  )
}

if (facebookClientId && facebookClientSecret) {
  providers.push(
    Facebook({
      clientId: facebookClientId,
      clientSecret: facebookClientSecret,
    })
  )
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
  trustHost: true,
  providers,
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
      if (!user.id) return;
      try {
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id as string },
        })

        if (dbUser && dbUser.role === "CUSTOMER") {
          const existingCustomer = await prisma.customer.findUnique({
            where: { userId: user.id as string },
          })

          if (!existingCustomer) {
            const nameParts = (user.name || "New Customer").split(" ");
            const firstName = nameParts[0];
            const lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : "Customer";

            await prisma.customer.create({
              data: {
                userId: user.id as string,
                firstName: firstName,
                lastName: lastName,
                phone: "000-000-0000",
                address: "Pending Info",
                city: "Pending Info",
                status: "ACTIVE",
              },
            })
          }
        }
      } catch (error) {
        console.error("Error in createUser event:", error)
      }
    },
  },
})
