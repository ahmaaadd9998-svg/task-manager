import { eq } from 'drizzle-orm'
import bcrypt from 'bcryptjs'
import { db } from '@/core/db'
import { users } from '@/core/db/schema/users'
import { subscriptions } from '@/core/db/schema/subscriptions'
import { logger } from '@/core/lib/logger'
import type { RegisterInput } from './validations'

export async function createUser(input: RegisterInput) {
  const existing = await db.select().from(users).where(eq(users.email, input.email)).get()
  if (existing) {
    throw new Error('Email already registered')
  }

  const id = crypto.randomUUID()
  const hashedPassword = await bcrypt.hash(input.password, 12)

  await db.transaction(async (tx: any) => {
    await tx.insert(users).values({
      id,
      name: input.name,
      email: input.email,
      password: hashedPassword,
    }).run()

    await tx.insert(subscriptions).values({
      id: crypto.randomUUID(),
      userId: id,
      plan: 'free',
      status: 'active',
    }).run()
  })

  logger.info({ userId: id }, 'User created with free subscription')
  return { id, name: input.name, email: input.email }
}

