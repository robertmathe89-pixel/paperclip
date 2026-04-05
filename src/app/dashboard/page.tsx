'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface Board {
  id: string
  name: string
  teamId: string
  createdById: string
  createdAt: string
  updatedAt: string
}

interface Team {
  id: string
  name: string
}

export default function DashboardPage() {
  const [boards, setBoards] = useState<Board[]>([])
  const [loading, setLoading] = useState(true)
  const [newBoardName, setNewBoardName] = useState('')
  const [user, setUser] = useState<{ id: string; email: string; name: string | null } | null>(null)
  const [teams, setTeams] = useState<Team[]>([])
  const [activeTeamId, setActiveTeamId] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => {
        if (!res.ok) {
          router.push('/login')
          return null
        }
        return res.json()
      })
      .then(data => {
        if (data?.user) {
          setUser(data.user)
          return fetch('/api/teams')
        }
        return null
      })
      .then(res => res?.json())
      .then(data => {
        if (data?.teams && data.teams.length > 0) {
          setTeams(data.teams)
          setActiveTeamId(data.teams[0].id)
          fetchBoards(data.teams[0].id)
        } else {
          setLoading(false)
        }
      })
  }, [router])

  async function fetchBoards(teamId: string) {
    const res = await fetch(`/api/boards?teamId=${teamId}`)
    const data = await res.json()
    if (res.ok) {
      setBoards(data.boards || [])
    }
    setLoading(false)
  }

  function handleTeamChange(teamId: string) {
    setActiveTeamId(teamId)
    setLoading(true)
    fetchBoards(teamId)
  }

  async function createBoard(e: React.FormEvent) {
    e.preventDefault()
    if (!newBoardName.trim() || !user || !activeTeamId) return

    const res = await fetch('/api/boards', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newBoardName, teamId: activeTeamId, createdById: user.id }),
    })
    const data = await res.json()
    if (res.ok) {
      setBoards([...boards, data.board])
      setNewBoardName('')
    }
  }

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
    router.refresh()
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-bold text-blue-600">TaskFlow</h1>
          <div className="flex items-center gap-4">
            {teams.length > 1 && (
              <select
                value={activeTeamId || ''}
                onChange={(e) => handleTeamChange(e.target.value)}
                className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {teams.map(team => (
                  <option key={team.id} value={team.id}>{team.name}</option>
                ))}
              </select>
            )}
            <span className="text-sm text-gray-500">{user.name || user.email}</span>
            <button onClick={logout} className="text-sm text-gray-500 hover:text-gray-700">
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-6">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-1">
            {teams.find(t => t.id === activeTeamId)?.name || 'Your'} Boards
          </h2>
          <p className="text-gray-500">Manage your task boards and projects</p>
        </div>

        <form onSubmit={createBoard} className="mb-8 flex gap-3">
          <input
            type="text"
            value={newBoardName}
            onChange={(e) => setNewBoardName(e.target.value)}
            placeholder="New board name..."
            className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
          >
            Create Board
          </button>
        </form>

        {loading ? (
          <div className="text-gray-500">Loading boards...</div>
        ) : boards.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
            <p className="text-gray-500 mb-2">No boards yet</p>
            <p className="text-sm text-gray-400">Create your first board to get started</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {boards.map(board => (
              <a
                key={board.id}
                href={`/boards/${board.id}`}
                className="block p-6 bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-sm transition"
              >
                <h3 className="font-semibold text-gray-900 mb-1">{board.name}</h3>
                <p className="text-sm text-gray-400">
                  Created {new Date(board.createdAt).toLocaleDateString()}
                </p>
              </a>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
