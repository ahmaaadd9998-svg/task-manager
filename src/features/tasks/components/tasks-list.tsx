'use client'

import React, { useState, useEffect } from 'react'
import { Check, Plus, Trash2, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react'
import { 
  quickCreateTaskAction, 
  updateTaskStatusAction, 
  quickDeleteTaskAction,
  createSubtaskAction,
  toggleSubtaskAction,
  deleteSubtaskAction
} from '../actions'

type Task = { id: string; title: string; description?: string | null; status: string; priority: string; subtasks?: { id: string; taskId: string; title: string; isCompleted: boolean }[] }

export function TasksList({ initialTasks }: { initialTasks: Task[] }) {
  const [tasks, setTasks] = useState(initialTasks)
  const [expandedTasks, setExpandedTasks] = useState<Record<string, boolean>>({})
  const [newSubtaskTitles, setNewSubtaskTitles] = useState<Record<string, string>>({})
  const [isAddingSubtask, setIsAddingSubtask] = useState<Record<string, boolean>>({})
  const [statusFilter, setStatusFilter] = useState<string>('all')

  useEffect(() => {
    setTasks(initialTasks)
  }, [initialTasks])

  const toggleExpand = (taskId: string) => {
    setExpandedTasks(prev => ({ ...prev, [taskId]: !prev[taskId] }))
  }

  const toggleAddingSubtask = (taskId: string) => {
    setIsAddingSubtask(prev => ({ ...prev, [taskId]: !prev[taskId] }))
  }

  const handleAddSubtask = async (e: React.FormEvent, taskId: string) => {
    e.preventDefault()
    const title = newSubtaskTitles[taskId]?.trim()
    if (!title) return
    
    await createSubtaskAction(taskId, title)
    setNewSubtaskTitles(prev => ({ ...prev, [taskId]: '' }))
  }

  const filteredTasks = tasks.filter(task => {
    if (statusFilter === 'all') return true
    return task.status === statusFilter
  })

  const getStatusText = (status: string) => {
    switch (status) {
      case 'todo': return 'قيد الانتظار'
      case 'in_progress': return 'قيد التنفيذ'
      case 'done': return 'مكتملة'
      default: return status
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'todo': return 'bg-gray-100 text-gray-700 border-gray-200'
      case 'in_progress': return 'bg-yellow-50 text-yellow-700 border-yellow-200'
      case 'done': return 'bg-green-50 text-green-700 border-green-200'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col min-h-[calc(100vh-120px)] gap-6">
      {/* Quick Add Task */}
      <form action={quickCreateTaskAction} className="flex flex-col sm:flex-row gap-2 sm:gap-4 bg-white p-2 rounded-lg border border-gray-200 shadow-sm shrink-0">
        <input 
          type="text" 
          name="title" 
          placeholder="ما الذي تريد إنجازه؟" 
          className="w-full sm:flex-[2] border-0 focus:ring-0 px-3 sm:px-4 py-2 text-sm outline-none bg-transparent" 
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

      {/* Filter and List Container */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex flex-col flex-1">
        {/* Filters Header */}
        <div className="flex items-center p-3 sm:p-4 border-b border-gray-100 bg-gray-50/50 overflow-x-auto">
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-2 sm:px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                statusFilter === 'all' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              الكل ({tasks.length})
            </button>
            <button
              onClick={() => setStatusFilter('todo')}
              className={`px-2 sm:px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                statusFilter === 'todo' ? 'bg-gray-200 text-gray-800' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              قيد الانتظار ({tasks.filter(t => t.status === 'todo').length})
            </button>
            <button
              onClick={() => setStatusFilter('in_progress')}
              className={`px-2 sm:px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                statusFilter === 'in_progress' ? 'bg-yellow-100 text-yellow-800' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              قيد التنفيذ ({tasks.filter(t => t.status === 'in_progress').length})
            </button>
            <button
              onClick={() => setStatusFilter('done')}
              className={`px-2 sm:px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                statusFilter === 'done' ? 'bg-green-100 text-green-800' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              مكتملة ({tasks.filter(t => t.status === 'done').length})
            </button>
          </div>
        </div>

        {/* Tasks Table/List */}
        <div className="flex-1 overflow-y-auto">
          {filteredTasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400 gap-2">
              <AlertCircle className="w-8 h-8 stroke-[1.5]" />
              <p className="text-sm font-medium">لا توجد مهام في هذا القسم</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredTasks.map((task) => {
                const isExpanded = !!expandedTasks[task.id]
                const completedSubtasks = task.subtasks?.filter((s) => s.isCompleted).length || 0
                const totalSubtasks = task.subtasks?.length || 0

                return (
                  <div key={task.id} className="flex flex-col hover:bg-slate-50/50 transition-colors">
                    {/* Task Row */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 gap-3 sm:gap-4">
                      {/* Left: Info */}
                      <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                        <button 
                          onClick={() => toggleExpand(task.id)}
                          className="text-gray-400 hover:text-gray-600 p-1 shrink-0"
                        >
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                        <div className="flex flex-col min-w-0 flex-1">
                          <h4 className="text-sm font-semibold text-gray-900 truncate">{task.title}</h4>
                          {task.description && (
                            <p className="text-xs text-gray-500 truncate mt-0.5">{task.description}</p>
                          )}
                        </div>
                        {totalSubtasks > 0 && (
                          <span className="bg-blue-50 border border-blue-100 text-blue-700 text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0">
                            الخطوات {completedSubtasks}/{totalSubtasks}
                          </span>
                        )}
                      </div>

                      {/* Right: Actions and Status */}
                      <div className="flex items-center gap-2 sm:gap-4 shrink-0 flex-wrap">
                        {/* Status Select */}
                        <select 
                          value={task.status}
                          onChange={(e) => updateTaskStatusAction(task.id, e.target.value)}
                          className={`text-xs border rounded-lg py-1.5 px-2 sm:px-3 font-semibold cursor-pointer focus:ring-0 ${getStatusColor(task.status)}`}
                        >
                          <option value="todo">قيد الانتظار</option>
                          <option value="in_progress">قيد التنفيذ</option>
                          <option value="done">مكتملة</option>
                        </select>

                        {/* Add subtask button */}
                        <button
                          onClick={() => {
                            if (!isExpanded) toggleExpand(task.id)
                            toggleAddingSubtask(task.id)
                          }}
                          className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors whitespace-nowrap"
                        >
                          {isAddingSubtask[task.id] ? 'إلغاء' : 'إضافة خطوة +'}
                        </button>

                        {/* Delete Form */}
                        <form action={quickDeleteTaskAction} className="flex items-center">
                          <input type="hidden" name="id" value={task.id} />
                          <button 
                            type="submit" 
                            className="text-gray-400 hover:text-red-600 p-1 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </form>
                      </div>
                    </div>

                    {/* Subtasks Panel (Expanded) */}
                    {isExpanded && (
                      <div className="bg-slate-50/50 px-4 sm:px-12 py-3 border-t border-gray-50 flex flex-col gap-2">
                        {/* List of subtasks */}
                        {task.subtasks && task.subtasks.length > 0 && (
                          <div className="flex flex-col gap-2">
                            {task.subtasks.map((subtask) => (
                              <div key={subtask.id} className="flex items-center justify-between group/sub max-w-md">
                                <label className="flex items-center gap-2 cursor-pointer">
                                  <div 
                                    className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                                      subtask.isCompleted ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-300 bg-white'
                                    }`}
                                    onClick={() => toggleSubtaskAction(subtask.id, !subtask.isCompleted)}
                                  >
                                    {subtask.isCompleted && <Check className="w-3 h-3" />}
                                  </div>
                                  <span className={`text-xs ${subtask.isCompleted ? 'text-gray-400 line-through' : 'text-gray-700'}`}>
                                    {subtask.title}
                                  </span>
                                </label>
                                <button 
                                  onClick={() => deleteSubtaskAction(subtask.id)}
                                  className="opacity-0 group-hover/sub:opacity-100 text-gray-400 hover:text-red-500 p-1 transition-opacity"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Add subtask input */}
                        {isAddingSubtask[task.id] && (
                          <form 
                            onSubmit={(e) => handleAddSubtask(e, task.id)} 
                            className="flex items-center gap-2 max-w-md mt-1"
                          >
                            <input
                              autoFocus
                              type="text"
                              value={newSubtaskTitles[task.id] || ''}
                              onChange={(e) => setNewSubtaskTitles(prev => ({ ...prev, [task.id]: e.target.value }))}
                              placeholder="خطوة جديدة..."
                              className="flex-1 text-xs border-b border-blue-400 focus:outline-none py-1 bg-transparent"
                            />
                          </form>
                        )}

                        {(!task.subtasks || task.subtasks.length === 0) && !isAddingSubtask[task.id] && (
                          <p className="text-xs text-gray-400 font-medium italic">لا توجد خطوات مضافة بعد لهذه المهمة.</p>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
