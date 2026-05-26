import { eq } from 'drizzle-orm'
import { db } from '@/core/db'
import { subscriptions } from '@/core/db/schema'
import { env } from '@/core/config/env'
import { logger } from '@/core/lib/logger'

export async function getUserSubscription(userId: string) {
  return await db.select().from(subscriptions).where(eq(subscriptions.userId, userId)).get()
}

export async function isPro(userId: string) {
  const sub = await getUserSubscription(userId)
  return sub?.plan === 'pro' && sub?.status === 'active'
}

export async function createStripeCheckout(userId: string) {
  const { default: Stripe } = await import('stripe')
  if (!env.STRIPE_SECRET_KEY) throw new Error('Stripe not configured')

  const stripe = new Stripe(env.STRIPE_SECRET_KEY)
  const sub = await getUserSubscription(userId)

  if (!sub?.stripeCustomerId) {
    const { users } = await import('@/core/db/schema/users')
    const user = await db.select().from(users).where(eq(users.id, userId)).get()
    if (!user) throw new Error('User not found')

    const customer = await stripe.customers.create({ email: user.email, name: user.name, metadata: { userId } })
    await db.update(subscriptions).set({ stripeCustomerId: customer.id }).where(eq(subscriptions.userId, userId)).run()
  }

  const updated = await getUserSubscription(userId)
  if (!updated?.stripeCustomerId) throw new Error('Failed to create customer')

  const session = await stripe.checkout.sessions.create({
    customer: updated.stripeCustomerId,
    mode: 'subscription',
    line_items: [{ price: env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_URL ?? 'http://localhost:3000'}/settings/billing?success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_URL ?? 'http://localhost:3000'}/settings/billing?canceled=true`,
    metadata: { userId },
  })

  return session.url
}

export async function createPortalSession(userId: string) {
  const { default: Stripe } = await import('stripe')
  if (!env.STRIPE_SECRET_KEY) throw new Error('Stripe not configured')

  const stripe = new Stripe(env.STRIPE_SECRET_KEY)
  const sub = await getUserSubscription(userId)
  if (!sub?.stripeCustomerId) throw new Error('No customer found')

  const session = await stripe.billingPortal.sessions.create({
    customer: sub.stripeCustomerId,
    return_url: `${process.env.NEXT_PUBLIC_URL ?? 'http://localhost:3000'}/settings/billing`,
  })

  return session.url
}

export async function handleWebhookEvent(event: Record<string, unknown>) {
  const type = event.type as string
  const data = event.data as Record<string, unknown> | undefined
  const obj = data?.object as Record<string, unknown> | undefined
  const created = event.created as number
  switch (type) {
    case 'checkout.session.completed': {
      const metadata = (obj?.metadata as Record<string, string> | undefined)
      const userId = metadata?.userId
      const subscription = obj?.subscription as string | undefined
      if (userId && subscription && obj) {
        await db.update(subscriptions).set({
          stripeSubscriptionId: subscription,
          plan: 'pro',
          status: 'active',
          currentPeriodStart: new Date(created * 1000),
          currentPeriodEnd: new Date((obj.expires_at as number) * 1000),
        }).where(eq(subscriptions.userId, userId)).run()
        logger.info({ userId }, 'Subscription upgraded to Pro')
      }
      break
    }
    case 'customer.subscription.deleted': {
      const customerId = obj?.customer as string | undefined
      if (customerId) {
        await db.update(subscriptions).set({
          plan: 'free',
          status: 'canceled',
          stripeSubscriptionId: null,
        }).where(eq(subscriptions.stripeCustomerId, customerId)).run()
      }
      break
    }
  }
}
