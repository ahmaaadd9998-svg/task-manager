import { eq, and } from 'drizzle-orm'
import { db } from '@/core/db'
import { users } from '@/core/db/schema/users'
import { projectMembers } from '@/core/db/schema/projects'
import { logger } from '@/core/lib/logger'

export function getProjectMembers(projectId: string) {
  return db.select({
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

export function addMember(projectId: string, email: string) {
  const user = db.select().from(users).where(eq(users.email, email)).get()
  if (!user) throw new Error('User not found')

  const existing = db.select().from(projectMembers)
    .where(and(eq(projectMembers.projectId, projectId), eq(projectMembers.userId, user.id)))
    .get()

  if (existing) throw new Error('User is already a member')

  db.insert(projectMembers).values({
    id: crypto.randomUUID(),
    projectId,
    userId: user.id,
    role: 'editor',
  }).run()

  logger.info({ projectId, userId: user.id }, 'Member added to project')
  return user
}

export function removeMember(projectId: string, userId: string) {
  db.delete(projectMembers)
    .where(and(eq(projectMembers.projectId, projectId), eq(projectMembers.userId, userId)))
    .run()
  logger.info({ projectId, userId }, 'Member removed from project')
}
