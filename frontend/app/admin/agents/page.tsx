'use client'

import { useEffect, useState, useCallback } from 'react'
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
          {a.botUsername && <div className="text-xs text-gray-400">@{a.botUsername}</div>}
          {a.project && <div className="text-xs text-blue-400">{a.project.name}</div>}
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
      minWidth: 150,
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
      style: { stroke: '#94a3b8' },
    }))

  return { nodes, edges }
}

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([])
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const [selected, setSelected] = useState<Agent | null>(null)
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [sendResult, setSendResult] = useState<string | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newAgent, setNewAgent] = useState({ name: '', botToken: '', botUsername: '', chatId: '', description: '' })

  const loadAgents = useCallback(async () => {
    const res = await fetch('/api/agents', { credentials: 'include' })
    if (!res.ok) return
    const data: Agent[] = await res.json()
    setAgents(data)
    const { nodes, edges } = agentsToFlow(data)
    setNodes(nodes)
    setEdges(edges)
  }, [setNodes, setEdges])

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

  return (
    <div className="flex h-screen bg-gray-950">
      {/* Canvas */}
      <div className="flex-1 relative">
        <div className="absolute top-4 left-4 z-10 flex gap-2">
          <h1 className="text-white font-bold text-lg bg-gray-900 px-4 py-2 rounded-xl">
            🤖 Agents
          </h1>
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-blue-700 transition"
          >
            + Add Agent
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
          <Background color="#374151" gap={20} />
          <Controls />
          <MiniMap nodeColor={n => (n.style?.background as string) || '#3b82f6'} maskColor="#111827cc" />
        </ReactFlow>
      </div>

      {/* Sidebar */}
      <div className="w-80 bg-gray-900 border-l border-gray-800 flex flex-col">
        {selected ? (
          <div className="p-5 flex flex-col h-full">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-white font-bold text-lg">{selected.name}</h2>
                {selected.botUsername && (
                  <p className="text-gray-400 text-sm">@{selected.botUsername}</p>
                )}
                {selected.project && (
                  <p className="text-blue-400 text-sm">{selected.project.name}</p>
                )}
              </div>
              <span className={`text-xs px-2 py-1 rounded-full ${selected.isActive ? 'bg-green-900 text-green-400' : 'bg-gray-700 text-gray-400'}`}>
                {selected.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>

            {selected.description && (
              <p className="text-gray-400 text-sm mb-4">{selected.description}</p>
            )}

            <div className="flex-1">
              <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">Send Command</p>
              {selected.chatId ? (
                <>
                  <textarea
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    placeholder="Type a message..."
                    rows={4}
                    className="w-full bg-gray-800 text-white rounded-lg px-3 py-2 text-sm resize-none border border-gray-700 focus:outline-none focus:border-blue-500 mb-2"
                  />
                  <button
                    onClick={sendMessage}
                    disabled={sending || !message.trim()}
                    className="w-full bg-blue-600 text-white py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition"
                  >
                    {sending ? 'Sending...' : '➤ Send'}
                  </button>
                  {sendResult && (
                    <p className="text-sm mt-2 text-center">{sendResult}</p>
                  )}
                </>
              ) : (
                <p className="text-yellow-500 text-sm">⚠️ No Chat ID configured</p>
              )}
            </div>

            <button
              onClick={() => setSelected(null)}
              className="mt-4 text-gray-500 text-sm hover:text-gray-300 transition"
            >
              ← Deselect
            </button>
          </div>
        ) : (
          <div className="p-5 flex-1 flex flex-col items-center justify-center text-center">
            <p className="text-4xl mb-3">🤖</p>
            <p className="text-gray-400">Click on an agent to send a command</p>
            {agents.length === 0 && (
              <p className="text-gray-600 text-sm mt-4">No agents yet. Add your first one!</p>
            )}
          </div>
        )}
      </div>

      {/* Add Agent Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-2xl p-6 w-full max-w-md border border-gray-700">
            <h2 className="text-white font-bold text-lg mb-4">Add Agent</h2>
            <div className="space-y-3">
              <input
                placeholder="Name *"
                value={newAgent.name}
                onChange={e => setNewAgent(p => ({ ...p, name: e.target.value }))}
                className="w-full bg-gray-800 text-white rounded-lg px-3 py-2 text-sm border border-gray-700 focus:outline-none focus:border-blue-500"
              />
              <input
                placeholder="Description"
                value={newAgent.description}
                onChange={e => setNewAgent(p => ({ ...p, description: e.target.value }))}
                className="w-full bg-gray-800 text-white rounded-lg px-3 py-2 text-sm border border-gray-700 focus:outline-none focus:border-blue-500"
              />
              <input
                placeholder="Bot Token * (from @BotFather)"
                value={newAgent.botToken}
                onChange={e => setNewAgent(p => ({ ...p, botToken: e.target.value }))}
                className="w-full bg-gray-800 text-white rounded-lg px-3 py-2 text-sm border border-gray-700 focus:outline-none focus:border-blue-500"
              />
              <input
                placeholder="Bot Username (@mybot)"
                value={newAgent.botUsername}
                onChange={e => setNewAgent(p => ({ ...p, botUsername: e.target.value }))}
                className="w-full bg-gray-800 text-white rounded-lg px-3 py-2 text-sm border border-gray-700 focus:outline-none focus:border-blue-500"
              />
              <input
                placeholder="Chat ID (to send commands to)"
                value={newAgent.chatId}
                onChange={e => setNewAgent(p => ({ ...p, chatId: e.target.value }))}
                className="w-full bg-gray-800 text-white rounded-lg px-3 py-2 text-sm border border-gray-700 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="flex gap-3 mt-5">
              <button
                onClick={addAgent}
                disabled={!newAgent.name || !newAgent.botToken}
                className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition"
              >
                Add Agent
              </button>
              <button
                onClick={() => setShowAddForm(false)}
                className="flex-1 bg-gray-700 text-white py-2 rounded-lg text-sm font-semibold hover:bg-gray-600 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
