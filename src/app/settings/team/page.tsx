'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface Team {
  id: string
  name: string
  createdAt: string
}

export default function TeamSettingsPage() {
  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)
  const [newTeamName, setNewTeamName] = useState('')
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => {
        if (!res.ok) {
          router.push('/login')
          return null
        }
        return fetch('/api/teams')
      })
      .then(res => res?.json())
      .then(data => {
        if (data?.teams) {
          setTeams(data.teams)
        }
        setLoading(false)
      })
  }, [router])

  async function createTeam(e: React.FormEvent) {
    e.preventDefault()
    if (!newTeamName.trim()) return

    setCreating(true)
    setError('')

    const res = await fetch('/api/teams', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newTeamName }),
    })
    const data = await res.json()

    if (res.ok) {
      setTeams([...teams, data.team])
      setNewTeamName('')
    } else {
      setError(data.error || 'Failed to create team')
    }
    setCreating(false)
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-500">Loading...</div>

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-bold text-blue-600">TaskFlow</h1>
          <a href="/dashboard" className="text-sm text-gray-500 hover:text-gray-700">
            Back to Dashboard
          </a>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-6">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Team Settings</h2>
          <p className="text-gray-500">Manage your teams</p>
        </div>

        <form onSubmit={createTeam} className="mb-8 flex gap-3">
          <input
            type="text"
            value={newTeamName}
            onChange={(e) => setNewTeamName(e.target.value)}
            placeholder="New team name..."
            className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={creating}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {creating ? 'Creating...' : 'Create Team'}
          </button>
        </form>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div className="space-y-4">
          {teams.map(team => (
            <div key={team.id} className="p-6 bg-white rounded-xl border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-1">{team.name}</h3>
              <p className="text-sm text-gray-400">
                Created {new Date(team.createdAt).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>

        {teams.length === 0 && (
          <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
            <p className="text-gray-500 mb-2">No teams yet</p>
            <p className="text-sm text-gray-400">Create your first team to get started</p>
          </div>
        )}
      </main>
    </div>
  )
}
