'use server'

import { redirect } from 'next/navigation'
import { auth } from '@/features/auth/auth.config'
import { createStripeCheckout, createPortalSession } from './service'
import { logger } from '@/core/lib/logger'

export async function upgradeToProAction() {
  const session = await auth()
  if (!session?.user?.id) throw new Error('Unauthorized')

  try {
    const url = await createStripeCheckout(session.user.id)
    if (url) redirect(url)
  } catch (err) {
    logger.error({ err }, 'Upgrade failed')
    throw new Error('Failed to start upgrade process')
  }
}

export async function manageBillingAction() {
  const session = await auth()
  if (!session?.user?.id) throw new Error('Unauthorized')

  try {
    const url = await createPortalSession(session.user.id)
    if (url) redirect(url)
  } catch (err) {
    logger.error({ err }, 'Portal session failed')
    throw new Error('Failed to open billing portal')
  }
}
