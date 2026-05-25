'use server'

import { revalidatePath } from 'next/cache'
import { auth } from '@/features/auth/auth.config'
import { createProjectSchema, updateProjectSchema } from './validations'
import * as projectService from './service'

async function getUserId() {
  const session = await auth()
  if (!session?.user?.id) throw new Error('Unauthorized')
  return session.user.id
}

export async function createProjectAction(formData: FormData) {
  const userId = await getUserId()
  const parsed = createProjectSchema.safeParse({
    name: formData.get('name'),
    description: formData.get('description'),
    color: formData.get('color'),
  })
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  projectService.createProject(userId, parsed.data)
  revalidatePath('/projects')
}

export async function deleteProjectAction(formData: FormData) {
  const userId = await getUserId()
  const id = formData.get('id') as string
  if (!id) return { error: 'Project ID required' }

  projectService.deleteProject(id, userId)
  revalidatePath('/projects')
  revalidatePath('/tasks')
}
