'use server'

import { revalidatePath } from 'next/cache'
import { auth } from '@/features/auth/auth.config'
import * as aiService from './service'
import { AiQuotaExceededError } from './service'
import { logger } from '@/core/lib/logger'

export async function getAiTaskSuggestions(projectContext: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error('Unauthorized')

  try {
    const suggestions = await aiService.generateTaskSuggestions(session.user.id, projectContext)
    return suggestions
  } catch (err) {
    if (err instanceof AiQuotaExceededError) {
      logger.warn({ used: err.used, limit: err.limit }, 'AI quota exceeded for suggestions')
      return null
    }
    logger.error({ err }, 'AI suggestion failed')
    return null
  }
}

export async function getProductivityInsight() {
  const session = await auth()
  if (!session?.user?.id) throw new Error('Unauthorized')

  const { db } = await import('@/core/db')
  const { tasks } = await import('@/core/db/schema/tasks')
  const { eq, and, count, lt } = await import('drizzle-orm')

  const total = (await db.select({ value: count() }).from(tasks).where(eq(tasks.userId, session.user.id)).get())?.value ?? 0
  const done = (await db.select({ value: count() }).from(tasks).where(and(eq(tasks.userId, session.user.id), eq(tasks.status, 'done'))).get())?.value ?? 0
  const now = new Date()
  const overdue = (await db.select({ value: count() }).from(tasks).where(
    and(eq(tasks.userId, session.user.id), lt(tasks.dueDate, now), eq(tasks.status, 'todo'))
  ).get())?.value ?? 0

  const summary = `Tasks: ${total} total, ${done} done, ${overdue} overdue`

  try {
    return await aiService.generateProductivityInsight(session.user.id, summary)
  } catch (err) {
    if (err instanceof AiQuotaExceededError) {
      logger.warn({ used: err.used, limit: err.limit }, 'AI quota exceeded for insight')
      return null
    }
    logger.error({ err }, 'AI insight failed')
    return null
  }
}

export async function prioritizeTasks() {
  const session = await auth()
  if (!session?.user?.id) throw new Error('Unauthorized')

  const { db } = await import('@/core/db')
  const { tasks } = await import('@/core/db/schema/tasks')
  const { eq, and } = await import('drizzle-orm')

  const userTasks = await db.select({ id: tasks.id, title: tasks.title, priority: tasks.priority, dueDate: tasks.dueDate })
    .from(tasks)
    .where(and(eq(tasks.userId, session.user.id), eq(tasks.status, 'todo')))
    .all()

  if (userTasks.length === 0) return null

  let result: Awaited<ReturnType<typeof aiService.smartPrioritize>>
  try {
    result = await aiService.smartPrioritize(session.user.id, JSON.stringify({ tasks: userTasks }))
  } catch (err) {
    if (err instanceof AiQuotaExceededError) {
      logger.warn({ used: err.used, limit: err.limit }, 'AI quota exceeded for prioritization')
      return null
    }
    throw err
  }
  if (!result) return null

  for (const item of result) {
    await db.update(tasks).set({ position: item.position }).where(eq(tasks.id, item.id)).run()
  }

  revalidatePath('/')
  revalidatePath('/tasks')
  return result
}
