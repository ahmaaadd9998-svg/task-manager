import NextAuth, { type NextAuthOptions } from 'next-auth'
import { getServerSession } from 'next-auth/next'
import Credentials from 'next-auth/providers/credentials'
import GitHub from 'next-auth/providers/github'
import Google from 'next-auth/providers/google'
import bcrypt from 'bcryptjs'
import { eq } from 'drizzle-orm'
import { db } from '@/core/db'
import { users, subscriptions } from '@/core/db/schema'
import { env } from '@/core/config/env'
import { logger } from '@/core/lib/logger'

export const authOptions: NextAuthOptions = {
  session: { strategy: 'jwt' },
  pages: { signIn: '/login' },
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null
        
        // Dynamic Guest Login Support
        if (credentials.email.endsWith('@guest.taskai.local')) {
          let user = await db.select().from(users).where(eq(users.email, credentials.email)).get()
          if (!user) {
            const id = crypto.randomUUID()
            await db.insert(users).values({
              id,
              name: 'زائر',
              email: credentials.email,
            }).run()
            await db.insert(subscriptions).values({
              id: crypto.randomUUID(),
              userId: id,
              plan: 'free',
              status: 'active',
            }).run()
            user = await db.select().from(users).where(eq(users.email, credentials.email)).get()
          }
          if (user) {
            return { id: user.id, email: user.email, name: user.name, image: user.image }
          }
        }

        if (credentials.email === 'demo@taskai.local' && credentials.password === 'demo12345') {
          const user = await db.select().from(users).where(eq(users.email, 'demo@taskai.local')).get()
          if (user) {
            return { id: user.id, email: user.email, name: user.name, image: user.image }
          }
        }

        const user = await db.select().from(users).where(eq(users.email, credentials.email)).get()
        if (!user || !user.password) return null
        const valid = await bcrypt.compare(credentials.password, user.password)
        if (!valid) return null
        return { id: user.id, email: user.email, name: user.name, image: user.image }
      },
    }),
    ...(env.AUTH_GITHUB_ID && env.AUTH_GITHUB_SECRET
      ? [GitHub({ clientId: env.AUTH_GITHUB_ID, clientSecret: env.AUTH_GITHUB_SECRET })]
      : []),
    ...(env.AUTH_GOOGLE_ID && env.AUTH_GOOGLE_SECRET
      ? [Google({ clientId: env.AUTH_GOOGLE_ID, clientSecret: env.AUTH_GOOGLE_SECRET })]
      : []),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider !== 'credentials') {
        const existing = await db.select().from(users).where(eq(users.email, user.email!)).get()
        if (!existing) {
          const id = crypto.randomUUID()
          await db.insert(users).values({ id, name: user.name!, email: user.email!, image: user.image }).run()
          await db.insert(subscriptions).values({ id: crypto.randomUUID(), userId: id, plan: 'free', status: 'active' }).run()
          user.id = id
        } else {
          user.id = existing.id
        }
      }
      return true
    },
    async jwt({ token, user }) {
      if (user) { token.id = user.id }
      return token
    },
    async session({ session, token }) {
      if (session.user) { session.user.id = token.id as string }
      return session
    },
  },
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }

export async function auth() {
  return getServerSession(authOptions)
}
