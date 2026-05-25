'use server'

import { revalidatePath } from 'next/cache'
import { auth } from '@/features/auth/auth.config'
import * as teamService from './service'

export async function addMemberAction(formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) throw new Error('Unauthorized')

  const projectId = formData.get('projectId') as string
  const email = formData.get('email') as string
  if (!projectId || !email) return { error: 'Missing fields' }

  try {
    teamService.addMember(projectId, email)
    revalidatePath(`/projects/${projectId}`)
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Failed to add member' }
  }
}
