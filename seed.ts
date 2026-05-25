import { db } from './src/core/db'
import { users } from './src/core/db/schema/users'
import { subscriptions } from './src/core/db/schema/subscriptions'
import { count } from 'drizzle-orm'

async function main() {
  const [{ value: userCount }] = await db.select({ value: count() }).from(users)
  
  if (userCount === 0) {
    const id = crypto.randomUUID()
    const subId = crypto.randomUUID()

    await db.transaction(async (tx: any) => {
      await tx.insert(users).values({
        id,
        name: 'Demo User',
        email: 'demo@taskai.local',
      })
      await tx.insert(subscriptions).values({
        id: subId,
        userId: id,
        plan: 'free',
        status: 'active',
      })
    })

    console.log('Seeded demo user:', id)
  } else {
    console.log('User already exists')
  }
}

main().catch(console.error)
