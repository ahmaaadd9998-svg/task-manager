'use server'

import { revalidatePath } from 'next/cache'
import { auth } from '@/features/auth/auth.config'
import { createTaskSchema, updateTaskSchema } from './validations'
import * as taskService from './service'

type ActionResult = { error?: string } | undefined

async function getUserId() {
  const session = await auth()
  if (!session?.user?.id) throw new Error('Unauthorized')
  return session.user.id
}

export async function createTaskAction(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const userId = await getUserId()
  const parsed = createTaskSchema.safeParse({
    title: formData.get('title'),
    description: formData.get('description'),
    priority: formData.get('priority'),
    dueDate: formData.get('dueDate'),
    projectId: formData.get('projectId'),
  })
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  await taskService.createTask(userId, parsed.data)
  revalidatePath('/tasks')
  revalidatePath('/')
}

export async function quickCreateTaskAction(formData: FormData) {
  const userId = await getUserId()
  const title = formData.get('title') as string
  const description = formData.get('description') as string
  await taskService.createTask(userId, { title, description, priority: 'medium', projectId: undefined })
  revalidatePath('/tasks')
  revalidatePath('/')
}

export async function updateTaskAction(formData: FormData) {
  const userId = await getUserId()
  const parsed = updateTaskSchema.safeParse({
    id: formData.get('id'),
    title: formData.get('title'),
    description: formData.get('description'),
    status: formData.get('status'),
    priority: formData.get('priority'),
    dueDate: formData.get('dueDate'),
    projectId: formData.get('projectId'),
  })
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  await taskService.updateTask(userId, parsed.data)
  revalidatePath('/tasks')
  revalidatePath('/')
}

export async function deleteTaskAction(formData: FormData) {
  const userId = await getUserId()
  const id = formData.get('id') as string
  if (!id) return { error: 'Task ID required' }

  await taskService.deleteTask(id, userId)
  revalidatePath('/tasks')
  revalidatePath('/')
}

export async function quickDeleteTaskAction(formData: FormData) {
  const userId = await getUserId()
  const id = formData.get('id') as string
  if (id) {
    await taskService.deleteTask(id, userId)
    revalidatePath('/tasks')
    revalidatePath('/')
  }
}

export async function updateTaskStatusAction(taskId: string, status: string) {
  const userId = await getUserId()
  await taskService.updateTask(userId, { id: taskId, status: status as 'todo' | 'in_progress' | 'done' })
  revalidatePath('/tasks')
  revalidatePath('/')
}

export async function updateTaskPositionAction(taskId: string, status: string, position: number) {
  const userId = await getUserId()
  await taskService.updateTask(userId, { id: taskId, status: status as 'todo' | 'in_progress' | 'done', position })
  revalidatePath('/tasks')
  revalidatePath('/')
}

export async function createSubtaskAction(taskId: string, title: string) {
  const userId = await getUserId()
  await taskService.createSubtask(taskId, title, userId)
  revalidatePath('/tasks')
  revalidatePath('/')
}

export async function toggleSubtaskAction(id: string, isCompleted: boolean) {
  const userId = await getUserId()
  await taskService.toggleSubtask(id, isCompleted, userId)
  revalidatePath('/tasks')
  revalidatePath('/')
}

export async function deleteSubtaskAction(id: string) {
  const userId = await getUserId()
  await taskService.deleteSubtask(id, userId)
  revalidatePath('/tasks')
  revalidatePath('/')
}
