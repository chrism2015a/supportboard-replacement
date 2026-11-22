import { useState, useEffect } from 'react'
import {
  Ticket as TicketIcon,
  Search,
  Plus,
  Filter,
  AlertCircle,
  Clock,
  CheckCircle,
  ChevronUp,
  ChevronDown,
  Minus,
} from 'lucide-react'
import { ticketsAPI } from '../services/api'
import type { Ticket } from '../types'

const priorityConfig = {
  low: { label: 'Low', color: 'badge-gray', icon: ChevronDown },
  normal: { label: 'Normal', color: 'badge-primary', icon: Minus },
  high: { label: 'High', color: 'badge-warning', icon: AlertCircle },
  urgent: { label: 'Urgent', color: 'badge-danger', icon: ChevronUp },
}

const statusConfig = {
  open: { label: 'Open', color: 'badge-primary' },
  pending: { label: 'Pending', color: 'badge-warning' },
  solved: { label: 'Solved', color: 'badge-success' },
  closed: { label: 'Closed', color: 'badge-gray' },
}

export default function Tickets() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('')
  const [showNewTicket, setShowNewTicket] = useState(false)
  const [newSubject, setNewSubject] = useState('')
  const [newDescription, setNewDescription] = useState('')
  const [newPriority, setNewPriority] = useState<'low' | 'normal' | 'high' | 'urgent'>('normal')
  const [newCategory, setNewCategory] = useState('')

  const fetchTickets = async () => {
    setLoading(true)
    try {
      const res = await ticketsAPI.list({
        status: statusFilter || undefined,
        priority: priorityFilter || undefined,
      })
      setTickets(res.data.tickets || [])
    } catch (error) {
      // Mock data
      setTickets([
        {
          id: '1',
          ticket_number: 'TB-10001',
          subject: 'Cannot access my account',
          description: 'I am locked out of my account after password reset',
          status: 'open',
          priority: 'high',
          category: 'account',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          user_name: 'John Doe',
          agent_name: 'Agent Smith',
        },
        {
          id: '2',
          ticket_number: 'TB-10002',
          subject: 'Billing inquiry - duplicate charge',
          description: 'I was charged twice for my subscription',
          status: 'pending',
          priority: 'normal',
          category: 'billing',
          created_at: new Date(Date.now() - 3600000).toISOString(),
          updated_at: new Date(Date.now() - 1800000).toISOString(),
          user_name: 'Jane Smith',
        },
        {
          id: '3',
          ticket_number: 'TB-10003',
          subject: 'Feature request - dark mode',
          description: 'Please add dark mode support',
          status: 'solved',
          priority: 'low',
          category: 'feature',
          created_at: new Date(Date.now() - 86400000).toISOString(),
          updated_at: new Date(Date.now() - 43200000).toISOString(),
          closed_at: new Date(Date.now() - 43200000).toISOString(),
          user_name: 'Bob Wilson',
          agent_name: 'Agent Smith',
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTickets()
  }, [statusFilter, priorityFilter])

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await ticketsAPI.create({
        subject: newSubject,
        description: newDescription,
        priority: newPriority,
        category: newCategory,
      })
      setShowNewTicket(false)
      setNewSubject('')
      setNewDescription('')
      setNewCategory('')
      fetchTickets()
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Tickets</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Manage customer support tickets
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowNewTicket(true)}>
          <Plus className="w-4 h-4 mr-2" />
          New Ticket
        </button>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tickets..."
              className="input pl-10"
            />
          </div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input w-full sm:w-36">
            <option value="">All Status</option>
            <option value="open">Open</option>
            <option value="pending">Pending</option>
            <option value="solved">Solved</option>
            <option value="closed">Closed</option>
          </select>
          <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)} className="input w-full sm:w-36">
            <option value="">All Priority</option>
            <option value="low">Low</option>
            <option value="normal">Normal</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>
      </div>

      {/* New Ticket Modal */}
      {showNewTicket && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-lg animate-scale-in border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Create New Ticket</h2>
            <form onSubmit={handleCreateTicket} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Subject</label>
                <input type="text" value={newSubject} onChange={(e) => setNewSubject(e.target.value)} className="input" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                <textarea value={newDescription} onChange={(e) => setNewDescription(e.target.value)} className="input min-h-[100px]" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Priority</label>
                  <select value={newPriority} onChange={(e) => setNewPriority(e.target.value as any)} className="input">
                    <option value="low">Low</option>
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
                  <input type="text" value={newCategory} onChange={(e) => setNewCategory(e.target.value)} className="input" placeholder="e.g., billing" />
                </div>
              </div>
              <div className="flex gap-3 justify-end">
                <button type="button" onClick={() => setShowNewTicket(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">Create Ticket</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tickets List */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse flex items-center gap-4 p-4">
                <div className="w-10 h-10 rounded-lg bg-gray-200 dark:bg-gray-700" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {tickets.map((ticket) => {
              const Priority = priorityConfig[ticket.priority]
              const Status = statusConfig[ticket.status]
              return (
                <div key={ticket.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex-shrink-0">
                      <TicketIcon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-mono text-gray-500 dark:text-gray-400">{ticket.ticket_number}</span>
                        <span className={`badge ${Status.color}`}>{Status.label}</span>
                        <span className={`badge ${Priority.color}`}>
                          <Priority.icon className="w-3 h-3 mr-1 inline" />
                          {Priority.label}
                        </span>
                        {ticket.category && (
                          <span className="badge badge-gray">{ticket.category}</span>
                        )}
                      </div>
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white mt-1">{ticket.subject}</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{ticket.description}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                        <span>By {ticket.user_name}</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(ticket.created_at).toLocaleDateString()}
                        </span>
                        {ticket.agent_name && <span>→ {ticket.agent_name}</span>}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
