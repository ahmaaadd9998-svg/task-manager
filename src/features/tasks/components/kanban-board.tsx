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
  const [activeTab, setActiveTab] = useState('todo')

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

  const handleQuickCreateTask = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const title = formData.get('title') as string
    const description = formData.get('description') as string
    if (!title) return

    const tempId = crypto.randomUUID()
    const tempTask = {
      id: tempId,
      title,
      description: description || null,
      status: 'todo',
      priority: 'medium',
      subtasks: []
    }

    setTasks(prev => [tempTask, ...prev])
    e.currentTarget.reset()

    try {
      await quickCreateTaskAction(formData)
    } catch (error) {
      setTasks(prev => prev.filter(t => t.id !== tempId))
    }
  }

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col h-[calc(100vh-140px)] sm:h-[calc(100vh-160px)]">
      {/* Quick Add Form */}
      <form onSubmit={handleQuickCreateTask} className="flex flex-col sm:flex-row gap-2 sm:gap-4 mb-4 sm:mb-6 bg-white p-3 sm:p-2 rounded-xl border border-gray-200 shadow-sm shrink-0">
        <input 
          type="text" 
          name="title" 
          placeholder="ما الذي تريد إنجازه؟" 
          className="w-full sm:flex-[2] border border-gray-100 sm:border-0 focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500 sm:focus:ring-0 sm:focus:border-transparent px-3 sm:px-4 py-2 text-sm outline-none bg-transparent rounded-lg sm:rounded-none text-right font-medium" 
          required 
        />
        <input 
          type="text" 
          name="description" 
          placeholder="التفاصيل (اختياري)" 
          className="w-full sm:flex-1 border border-gray-100 sm:border-0 focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500 sm:focus:ring-0 sm:focus:border-transparent px-3 sm:px-4 py-2 text-sm outline-none bg-transparent text-gray-500 rounded-lg sm:rounded-none text-right" 
        />
        <button 
          type="submit" 
          className="bg-blue-600 text-white px-4 py-2.5 sm:py-2 rounded-lg sm:rounded-md text-sm font-semibold hover:bg-blue-700 transition-all shadow-md shadow-blue-500/10 hover:shadow-lg shrink-0 cursor-pointer active:scale-95"
        >
          إضافة مهمة
        </button>
      </form>

      {/* Mobile Column Switcher Tabs */}
      <div className="flex sm:hidden border border-gray-150 mb-4 bg-gray-100/50 rounded-xl p-1 shadow-inner gap-1 shrink-0">
        {COLUMNS.map((col) => {
          const count = tasks.filter((t) => t.status === col.id).length
          const isActive = activeTab === col.id
          
          let activeTabStyle = 'bg-blue-600 text-white shadow-sm'
          if (col.id === 'in_progress') activeTabStyle = 'bg-yellow-600 text-white shadow-sm'
          if (col.id === 'done') activeTabStyle = 'bg-green-600 text-white shadow-sm'
          
          return (
            <button
              key={col.id}
              type="button"
              onClick={() => setActiveTab(col.id)}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer select-none ${
                isActive
                  ? activeTabStyle
                  : 'text-gray-500 hover:text-gray-700 hover:bg-white/50'
              }`}
            >
              <span>{col.title}</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${isActive ? 'bg-white/20' : 'bg-gray-250 text-gray-600'}`}>
                {count}
              </span>
            </button>
          )
        })}
      </div>

      {/* Kanban Columns List */}
      <div className="flex gap-4 sm:gap-6 h-full sm:overflow-x-auto pb-4 min-h-0">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          {COLUMNS.map((col) => {
            const columnTasks = tasks.filter((t) => t.status === col.id)
            const isActive = col.id === activeTab
            return (
              <div 
                key={col.id} 
                className={`w-full sm:w-auto ${isActive ? 'flex' : 'hidden sm:flex'} flex-col h-full shrink-0`}
              >
                <KanbanColumn 
                  column={col} 
                  tasks={columnTasks} 
                />
              </div>
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
