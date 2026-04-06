'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface Team {
  id: string
  name: string
  subscriptionStatus: string
  stripeCustomerId: string | null
  stripeSubscriptionId: string | null
}

export default function BillingPage() {
  const [user, setUser] = useState<{ id: string; email: string; name: string | null } | null>(null)
  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)
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
          return fetch('/api/billing')
        }
        return null
      })
      .then(res => res?.json())
      .then(data => {
        if (data?.teams) {
          setTeams(data.teams)
        }
        setLoading(false)
      })
  }, [router])

  async function handleUpgrade(teamId: string) {
    const res = await fetch('/api/billing', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ teamId }),
    })
    const data = await res.json()
    if (data.url) {
      window.location.href = data.url
    }
  }

  if (loading || !user) return <div className="min-h-screen flex items-center justify-center">Loading...</div>

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <a href="/dashboard" className="text-xl font-bold text-blue-600">TaskFlow</a>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">{user.name || user.email}</span>
            <a href="/dashboard" className="text-sm text-gray-500 hover:text-gray-700">Back to Dashboard</a>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Billing & Subscription</h1>

        <div className="space-y-6">
          {teams.map(team => (
            <div key={team.id} className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">{team.name}</h2>
                  <span className={`inline-block mt-1 px-3 py-1 text-xs font-medium rounded-full ${
                    team.subscriptionStatus === 'pro'
                      ? 'bg-green-100 text-green-800'
                      : team.subscriptionStatus === 'cancelled'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    {team.subscriptionStatus === 'pro' ? 'Pro' : team.subscriptionStatus === 'cancelled' ? 'Cancelled' : 'Free'}
                  </span>
                </div>
                {team.subscriptionStatus !== 'pro' && (
                  <button
                    onClick={() => handleUpgrade(team.id)}
                    className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
                  >
                    Upgrade to Pro -- $29/mo
                  </button>
                )}
              </div>

              <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-500 mb-1">Current Plan</p>
                  <p className="font-semibold text-gray-900">
                    {team.subscriptionStatus === 'pro' ? 'Pro ($29/mo)' : 'Free'}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-500 mb-1">Boards</p>
                  <p className="font-semibold text-gray-900">
                    {team.subscriptionStatus === 'pro' ? 'Unlimited' : '1'}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
