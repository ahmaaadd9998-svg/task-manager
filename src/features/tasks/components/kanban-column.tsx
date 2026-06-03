import { useMemo } from 'react'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useDroppable } from '@dnd-kit/core'
import { KanbanCard } from './kanban-card'

type Column = { id: string; title: string; color: string; border: string }
type Task = { id: string; title: string; description?: string | null; status: string; priority: string; subtasks?: { id: string; taskId: string; title: string; isCompleted: boolean }[] }

export function KanbanColumn({ column, tasks }: { column: Column; tasks: Task[] }) {
  const taskIds = useMemo(() => tasks.map((t) => t.id), [tasks])

  const { setNodeRef } = useDroppable({
    id: column.id,
    data: {
      type: 'Column',
      column,
    },
  })

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col w-full sm:w-[320px] md:w-[350px] min-w-[280px] rounded-lg border ${column.border} ${column.color} shrink-0 h-full overflow-hidden`}
    >
      <div className="flex items-center justify-between p-4 border-b border-black/5 bg-black/5">
        <h3 className="font-semibold text-gray-800">{column.title}</h3>
        <span className="bg-white/60 text-gray-600 text-xs font-medium px-2 py-1 rounded-full border border-black/5">
          {tasks.length}
        </span>
      </div>
      
      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-3">
        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <KanbanCard key={task.id} task={task} />
          ))}
        </SortableContext>
        
        {tasks.length === 0 && (
          <div className="h-full w-full flex items-center justify-center text-gray-400 text-sm font-medium pt-8 pb-4 opacity-50">
            أسقط المهام هنا
          </div>
        )}
      </div>
    </div>
  )
}
