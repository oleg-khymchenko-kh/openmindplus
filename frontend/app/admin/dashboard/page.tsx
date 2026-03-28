'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function AdminDashboard() {
  const [authed, setAuthed] = useState(false)

  useEffect(() => {
    fetch('/api/auth/me', { credentials: 'include' })
      .then(r => {
        if (!r.ok) { window.location.href = '/admin/login'; return }
        setAuthed(true)
      })
      .catch(() => { window.location.href = '/admin/login' })
  }, [])

  function logout() {
    fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
      .finally(() => { window.location.href = '/admin/login' })
  }

  if (!authed) {
    return <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
      <p className="text-zinc-500 text-sm animate-pulse">Loading...</p>
    </div>
  }

  return (
    <main className="min-h-screen bg-zinc-950 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-zinc-100">Dashboard</h1>
            <p className="text-zinc-500">OpenMindPlus Admin Panel</p>
          </div>
          <button onClick={logout} className="text-sm text-zinc-500 hover:text-zinc-300 border border-zinc-700 px-4 py-2 rounded-lg transition-colors">
            Logout
          </button>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <Link href="/admin/agents"
            className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 hover:border-zinc-600 transition group">
            <div className="text-3xl mb-3">🤖</div>
            <h2 className="font-bold text-zinc-100 text-lg group-hover:text-white transition">Agents</h2>
            <p className="text-zinc-500 text-sm mt-1">Visual map of all AI agents. Send commands directly.</p>
          </Link>

          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 opacity-40">
            <div className="text-3xl mb-3">👥</div>
            <h2 className="font-bold text-zinc-100 text-lg">Team</h2>
            <p className="text-zinc-500 text-sm mt-1">Manage team members. Coming soon.</p>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 opacity-40">
            <div className="text-3xl mb-3">🚀</div>
            <h2 className="font-bold text-zinc-100 text-lg">Projects</h2>
            <p className="text-zinc-500 text-sm mt-1">Manage projects. Coming soon.</p>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 opacity-40">
            <div className="text-3xl mb-3">✉️</div>
            <h2 className="font-bold text-zinc-100 text-lg">Messages</h2>
            <p className="text-zinc-500 text-sm mt-1">Contact form submissions. Coming soon.</p>
          </div>
        </div>
      </div>
    </main>
  )
}
