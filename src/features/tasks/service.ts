import { eq, and, inArray } from 'drizzle-orm'
import crypto from 'crypto'
import { db } from '@/core/db'
import { tasks, subtasks } from '@/core/db/schema'
import type { CreateTaskInput, UpdateTaskInput } from './validations'
import { logger } from '@/core/lib/logger'

export async function getTasks(userId: string, projectId?: string) {
  const conditions = [eq(tasks.userId, userId)]
  if (projectId) conditions.push(eq(tasks.projectId, projectId))

  const userTasks = await db.select()
    .from(tasks)
    .where(and(...conditions))
    .orderBy(tasks.position)
    .all()

  const taskIds = userTasks.map((t: any) => t.id)
  let allSubtasks: (typeof subtasks.$inferSelect)[] = []
  if (taskIds.length > 0) {
    allSubtasks = await db.select().from(subtasks).where(inArray(subtasks.taskId, taskIds)).all()
  }

  return userTasks.map((t: any) => ({
    ...t,
    subtasks: allSubtasks.filter((st: any) => st.taskId === t.id)
  }))
}

export async function getTask(id: string, userId: string) {
  return await db.select()
    .from(tasks)
    .where(and(eq(tasks.id, id), eq(tasks.userId, userId)))
    .get()
}

export async function createTask(userId: string, input: CreateTaskInput) {
  const id = crypto.randomUUID()
  const maxPos = await db.select({ max: tasks.position }).from(tasks).where(eq(tasks.userId, userId)).get()

  await db.insert(tasks).values({
    id,
    userId,
    title: input.title,
    description: input.description ?? null,
    priority: input.priority,
    dueDate: input.dueDate ? new Date(input.dueDate) : null,
    projectId: input.projectId ?? null,
    position: (maxPos?.max ?? 0) + 1,
  }).run()

  logger.info({ taskId: id, userId }, 'Task created')
  return await getTask(id, userId)
}

export async function updateTask(userId: string, input: UpdateTaskInput) {
  const existing = await getTask(input.id, userId)
  if (!existing) throw new Error('Task not found')

  await db.update(tasks)
    .set({
      ...(input.title !== undefined && { title: input.title }),
      ...(input.description !== undefined && { description: input.description }),
      ...(input.status !== undefined && { status: input.status }),
      ...(input.priority !== undefined && { priority: input.priority }),
      ...(input.dueDate !== undefined && { dueDate: input.dueDate ? new Date(input.dueDate) : null }),
      ...(input.projectId !== undefined && { projectId: input.projectId ?? null }),
      ...(input.position !== undefined && { position: input.position }),
      updatedAt: new Date(),
    })
    .where(and(eq(tasks.id, input.id), eq(tasks.userId, userId)))
    .run()

  logger.info({ taskId: input.id, userId }, 'Task updated')
  return await getTask(input.id, userId)
}

export async function deleteTask(id: string, userId: string) {
  const existing = await getTask(id, userId)
  if (!existing) throw new Error('Task not found')

  await db.delete(tasks).where(and(eq(tasks.id, id), eq(tasks.userId, userId))).run()
  logger.info({ taskId: id, userId }, 'Task deleted')
}

export async function createSubtask(taskId: string, title: string, userId: string) {
  // ensure user owns task
  const task = await getTask(taskId, userId)
  if (!task) throw new Error('Task not found')

  const id = crypto.randomUUID()
  await db.insert(subtasks).values({ id, taskId, title }).run()
  return { id, taskId, title, isCompleted: false }
}

export async function toggleSubtask(id: string, isCompleted: boolean, userId: string) {
  const subtask = await db.select({
    id: subtasks.id,
    taskId: subtasks.taskId,
  }).from(subtasks)
    .innerJoin(tasks, eq(subtasks.taskId, tasks.id))
    .where(and(eq(subtasks.id, id), eq(tasks.userId, userId)))
    .get()
  if (!subtask) throw new Error('Subtask not found')
  await db.update(subtasks).set({ isCompleted }).where(eq(subtasks.id, id)).run()
}

export async function deleteSubtask(id: string, userId: string) {
  const subtask = await db.select({
    id: subtasks.id,
    taskId: subtasks.taskId,
  }).from(subtasks)
    .innerJoin(tasks, eq(subtasks.taskId, tasks.id))
    .where(and(eq(subtasks.id, id), eq(tasks.userId, userId)))
    .get()
  if (!subtask) throw new Error('Subtask not found')
  await db.delete(subtasks).where(eq(subtasks.id, id)).run()
}
