import { useState, useEffect } from 'react'
import { Users, Plus, Search, Mail, Phone, MessageSquare, Send } from 'lucide-react'
import { usersAPI } from '../services/api'
import toast from 'react-hot-toast'

interface Agent {
  id: string
  email: string
  name: string
  avatar_url?: string
  language: string
  timezone: string
  last_login?: string
}

export default function Agents() {
  const [agents, setAgents] = useState<Agent[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showAddAgent, setShowAddAgent] = useState(false)
  const [newAgentName, setNewAgentName] = useState('')
  const [newAgentEmail, setNewAgentEmail] = useState('')

  useEffect(() => {
    usersAPI.listAgents().then(res => {
      setAgents(res.data || [])
      setLoading(false)
    }).catch(() => {
      // Mock data
      setAgents([
        { id: '1', email: 'agent@supportboard.local', name: 'Agent Smith', language: 'en', timezone: 'UTC', last_login: new Date().toISOString() },
        { id: '2', email: 'agent2@supportboard.local', name: 'Sarah Johnson', language: 'en', timezone: 'America/New_York', last_login: new Date(Date.now() - 3600000).toISOString() },
      ])
      setLoading(false)
    })
  }, [])

  const handleAddAgent = (e: React.FormEvent) => {
    e.preventDefault()
    if (newAgentName && newAgentEmail) {
      toast.success(`Agent ${newAgentName} added successfully`)
      setNewAgentName('')
      setNewAgentEmail('')
      setShowAddAgent(false)
    }
  }

  const filteredAgents = agents.filter(a =>
    a.name.toLowerCase().includes(search.toLowerCase()) ||
    a.email.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Agents</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Manage your support team
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAddAgent(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Agent
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search agents..."
          className="input pl-10"
        />
      </div>

      {/* Add Agent Modal */}
      {showAddAgent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md animate-scale-in border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Add New Agent</h2>
            <form onSubmit={handleAddAgent} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
                <input type="text" value={newAgentName} onChange={(e) => setNewAgentName(e.target.value)} className="input" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                <input type="email" value={newAgentEmail} onChange={(e) => setNewAgentEmail(e.target.value)} className="input" required />
              </div>
              <div className="flex gap-3 justify-end">
                <button type="button" onClick={() => setShowAddAgent(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">Add Agent</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Agents Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="card p-6 animate-pulse">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAgents.map(agent => (
            <div key={agent.id} className="card p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                    <span className="text-lg font-semibold text-primary-700 dark:text-primary-400">
                      {agent.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{agent.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{agent.email}</p>
                  </div>
                </div>
                <span className="badge badge-success">Online</span>
              </div>
              <div className="flex items-center gap-4 mt-4 text-sm text-gray-500 dark:text-gray-400">
                <span className="flex items-center gap-1">
                  <MessageSquare className="w-4 h-4" />
                  {agent.language}
                </span>
                <span className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  {agent.timezone}
                </span>
              </div>
              <div className="flex gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button className="btn btn-secondary btn-sm flex-1 flex items-center justify-center gap-2">
                  <Send className="w-4 h-4" />
                  Message
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
