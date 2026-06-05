import { eq, and } from 'drizzle-orm'
import crypto from 'crypto'
import { db } from '@/core/db'
import { users } from '@/core/db/schema/users'
import { projectMembers } from '@/core/db/schema/projects'
import { logger } from '@/core/lib/logger'

export async function getProjectMembers(projectId: string) {
  return await db.select({
    id: users.id,
    name: users.name,
    email: users.email,
    image: users.image,
    role: projectMembers.role,
  })
    .from(projectMembers)
    .innerJoin(users, eq(users.id, projectMembers.userId))
    .where(eq(projectMembers.projectId, projectId))
    .all()
}

export async function addMember(projectId: string, email: string) {
  const user = await db.select().from(users).where(eq(users.email, email)).get()
  if (!user) throw new Error('User not found')

  const existing = await db.select().from(projectMembers)
    .where(and(eq(projectMembers.projectId, projectId), eq(projectMembers.userId, user.id)))
    .get()

  if (existing) throw new Error('User is already a member')

  await db.insert(projectMembers).values({
    id: crypto.randomUUID(),
    projectId,
    userId: user.id,
    role: 'editor',
  }).run()

  logger.info({ projectId, userId: user.id }, 'Member added to project')
  return user
}

export async function removeMember(projectId: string, userId: string) {
  await db.delete(projectMembers)
    .where(and(eq(projectMembers.projectId, projectId), eq(projectMembers.userId, userId)))
    .run()
  logger.info({ projectId, userId }, 'Member removed from project')
}
