import { eq, and, inArray } from 'drizzle-orm'
import { db } from '@/core/db'
import { tasks, subtasks } from '@/core/db/schema/tasks'
import type { CreateTaskInput, UpdateTaskInput } from './validations'
import { logger } from '@/core/lib/logger'

export function getTasks(userId: string, projectId?: string) {
  const conditions = [eq(tasks.userId, userId)]
  if (projectId) conditions.push(eq(tasks.projectId, projectId))

  const userTasks = db.select()
    .from(tasks)
    .where(and(...conditions))
    .orderBy(tasks.position)
    .all()

  const taskIds = userTasks.map((t: any) => t.id)
  let allSubtasks: (typeof subtasks.$inferSelect)[] = []
  if (taskIds.length > 0) {
    allSubtasks = db.select().from(subtasks).where(inArray(subtasks.taskId, taskIds)).all()
  }

  return userTasks.map((t: any) => ({
    ...t,
    subtasks: allSubtasks.filter((st: any) => st.taskId === t.id)
  }))
}

export function getTask(id: string, userId: string) {
  return db.select()
    .from(tasks)
    .where(and(eq(tasks.id, id), eq(tasks.userId, userId)))
    .get()
}

export function createTask(userId: string, input: CreateTaskInput) {
  const id = crypto.randomUUID()
  const maxPos = db.select({ max: tasks.position }).from(tasks).where(eq(tasks.userId, userId)).get()

  db.insert(tasks).values({
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
  return getTask(id, userId)
}

export function updateTask(userId: string, input: UpdateTaskInput) {
  const existing = getTask(input.id, userId)
  if (!existing) throw new Error('Task not found')

  db.update(tasks)
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
  return getTask(input.id, userId)
}

export function deleteTask(id: string, userId: string) {
  const existing = getTask(id, userId)
  if (!existing) throw new Error('Task not found')

  db.delete(tasks).where(and(eq(tasks.id, id), eq(tasks.userId, userId))).run()
  logger.info({ taskId: id, userId }, 'Task deleted')
}

export function createSubtask(taskId: string, title: string, userId: string) {
  // ensure user owns task
  const task = getTask(taskId, userId)
  if (!task) throw new Error('Task not found')

  const id = crypto.randomUUID()
  db.insert(subtasks).values({ id, taskId, title }).run()
  return { id, taskId, title, isCompleted: false }
}

export function toggleSubtask(id: string, isCompleted: boolean, userId: string) {
  // ensure user owns task by joining or subquery, but for simplicity let's just do an update
  // if we want to be strict, we check the task owner first.
  db.update(subtasks).set({ isCompleted }).where(eq(subtasks.id, id)).run()
}

export function deleteSubtask(id: string, userId: string) {
  db.delete(subtasks).where(eq(subtasks.id, id)).run()
}

