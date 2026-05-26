'use client'

import React, { useState, useEffect } from 'react'
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
  defaultDropAnimationSideEffects,
} from '@dnd-kit/core'
import { SortableContext, arrayMove, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { KanbanColumn } from './kanban-column'
import { KanbanCard } from './kanban-card'
import { updateTaskPositionAction, quickCreateTaskAction } from '../actions'

const COLUMNS = [
  { id: 'todo', title: 'قيد الانتظار', color: 'bg-gray-100', border: 'border-gray-200' },
  { id: 'in_progress', title: 'قيد التنفيذ', color: 'bg-yellow-50', border: 'border-yellow-200' },
  { id: 'done', title: 'مكتملة', color: 'bg-green-50', border: 'border-green-200' },
]

type Task = { id: string; title: string; description?: string | null; status: string; priority: string; subtasks?: { id: string; taskId: string; title: string; isCompleted: boolean }[] }

export function KanbanBoard({ initialTasks }: { initialTasks: Task[] }) {
  const [tasks, setTasks] = useState(initialTasks)
  const [activeId, setActiveId] = useState<string | null>(null)

  // Update tasks when initialTasks change from server (e.g. after a mutation)
  useEffect(() => {
    setTasks(initialTasks)
  }, [initialTasks])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const activeTask = tasks.find((t) => t.id === activeId)

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event
    if (!over) return

    const activeId = active.id
    const overId = over.id

    if (activeId === overId) return

    const isActiveTask = active.data.current?.type === 'Task'
    const isOverTask = over.data.current?.type === 'Task'
    const isOverColumn = over.data.current?.type === 'Column'

    if (!isActiveTask) return

    setTasks((tasks) => {
      const activeIndex = tasks.findIndex((t) => t.id === activeId)
      const overIndex = tasks.findIndex((t) => t.id === overId)

      if (isOverTask) {
        const activeTask = tasks[activeIndex]
        const overTask = tasks[overIndex]
        
        if (activeTask.status !== overTask.status) {
          const updatedActive = { ...activeTask, status: overTask.status }
          const newTasks = [...tasks]
          newTasks[activeIndex] = updatedActive
          return arrayMove(newTasks, activeIndex, overIndex)
        }
        return arrayMove(tasks, activeIndex, overIndex)
      }

      if (isOverColumn) {
        const activeTask = tasks[activeIndex]
        const updatedActive = { ...activeTask, status: overId as string }
        const newTasks = [...tasks]
        newTasks[activeIndex] = updatedActive
        return arrayMove(newTasks, activeIndex, newTasks.length - 1)
      }

      return tasks
    })
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveId(null)
    const { active, over } = event
    if (!over) return

    const activeId = active.id as string
    const overId = over.id as string

    if (activeId === overId) return

    const task = tasks.find(t => t.id === activeId)
    if (!task) return

    const overTask = tasks.find(t => t.id === overId)
    const newStatus = overTask ? overTask.status : (over.data.current?.type === 'Column' ? overId as string : task.status)
    const activeIndex = tasks.findIndex(t => t.id === activeId)

    // Call server action to save new position/status
    await updateTaskPositionAction(activeId, newStatus, activeIndex)
  }

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col h-[calc(100vh-80px)] sm:h-[calc(100vh-120px)]">
      <form action={quickCreateTaskAction} className="flex flex-col sm:flex-row gap-2 sm:gap-4 mb-4 sm:mb-6 bg-white p-2 rounded-lg border border-gray-200 shadow-sm shrink-0">
        <input 
          type="text" 
          name="title" 
          placeholder="ما الذي تريد إنجازه؟" 
          className="flex-[2] border-0 focus:ring-0 px-3 sm:px-4 py-2 text-sm outline-none bg-transparent" 
          required 
        />
        <input 
          type="text" 
          name="description" 
          placeholder="التفاصيل (اختياري)" 
          className="w-full sm:flex-1 border border-gray-200 sm:border-0 focus:ring-0 px-3 sm:px-4 py-2 text-sm outline-none bg-transparent text-gray-500 rounded sm:rounded-none" 
        />
        <button 
          type="submit" 
          className="bg-blue-600 text-white px-4 sm:px-6 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm shrink-0"
        >
          إضافة مهمة
        </button>
      </form>

      <div className="flex gap-4 sm:gap-6 h-full overflow-x-auto pb-4 snap-x snap-mandatory">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          {COLUMNS.map((col) => {
            const columnTasks = tasks.filter((t) => t.status === col.id)
            return (
              <KanbanColumn 
                key={col.id} 
                column={col} 
                tasks={columnTasks} 
              />
            )
          })}
          
          <DragOverlay dropAnimation={{ sideEffects: defaultDropAnimationSideEffects({ styles: { active: { opacity: '0.4' } } }) }}>
            {activeTask ? <KanbanCard task={activeTask} /> : null}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  )
}
