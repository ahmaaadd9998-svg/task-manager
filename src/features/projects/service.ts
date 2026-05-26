import { eq, and } from 'drizzle-orm'
import { db } from '@/core/db'
import { projects } from '@/core/db/schema/projects'
import type { CreateProjectInput, UpdateProjectInput } from './validations'
import { logger } from '@/core/lib/logger'

export async function getProjects(userId: string) {
  return await db.select().from(projects).where(eq(projects.userId, userId)).orderBy(projects.createdAt).all()
}

export async function getProject(id: string, userId: string) {
  return await db.select().from(projects).where(and(eq(projects.id, id), eq(projects.userId, userId))).get()
}

export async function createProject(userId: string, input: CreateProjectInput) {
  const id = crypto.randomUUID()
  await db.insert(projects).values({
    id,
    userId,
    name: input.name,
    description: input.description ?? null,
    color: input.color ?? '#3b82f6',
  }).run()
  logger.info({ projectId: id, userId }, 'Project created')
  return await getProject(id, userId)
}

export async function updateProject(userId: string, input: UpdateProjectInput) {
  const existing = await getProject(input.id, userId)
  if (!existing) throw new Error('Project not found')

  await db.update(projects)
    .set({
      ...(input.name !== undefined && { name: input.name }),
      ...(input.description !== undefined && { description: input.description }),
      ...(input.color !== undefined && { color: input.color }),
      updatedAt: new Date(),
    })
    .where(and(eq(projects.id, input.id), eq(projects.userId, userId)))
    .run()

  logger.info({ projectId: input.id, userId }, 'Project updated')
  return await getProject(input.id, userId)
}

export async function deleteProject(id: string, userId: string) {
  const existing = await getProject(id, userId)
  if (!existing) throw new Error('Project not found')
  await db.delete(projects).where(and(eq(projects.id, id), eq(projects.userId, userId))).run()
  logger.info({ projectId: id, userId }, 'Project deleted')
}
