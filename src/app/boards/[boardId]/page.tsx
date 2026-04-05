'use client'

import { useState, useEffect } from 'react'

interface Task {
  id: string
  title: string
  description: string | null
  status: 'todo' | 'in_progress' | 'done'
  priority: 'low' | 'medium' | 'high' | 'critical'
  assigneeId: string | null
  boardId: string
  createdAt: string
  updatedAt: string
}

const columns = [
  { key: 'todo' as const, label: 'To Do', color: 'bg-gray-100 border-gray-200' },
  { key: 'in_progress' as const, label: 'In Progress', color: 'bg-blue-50 border-blue-200' },
  { key: 'done' as const, label: 'Done', color: 'bg-green-50 border-green-200' },
]

const priorityColors: Record<string, string> = {
  low: 'bg-gray-200 text-gray-700',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-orange-100 text-orange-800',
  critical: 'bg-red-100 text-red-800',
}

export default function BoardPage({ params }: { params: Promise<{ boardId: string }> }) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [boardId, setBoardId] = useState<string>('')

  useEffect(() => {
    params.then(p => setBoardId(p.boardId))
  }, [params])

  useEffect(() => {
    if (!boardId) return
    fetchTasks()
  }, [boardId])

  async function fetchTasks() {
    const res = await fetch(`/api/boards/${boardId}/tasks`)
    const data = await res.json()
    setTasks(data.tasks || [])
    setLoading(false)
  }

  async function createTask(e: React.FormEvent) {
    e.preventDefault()
    if (!newTaskTitle.trim()) return

    const res = await fetch(`/api/boards/${boardId}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: newTaskTitle }),
    })
    const data = await res.json()
    if (res.ok) {
      setTasks([...tasks, data.task])
      setNewTaskTitle('')
    }
  }

  async function updateTaskStatus(taskId: string, status: Task['status']) {
    const res = await fetch(`/api/boards/${boardId}/tasks/${taskId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    const data = await res.json()
    if (res.ok) {
      setTasks(tasks.map(t => t.id === taskId ? data.task : t))
    }
  }

  async function deleteTask(taskId: string) {
    await fetch(`/api/boards/${boardId}/tasks/${taskId}`, { method: 'DELETE' })
    setTasks(tasks.filter(t => t.id !== taskId))
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Loading board...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <a href="/dashboard" className="text-lg font-bold text-blue-600">TaskFlow</a>
            <span className="text-gray-300">/</span>
            <h1 className="text-xl font-semibold text-gray-900">Board</h1>
          </div>
          <a href="/login" className="text-sm text-gray-500 hover:text-gray-700">Sign out</a>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6">
        <form onSubmit={createTask} className="mb-6 flex gap-3">
          <input
            type="text"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            placeholder="Add a new task..."
            className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
          >
            Add Task
          </button>
        </form>

        <div className="grid grid-cols-3 gap-6">
          {columns.map(col => (
            <div key={col.key} className={`${col.color} rounded-xl p-4 border`}>
              <h2 className="font-semibold text-gray-800 mb-4">{col.label}</h2>
              <div className="space-y-3">
                {tasks
                  .filter(t => t.status === col.key)
                  .map(task => (
                    <div
                      key={task.id}
                      className="bg-white rounded-lg p-4 shadow-sm border border-gray-200"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-medium text-gray-900 text-sm">{task.title}</h3>
                        <button
                          onClick={() => deleteTask(task.id)}
                          className="text-gray-400 hover:text-red-500 text-xs"
                        >
                          ✕
                        </button>
                      </div>
                      {task.description && (
                        <p className="text-xs text-gray-500 mt-1">{task.description}</p>
                      )}
                      <div className="flex items-center justify-between mt-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${priorityColors[task.priority]}`}>
                          {task.priority}
                        </span>
                        <select
                          value={task.status}
                          onChange={(e) => updateTaskStatus(task.id, e.target.value as Task['status'])}
                          className="text-xs border border-gray-300 rounded px-2 py-1"
                        >
                          <option value="todo">To Do</option>
                          <option value="in_progress">In Progress</option>
                          <option value="done">Done</option>
                        </select>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
