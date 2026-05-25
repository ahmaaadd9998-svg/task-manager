'use client'

import { useRouter } from 'next/navigation'
import { deleteTaskAction } from '../actions'
import { Button } from '@/components/ui/button'

export function TaskDetailActions({ taskId }: { taskId: string }) {
  const router = useRouter()

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        if (confirm('حذف هذه المهمة؟')) {
          const fd = new FormData()
          fd.set('id', taskId)
          deleteTaskAction(fd)
          router.push('/tasks')
        }
      }}
    >
      <Button type="submit" variant="destructive" size="sm">حذف</Button>
    </form>
  )
}
