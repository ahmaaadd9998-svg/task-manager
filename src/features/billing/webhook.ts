import { env } from '@/core/config/env'
import { handleWebhookEvent } from './service'
import { logger } from '@/core/lib/logger'

export async function processStripeWebhook(body: string, signature: string) {
  const { default: Stripe } = await import('stripe')
  if (!env.STRIPE_SECRET_KEY || !env.STRIPE_WEBHOOK_SECRET) throw new Error('Stripe not configured')

  const stripe = new Stripe(env.STRIPE_SECRET_KEY)
  const event = stripe.webhooks.constructEvent(body, signature, env.STRIPE_WEBHOOK_SECRET)

  try {
    await handleWebhookEvent(event as unknown as Record<string, unknown>)
    logger.info({ type: event.type }, 'Webhook processed')
  } catch (err) {
    logger.error({ err, type: event.type }, 'Webhook handler failed')
    throw err
  }
}
