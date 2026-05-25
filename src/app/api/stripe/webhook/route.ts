import { processStripeWebhook } from '@/features/billing/webhook'

export async function POST(req: Request) {
  const body = await req.text()
  const signature = req.headers.get('stripe-signature')
  if (!signature) return new Response('Missing signature', { status: 400 })

  try {
    await processStripeWebhook(body, signature)
    return new Response('OK', { status: 200 })
  } catch (err) {
    return new Response(err instanceof Error ? err.message : 'Webhook error', { status: 400 })
  }
}
