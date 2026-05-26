'use client'

import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import { deleteTaskAction } from '../actions'
import { Button } from '@/components/ui/button'

export function TaskDetailActions({ taskId }: { taskId: string }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  return (
    <Button
      type="button"
      variant="destructive"
      size="sm"
      disabled={pending}
      onClick={() => {
        startTransition(async () => {
          const fd = new FormData()
          fd.set('id', taskId)
          await deleteTaskAction(fd)
          router.push('/tasks')
        })
      }}
    >
      {pending ? 'جاري الحذف...' : 'حذف'}
    </Button>
  )
}
