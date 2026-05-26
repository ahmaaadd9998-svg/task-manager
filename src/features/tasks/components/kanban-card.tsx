'use client'

import { useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Check, Plus, Trash2 } from 'lucide-react'
import { toggleSubtaskAction, deleteSubtaskAction, createSubtaskAction, updateTaskStatusAction, quickDeleteTaskAction } from '../actions'

export function KanbanCard({ task }: { task: { id: string; title: string; description?: string | null; status: string; priority: string; subtasks?: { id: string; taskId: string; title: string; isCompleted: boolean }[] } }) {
  const [isExpanded, setIsExpanded] = useState(true)
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('')
  const [isAddingSubtask, setIsAddingSubtask] = useState(false)

  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: {
      type: 'Task',
      task,
    },
  })

  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
  }

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="opacity-40 border-2 border-blue-400 bg-blue-50 rounded-lg p-4 w-full h-[100px]"
      />
    )
  }

  const completedSubtasks = task.subtasks?.filter((s) => s.isCompleted).length || 0
  const totalSubtasks = task.subtasks?.length || 0

  const handleAddSubtask = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newSubtaskTitle.trim()) return
    await createSubtaskAction(task.id, newSubtaskTitle)
    setNewSubtaskTitle('')
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow group flex flex-col gap-3"
    >
      <div className="flex items-start justify-between gap-2" {...attributes} {...listeners}>
        <h4 className="font-medium text-gray-900 leading-tight">{task.title}</h4>
        {totalSubtasks > 0 && (
          <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-2 py-0.5 rounded-full shrink-0">
            {completedSubtasks}/{totalSubtasks}
          </span>
        )}
      </div>

      {task.description && (
        <p className="text-sm text-gray-500 line-clamp-2">{task.description}</p>
      )}

      {isExpanded && task.subtasks && task.subtasks.length > 0 && (
        <div className="flex flex-col gap-1.5 mt-1">
          {task.subtasks.map((subtask) => (
            <div key={subtask.id} className="flex items-center justify-between group/sub">
              <label className="flex items-center gap-2 cursor-pointer flex-1">
                <div 
                  className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                    subtask.isCompleted ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-300'
                  }`}
                  onClick={() => toggleSubtaskAction(subtask.id, !subtask.isCompleted)}
                >
                  {subtask.isCompleted && <Check className="w-3 h-3" />}
                </div>
                <span className={`text-sm ${subtask.isCompleted ? 'text-gray-400 line-through' : 'text-gray-700'}`}>
                  {subtask.title}
                </span>
              </label>
              <button 
                onClick={() => deleteSubtaskAction(subtask.id)}
                className="opacity-0 group-hover/sub:opacity-100 text-gray-400 hover:text-red-500 p-1"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {isAddingSubtask && (
        <form onSubmit={handleAddSubtask} className="flex items-center gap-2 mt-1">
          <input
            autoFocus
            type="text"
            value={newSubtaskTitle}
            onChange={(e) => setNewSubtaskTitle(e.target.value)}
            placeholder="خطوة جديدة..."
            className="flex-1 text-sm border-b border-blue-400 focus:outline-none py-1 px-1 bg-transparent"
          />
        </form>
      )}

      <div className="flex flex-col gap-3 mt-2 pt-3 border-t border-gray-100">
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-xs text-gray-500 hover:text-gray-700 text-left w-max font-medium"
        >
          {isExpanded ? 'إخفاء الخطوات' : 'إظهار الخطوات'}
        </button>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <select 
              value={task.status}
              onChange={(e) => updateTaskStatusAction(task.id, e.target.value)}
              className="text-xs border-none bg-gray-50 text-gray-700 rounded py-1 px-2 font-medium cursor-pointer focus:ring-0"
            >
              <option value="todo">قيد الانتظار</option>
              <option value="in_progress">قيد التنفيذ</option>
              <option value="done">مكتملة</option>
            </select>
            
            <button 
              onClick={() => setIsAddingSubtask(!isAddingSubtask)}
              className="text-xs text-blue-600 font-medium hover:text-blue-800 flex items-center"
            >
              {isAddingSubtask ? 'إلغاء' : 'إضافة خطوة +'}
            </button>
            <span className="bg-purple-100 text-purple-700 text-[10px] font-bold px-1.5 py-0.5 rounded">AI</span>
          </div>
          
          <form action={quickDeleteTaskAction}>
            <input type="hidden" name="id" value={task.id} />
            <button type="submit" className="text-xs text-red-500 hover:text-red-700 font-medium">حذف</button>
          </form>
        </div>
      </div>
    </div>
  )
}
