'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
  type OnConnect,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'

interface Agent {
  id: number
  name: string
  description: string | null
  botUsername: string | null
  chatId: string | null
  parentId: number | null
  projectId: number | null
  posX: number
  posY: number
  color: string
  isActive: boolean
  project: { slug: string; name: string } | null
}

function agentsToFlow(agents: Agent[]): { nodes: Node[]; edges: Edge[] } {
  const nodes: Node[] = agents.map(a => ({
    id: String(a.id),
    position: { x: a.posX, y: a.posY },
    data: {
      label: (
        <div className="text-left">
          <div className="font-semibold text-sm">{a.name}</div>
          {a.botUsername && <div className="text-xs opacity-60">@{a.botUsername}</div>}
          {a.project && <div className="text-xs opacity-60">{a.project.name}</div>}
        </div>
      ),
      agent: a,
    },
    style: {
      background: a.color,
      color: '#fff',
      border: 'none',
      borderRadius: 12,
      padding: '10px 14px',
      minWidth: 160,
      opacity: a.isActive ? 1 : 0.5,
    },
  }))

  const edges: Edge[] = agents
    .filter(a => a.parentId)
    .map(a => ({
      id: `e${a.parentId}-${a.id}`,
      source: String(a.parentId),
      target: String(a.id),
      animated: true,
      style: { stroke: '#52525b' },
    }))

  return { nodes, edges }
}

export default function AgentsPage() {
  const router = useRouter()
  const [agents, setAgents] = useState<Agent[]>([])
  const [loading, setLoading] = useState(true)
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([])
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([])
  const [selected, setSelected] = useState<Agent | null>(null)
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [sendResult, setSendResult] = useState<string | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newAgent, setNewAgent] = useState({ name: '', botToken: '', botUsername: '', chatId: '', description: '' })

  const loadAgents = useCallback(async () => {
    try {
      const res = await fetch('/api/agents', { credentials: 'include' })
      if (res.status === 401) {
        router.push('/admin/login')
        return
      }
      if (!res.ok) return
      const data: Agent[] = await res.json()
      setAgents(data)
      const { nodes, edges } = agentsToFlow(data)
      setNodes(nodes)
      setEdges(edges)
    } finally {
      setLoading(false)
    }
  }, [setNodes, setEdges, router])

  useEffect(() => { loadAgents() }, [loadAgents])

  const onConnect: OnConnect = useCallback(
    (params) => setEdges(eds => addEdge(params, eds)),
    [setEdges]
  )

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelected((node.data as { agent: Agent }).agent)
    setSendResult(null)
    setMessage('')
  }, [])

  const onNodeDragStop = useCallback(async (_: React.MouseEvent, node: Node) => {
    await fetch(`/api/agents/${node.id}/position`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ posX: node.position.x, posY: node.position.y }),
    })
  }, [])

  const sendMessage = async () => {
    if (!selected || !message.trim()) return
    setSending(true)
    setSendResult(null)
    try {
      const res = await fetch(`/api/agents/${selected.id}/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ message }),
      })
      const data = await res.json()
      setSendResult(data.ok ? '✅ Sent!' : `❌ ${data.error}`)
      if (data.ok) setMessage('')
    } catch {
      setSendResult('❌ Connection error')
    } finally {
      setSending(false)
    }
  }

  const addAgent = async () => {
    if (!newAgent.name || !newAgent.botToken) return
    const res = await fetch('/api/agents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(newAgent),
    })
    if (res.ok) {
      setShowAddForm(false)
      setNewAgent({ name: '', botToken: '', botUsername: '', chatId: '', description: '' })
      loadAgents()
    }
  }

  if (loading) {
    return (
      <div className="h-screen bg-zinc-950 flex items-center justify-center">
        <p className="text-zinc-500 text-sm animate-pulse">Loading agents...</p>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-zinc-950 overflow-hidden">
      {/* Canvas */}
      <div className="flex-1 relative overflow-hidden">
        <div className="absolute top-4 left-4 z-10 flex gap-2 items-center">
          <h1 className="text-white font-bold text-base bg-zinc-900 border border-zinc-800 px-4 py-2 rounded-xl">
            🤖 Agents
          </h1>
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-blue-700 transition"
          >
            + Add Agent
          </button>
          <button
            onClick={() => router.push('/admin/dashboard')}
            className="text-zinc-500 hover:text-zinc-300 text-sm px-3 py-2 transition"
          >
            ← Dashboard
          </button>
        </div>

        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          onNodeDragStop={onNodeDragStop}
          fitView
        >
          <Background color="#27272a" gap={20} />
          <Controls />
          <MiniMap nodeColor={n => (n.style?.background as string) || '#3b82f6'} maskColor="#09090bcc" />
        </ReactFlow>
      </div>

      {/* Sidebar — slides in when agent selected */}
      <div className={`${selected ? 'w-80' : 'w-0'} bg-zinc-900 border-l border-zinc-800 flex flex-col transition-all duration-200 overflow-hidden flex-shrink-0`}>
        {selected ? (
          <div className="p-5 flex flex-col h-full">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-white font-bold">{selected.name}</h2>
                {selected.botUsername && <p className="text-zinc-500 text-xs mt-0.5">@{selected.botUsername}</p>}
                {selected.project && <p className="text-blue-400 text-xs mt-0.5">{selected.project.name}</p>}
              </div>
              <span className={`text-xs px-2 py-1 rounded-full ${selected.isActive ? 'bg-green-950 text-green-400' : 'bg-zinc-800 text-zinc-500'}`}>
                {selected.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>

            {selected.description && (
              <p className="text-zinc-400 text-sm mb-4 leading-relaxed">{selected.description}</p>
            )}

            <div className="flex-1">
              <p className="text-zinc-500 text-xs font-semibold uppercase tracking-wider mb-3">Send Command</p>
              {selected.chatId ? (
                <>
                  <textarea
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    placeholder="Type a message..."
                    rows={4}
                    className="w-full bg-zinc-800 text-zinc-100 rounded-lg px-3 py-2 text-sm resize-none border border-zinc-700 focus:outline-none focus:border-zinc-500 mb-2 placeholder-zinc-600"
                  />
                  <button
                    onClick={sendMessage}
                    disabled={sending || !message.trim()}
                    className="w-full bg-zinc-100 text-zinc-900 py-2 rounded-lg text-sm font-semibold hover:bg-white disabled:opacity-40 transition"
                  >
                    {sending ? 'Sending...' : '➤ Send'}
                  </button>
                  {sendResult && <p className="text-sm mt-2 text-center text-zinc-300">{sendResult}</p>}
                </>
              ) : (
                <p className="text-amber-500 text-sm border border-amber-900 bg-amber-950/30 rounded-lg px-3 py-2">
                  ⚠️ No Chat ID configured
                </p>
              )}
            </div>

            <div className="mt-4 flex gap-2">
              <button onClick={() => setSelected(null)} className="flex-1 text-zinc-500 text-sm hover:text-zinc-300 border border-zinc-800 rounded-lg py-2 transition">
                ← Back
              </button>
              <button
                onClick={async () => {
                  if (!confirm(`Delete "${selected.name}"?`)) return
                  await fetch(`/api/agents/${selected.id}`, { method: 'DELETE', credentials: 'include' })
                  setSelected(null)
                  loadAgents()
                }}
                className="flex-1 text-red-400 text-sm hover:text-red-300 border border-red-900 hover:border-red-700 rounded-lg py-2 transition"
              >
                🗑 Delete
              </button>
            </div>
          </div>
        ) : (
          <div className="p-5 flex-1 flex flex-col items-center justify-center text-center">
            <p className="text-4xl mb-3">🤖</p>
            <p className="text-zinc-500 text-sm">Click on an agent to send a command</p>
            {agents.length === 0 && (
              <p className="text-zinc-700 text-xs mt-3">No agents yet. Add your first one!</p>
            )}
          </div>
        )}
      </div>

      {/* Add Agent Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 rounded-2xl p-6 w-full max-w-md border border-zinc-700">
            <h2 className="text-white font-bold text-lg mb-4">Add Agent</h2>
            <div className="space-y-3">
              {[
                { placeholder: 'Name *', key: 'name' },
                { placeholder: 'Description', key: 'description' },
                { placeholder: 'Bot Token * (from @BotFather)', key: 'botToken' },
                { placeholder: 'Bot Username (@mybot)', key: 'botUsername' },
                { placeholder: 'Chat ID', key: 'chatId' },
              ].map(f => (
                <input key={f.key} placeholder={f.placeholder}
                  value={newAgent[f.key as keyof typeof newAgent]}
                  onChange={e => setNewAgent(p => ({ ...p, [f.key]: e.target.value }))}
                  className="w-full bg-zinc-800 text-white rounded-lg px-3 py-2 text-sm border border-zinc-700 focus:outline-none focus:border-zinc-500 placeholder-zinc-600"
                />
              ))}
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={addAgent} disabled={!newAgent.name || !newAgent.botToken}
                className="flex-1 bg-zinc-100 text-zinc-900 py-2 rounded-lg text-sm font-semibold hover:bg-white disabled:opacity-40 transition">
                Add Agent
              </button>
              <button onClick={() => setShowAddForm(false)}
                className="flex-1 bg-zinc-800 text-zinc-300 py-2 rounded-lg text-sm font-semibold hover:bg-zinc-700 transition">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
