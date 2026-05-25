'use client'

import { updateTaskStatusAction } from '../actions'
import { cn } from '@/core/lib/utils'

const statusStyles = {
  todo: 'border-muted-foreground text-muted-foreground',
  in_progress: 'border-blue-500 text-blue-500',
  done: 'border-green-500 text-green-500',
}

const statusLabels: Record<string, string> = {
  todo: 'للبدأ',
  in_progress: 'قيد التنفيذ',
  done: 'منتهية',
}

const statusNext: Record<string, string> = {
  todo: 'in_progress',
  in_progress: 'done',
  done: 'todo',
}

export function TaskStatusBadge({ status, taskId }: { status: string; taskId: string }) {
  const next = statusNext[status] ?? 'todo'

  return (
    <button
      onClick={() => updateTaskStatusAction(taskId, next)}
      className={cn(
        'text-xs px-2 py-0.5 rounded-full border font-medium hover:opacity-80 transition-opacity',
        statusStyles[status as keyof typeof statusStyles]
      )}
      title={`اضغط للتغيير إلى ${statusLabels[next]}`}
    >
      {statusLabels[status] ?? status}
    </button>
  )
}
